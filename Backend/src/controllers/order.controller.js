const OrderModelImport = require("../models/order.model");
const OrderModel = OrderModelImport.default || OrderModelImport;
const ShopModelImport = require("../models/shop.model");
const UserModelImport = require("../models/user.model");
const ItemModelImport = require("../models/item.model");
const Order = require("../models/order.model");
const DeliveryAssignment = require("../models/deliveryAssignment.model");
const UserModel = UserModelImport.default || UserModelImport;
const ShopModel = ShopModelImport.default || ShopModelImport;
const ItemModel = ItemModelImport.default || ItemModelImport;

// POST /api/order/place-order
exports.placeOrder = async (req, res) => {
  try {
    // auth middleware should attach user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Please login first" });
    }

    const {
      paymentMethod,
      deliveryAddress,
      cartItems = [],
      totalAmount: sentTotal,
    } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    // Gather shop ids from cart to fetch owners
    const shopIds = Array.from(
      new Set(cartItems.map((it) => String(it.shop || null)).filter(Boolean))
    );
    const shops =
      shopIds.length > 0
        ? await ShopModel.find({ _id: { $in: shopIds } }).select("owner")
        : [];
    const shopOwnerMap = new Map(shops.map((s) => [String(s._id), s.owner]));

    // compute totals if not provided or to protect against tampering
    const computedSubtotal = cartItems.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
      0
    );

    // if frontend already includes delivery or other fees, accept sentTotal if present,
    // otherwise compute final total here (example: assume frontend sends final amount)
    const totalAmount =
      typeof sentTotal === "number" && !Number.isNaN(sentTotal)
        ? sentTotal
        : computedSubtotal;

    if (typeof totalAmount !== "number" || Number.isNaN(totalAmount)) {
      return res.status(400).json({ message: "Invalid totalAmount" });
    }

    // group cart items by shop to build required shopOrder structure
    const shopMap = new Map();
    for (const it of cartItems) {
      const shopId = it.shop || null;
      const shopEntry = shopMap.get(shopId) || {
        Shop: shopId,
        // prefer actual shop.owner from DB, fallback to any owner info in item
        owner:
          shopOwnerMap.get(String(shopId)) ||
          it.shopOwner ||
          it.owner ||
          it.ownerId ||
          null,
        subtotal: 0,
        shopOrderItems: [],
      };

      const qty = Number(it.quantity || 0);
      const price = Number(it.price || 0);
      shopEntry.subtotal += price * qty;
      shopEntry.shopOrderItems.push({
        product: it.id || it._id,
        quantity: qty,
        price,
        foodType: it.foodType || "Veg",
        name: it.name || "",
      });

      shopMap.set(shopId, shopEntry);
    }

    const shopOrder = Array.from(shopMap.values());

    const orderPayload = {
      user: user._id,
      paymentMethod: paymentMethod || "COD",
      deliveryAddress: deliveryAddress || {},
      totalAmount,
      shopOrder,
    };

    const order = await OrderModel.create(orderPayload);

    // populate and await so client gets populated order immediately
    await order.populate([
      {
        path: "shopOrder.shopOrderItems.product",
        model: ItemModel,
        select: "name image price",
      },
      { path: "shopOrder.Shop", select: "name" },
      { path: "user", model: UserModel, select: "-password" },
    ]);

    return res
      .status(201)
      .json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Place order error:", err);
    return res.status(500).json({
      message: `Place order error ${
        err && err.message ? err.message : String(err)
      }`,
    });
  }
};

// GET my-orders

exports.getUserOrders = async (req, res) => {
  try {
    // support both auth middleware shapes: req.user (object) or req.userId (id)
    let user = null;
    if (req.user && req.user._id) {
      // req.user may already be populated user doc by middleware
      user = req.user;
    } else if (req.userId) {
      user = await UserModel.findById(req.userId).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "Please login first" });
    }

    if (user.role === "user") {
      const orders = await OrderModel.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate({ path: "user", model: UserModel, select: "-password" })
        .populate("shopOrder.Shop", "name")
        .populate({
          path: "shopOrder.owner",
          model: UserModel,
          select: "name email mobile",
        })
        // populate the product field inside shopOrder.shopOrderItems
        .populate({
          path: "shopOrder.shopOrderItems.product",
          model: ItemModel,
          select: "name image price foodType",
        });

      return res.status(200).json({ orders });
    } else if (user.role === "owner") {
      const owner = String(user._id);
      const orders = await OrderModel.find({ "shopOrder.owner": owner })
        .sort({ createdAt: -1 })
        .populate({ path: "user", model: UserModel, select: "-password" })
        .populate("shopOrder.Shop", "name")
        .populate({
          path: "shopOrder.shopOrderItems.product",
          model: ItemModel,
          select: "name image price foodType",
        });

      // Keep only shopOrder entries that belong to this owner and return those orders
      const ownerOrders = orders
        .map((order) => {
          const o = order.toObject ? order.toObject() : order;
          const shopOrderForOwner = (o.shopOrder || []).filter(
            (s) => String(s.owner?._id ?? s.owner) === owner
          );
          if (!shopOrderForOwner.length) return null;
          return { ...o, shopOrder: shopOrderForOwner };
        })
        .filter(Boolean);

      return res.status(200).json({ orders: ownerOrders });
    }

    // For any other roles (delivery, admin, etc.) return empty list instead of 400
    return res.status(200).json({ orders: [] });
  } catch (err) {
    console.error("Get my orders error:", err);
    return res.status(500).json({ message: "Get my orders error" });
  }
};

//Update order status - owner only
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the specific shopOrder entry for the given shopId
    const shopOrder = await order.shopOrder.find(
      (o) => String(o.Shop?._id ?? o.Shop ?? o._id) === String(shopId)
    );
    if (!shopOrder) {
      return res
        .status(404)
        .json({ message: "Shop order not found in this order" });
    }

    // Update the status of the specific shopOrder entry
    order.status = status;
    shopOrder.status = status;

    let deliveryBoyPayload = [];
    // If status is "Out of delivery", find nearby delivery boys and create assignment if none exists
    if (status === "Out of delivery" && !shopOrder.assignment) {
      // Use delivery address coords (deliveryAddress likely has { text, latitude, longitude })
      //console.log("order.deliveryAddress:", order.deliveryAddress);
      const addrLat = Number(order.deliveryAddress?.latitude);
      const addrLon = Number(order.deliveryAddress?.longitude);
      //console.log("search coords (lon,lat):", addrLon, addrLat);

      const searchLon = Number(addrLon);
      const searchLat = Number(addrLat);
      const searchCoords = [searchLon, searchLat]; // IMPORTANT: [lon, lat]

      // find nearby delivery users (returns user documents)
      const nearByDeliveryBoys = await UserModel.find({
        role: "foodDelivery",
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: searchCoords },
            $maxDistance: 5000,
          },
        },
      }).exec();

     // console.log("nearByDeliveryBoys found:", nearByDeliveryBoys.length);

      // get ids of busy delivery boys
      const nearIds = nearByDeliveryBoys.map((d) => String(d._id));
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearIds },
        status: { $nin: ["BRODCASTED", "COMPLETED"] },
      }).distinct("assignedTo");
      const busySet = new Set((busyIds || []).map((id) => String(id)));

      // filter user docs to available ones
      const availableDeliveryDocs = nearByDeliveryBoys.filter(
        (d) => !busySet.has(String(d._id))
      );

      // candidate ids to broadcast
      const candidateIds = availableDeliveryDocs.map((d) => d._id);
      if (!candidateIds.length) {
        await order.save();
        console.log("No delivery available");
        return res.status(200).json({ message: "Delivery not available" });
      }

      // create assignment
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.Shop,
        shopOrder: shopOrder._id,
        // match schema field name (typo in schema: brodcastedTo)
        brodcastedTo: candidateIds,
        status: "BRODCASTED",
      });

      // set the assignedDeliveryBoy and assignment refs using correct field names
      shopOrder.assignedDeliveryBoy =
        deliveryAssignment.assignedTo ?? deliveryAssignment.assignedTo ?? null;
      shopOrder.assignment = deliveryAssignment._id;

      // build safe payload using user docs and guard location shape
      deliveryBoyPayload = availableDeliveryDocs.map((b) => {
        const coords = b.location?.coordinates ?? b.Location?.coordinates ?? [];
        const lon = Number(coords?.[0]);
        const lat = Number(coords?.[1]);
        return {
          id: b._id,
          name: b.fullName ?? b.name ?? "",
          latitude: Number.isFinite(lat) ? lat : null,
          longitude: Number.isFinite(lon) ? lon : null,
          mobile: b.mobile,
        };
      });
    }

    const updatedShopOrder = order.shopOrder.find(
      (o) => String(o.Shop?._id ?? o.Shop ?? o._id) === String(shopId)
    );
    await order.save();
    // await shopOrder.populate(" shopOrder.shopOrderItems.product", "name image price foodType");
    // populate needed sub-doc refs (including assignedDeliveryBoy)
    await order.populate([
      { path: "shopOrder.Shop", select: "name" },
      {
        path: "shopOrder.assignedDeliveryBoy",
        model: UserModel,
        select: "fullName email mobile location",
      },
      {
        path: "shopOrder.shopOrderItems.product",
        model: ItemModel,
        select: "name image price foodType",
      },
    ]);

    // locate the shopOrder entry we updated
    // safe extraction of assignment id (avoid reading _id of null)
    const refreshedShopOrder = order.shopOrder.find(
      (o) => String(o.Shop?._id ?? o.Shop ?? o._id) === String(shopId)
    );

    let assignmentId = null;
    const rawAssignment = refreshedShopOrder?.assignment;
    if (rawAssignment) {
      // populated doc (has _id) or raw ObjectId/string
      assignmentId = rawAssignment._id ? rawAssignment._id : rawAssignment;
    }

   // console.log("Updated order status:", updatedShopOrder);
    return res.status(200).json({
      message: "Order status updated successfully",
      shopOrder: refreshedShopOrder,
      assignedDeliveryBoy: refreshedShopOrder?.assignedDeliveryBoy ?? null,
      availableDeliveryboys: deliveryBoyPayload,
      assignment: assignmentId,
    });
  } catch (err) {
    console.error("Update order status error:", err);
    return res.status(500).json({ message: "Update order status error" });
  }
};

// GET /api/order/delivery/assignments
exports.getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.user?._id ?? req.userId;
    if (!deliveryBoyId) {
      return res.status(401).json({ message: "Please login first" });
    }

  //  console.log("deliveryBoyId:", deliveryBoyId);

    // find assignments broadcasted to this delivery boy
    const assignments = await DeliveryAssignment.find({
      brodcastedTo: { $in: [deliveryBoyId, String(deliveryBoyId)] },
      status: "BRODCASTED",
    })
      .populate("shop")
      .lean();

   // console.log("assignments in get Delivery :", assignments);

    if (!assignments || assignments.length === 0) {
      return res.status(200).json([]);
    }

    // collect shopOrder ids referenced by assignments
    const shopOrderIds = assignments
      .map((a) => a.shopOrder)
      .filter(Boolean)
      .map((id) => String(id));

    // fetch orders that contain these shopOrder subdocs (batch)
    const orders = await OrderModel.find({
      "shopOrder._id": { $in: shopOrderIds },
    })
      .populate({ path: "shopOrder.Shop", select: "name" })
      .populate({
        path: "shopOrder.shopOrderItems.product",
        model: "Item",
        select: "name image price foodType",
      })
      .lean();

    // build map: shopOrderId -> { order, shopOrderSubdoc }
    const shopOrderMap = {};
    for (const order of orders) {
      for (const so of order.shopOrder || []) {
        shopOrderMap[String(so._id)] = { order, shopOrder: so };
      }
    }

    // format assignments using the map (guard missing data)
    const formated = assignments
      .map((a) => {
        const key = String(a.shopOrder);
        const entry = shopOrderMap[key];
        if (!entry) {
          console.warn(
            "No order found for shopOrder:",
            key,
            "assignment:",
            a._id
          );
          return null;
        }

        return {
          assignmentId: a._id,
          orderId: entry.order._id,
          shopId: a.shop?._id ?? entry.shopOrder.Shop?._id,
          shopName: a.shop?.name ?? entry.shopOrder.Shop?.name ?? "",
          deliveryAddress: entry.order.deliveryAddress,
          items: entry.shopOrder.shopOrderItems || [],
          subtotal: entry.shopOrder.subtotal || 0,
          status: a.status,
        };
      })
      .filter(Boolean);

    console.log("formatted assignments count:", formated.length);
    return res.status(200).json(formated);
  } catch (err) {
    console.error("Get assigned orders error:", err);
    return res.status(500).json({ message: "Get assigned orders error" });
  }
};



exports.acceptOrder = async (req, res) => {
  
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) { 
      return res.status(404).json({ message: "Assignment not found" });
    }

    if(assignment.status !== "BRODCASTED") {
      return res.status(400).json({ message: "Assignment not in BRODCASTED status" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["BRODCASTED", "COMPLETED"] },
    });

    if (alreadyAssigned) {
      return res.status(400).json({ message: "You already have an active assignment" });
    }
    assignment.assignedTo = req.userId;
    assignment.status = "ASSIGNED";
    assignment.acceptedAt = new Date();  
    await assignment.save();

    const order = await OrderModel.findById(assignment.order);
    if (!order) {
      return res.status(404).json({ message: "Order not found for this assignment" });
    }

    const shopOrderAssign = order.shopOrder.find(so => so._id == assignment.shopOrderId)
    shopOrderAssign.assignedDeliveryBoy = req.userId;
    await order.save();

    await order.populate('shopOrders.assignedDeliveryBoy');

    return res.status(200).json({ message: "Order accepted successfully", assignment });
    
  }
  catch (err) {
    console.error("Accept order error:",err)
  }
  
}
