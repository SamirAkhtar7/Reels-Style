const OrderModelImport = require("../models/order.model");
const OrderModel = OrderModelImport.default || OrderModelImport;
const ShopModelImport = require("../models/shop.model");
const UserModelImport = require("../models/user.model");
const ItemModelImport = require("../models/item.model");
const Order = require("../models/order.model");
const DeliveryAssignment = require("../models/deliveryAssignment.model");
const { model } = require("mongoose");
const { sendDeliveryOtpEmail } = require("../utils/mail");
const UserModel = UserModelImport.default || UserModelImport;
const ShopModel = ShopModelImport.default || ShopModelImport;
const ItemModel = ItemModelImport.default || ItemModelImport;
const Razorpay = require("razorpay");
const dotendv = require("dotenv");
dotendv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

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

    if (paymentMethod === "ONLINE") {
      const razorpayOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100), // amount in paise
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
        // payment_capture: 1,
      });
      const order = await OrderModel.create({
        user: user._id,
        paymentMethod,
        deliveryAddress: deliveryAddress || {},
        totalAmount,
        shopOrder,
        razorpayOrderId: razorpayOrder.id,
        payment: false,
      });

      return res.status(201).json({
        razorpayOrder,
        orderId: order._id,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    const orderPayload = {
      user: user._id,
      paymentMethod,
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
      { path: "shopOrder.owner", model: UserModel, select: "socketId" },
    ]);

    const io = req.app.get("io");
    if (io) {
      order.shopOrder.forEach((shopOrd) => {
        const owner = shopOrd?.owner;
        const ownerId = String(owner?._id ?? owner);
        const ownerSocketId = owner?.socketId;
        if (ownerSocketId) {
          // Filter shopOrder for this owner only
          const ownerShopOrders = order.shopOrder.filter(
            (so) => String(so.owner?._id ?? so.owner) === ownerId
          );
          const ownerTotal = ownerShopOrders.reduce(
            (sum, so) => sum + Number(so.subtotal || 0),
            0
          );
          // Build payload as in getUserOrders for owner
          const ownerOrderPayload = {
            ...order.toObject(),
            shopOrder: ownerShopOrders,
            totalAmount: ownerTotal,
            status:
              ownerShopOrders.length === 1
                ? ownerShopOrders[0].status
                : order.status,
          };
          io.to(ownerSocketId).emit("new-order", ownerOrderPayload);
          console.log(
            "socket emitted to owner:",
            ownerSocketId,
            ownerOrderPayload
          );
        }
      });
    }

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

// verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId } = req.body;
    const payment = await instance.payments.fetch(razorpayPaymentId);
    if (!payment || payment.status === "captured") {
      return res.status(400).json({ message: "Invalid payment details" });
    }
    // find order by razorpayOrderId
    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // update order payment status
    order.payment = true;
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();
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
      .status(200)
      .json({ message: "Payment verified successfully", order });
  } catch (err) {
    console.error("Verify payment error:", err);
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
        // populate assignedDeliveryBoy so frontend can read name/fullName
        .populate({
          path: "shopOrder.assignedDeliveryBoy",
          model: UserModel,
          select: "fullName name mobile",
        })
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
        // populate assignedDeliveryBoy so owner sees name & mobile instead of just id
        .populate({
          path: "shopOrder.assignedDeliveryBoy",
          model: UserModel,
          select: "fullName name mobile",
        })
        .populate({
          path: "shopOrder.shopOrderItems.product",
          model: ItemModel,
          select: "name image price foodType",
        });

      // Keep only shopOrder entries that belong to this owner and return those orders
      const ownerOrders = orders
        .map((orderDoc) => {
          const o = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
          const shopOrderForOwner = (o.shopOrder || []).filter(
            (s) => String(s.owner?._id ?? s.owner) === owner
          );
          if (!shopOrderForOwner.length) return null;
          // compute total only for this owner's shopOrder entries
          const ownerTotal = shopOrderForOwner.reduce(
            (sum, so) => sum + Number(so.subtotal || 0),
            0
          );
          // return order object with filtered shopOrder and adjusted totals
          return {
            ...o,
            shopOrder: shopOrderForOwner,
            totalAmount: ownerTotal,
            // optionally adjust status to reflect owner's shopOrders (choose business rule)
            status:
              shopOrderForOwner.length === 1
                ? shopOrderForOwner[0].status
                : o.status,
          };
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

// POST /api/order/delivery/accept/:assignmentId
exports.acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user?._id ?? req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Please login first" });
    }

    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.status !== "BRODCASTED") {
      return res
        .status(400)
        .json({ message: "Assignment not in BRODCASTED status" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: userId,
      status: { $nin: ["BRODCASTED", "COMPLETED"] },
    });

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You already have an active assignment" });
    }

    assignment.assignedTo = userId;
    assignment.status = "ASSIGNED";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await OrderModel.findById(assignment.order);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found for this assignment" });
    }

    // find shopOrder subdoc (assignment.shopOrder holds the subdoc id)
    let shopOrderAssign =
      (typeof order.shopOrder.id === "function" &&
        order.shopOrder.id(assignment.shopOrder)) ||
      order.shopOrder.find(
        (so) => String(so._id) === String(assignment.shopOrder)
      );

    if (!shopOrderAssign) {
      return res
        .status(404)
        .json({ message: "Shop order not found in this order" });
    }

    // update assignment refs and statuses
    shopOrderAssign.assignedDeliveryBoy = userId;
    shopOrderAssign.assignment = assignment._id;
    shopOrderAssign.status = "Out of delivery";
    order.status = "Out of delivery";

    await order.save();

    // populate updated fields for response
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

    const refreshedShopOrder =
      (typeof order.shopOrder.id === "function" &&
        order.shopOrder.id(assignment.shopOrder)) ||
      order.shopOrder.find(
        (so) => String(so._id) === String(assignment.shopOrder)
      );

    return res.status(200).json({
      message: "Order accepted successfully",
      assignment,
      shopOrder: refreshedShopOrder,
    });
  } catch (err) {
    console.error("Accept order error:", err);
    return res.status(500).json({ message: "Accept order error" });
  }
};

// GET /api/order/delivery/current-orders
exports.getCurrentOrders = async (req, res) => {
  try {
    const deliveryBoyId = req.user?._id ?? req.userId;
    if (!deliveryBoyId) {
      return res.status(401).json({ message: "Please login first" });
    }

    const assignment = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      // use canonical status value used elsewhere
      status: "ASSIGNED",
    })
      .populate("shop", "name")
      .populate({
        path: "assignedTo",
        model: UserModel,
        select: "fullName mobile location",
      })
      .populate({
        path: "order",
        populate: [
          {
            path: "user",
            model: UserModel,
            select: "fullName email mobile location",
          },
          {
            // populate shop subdocs inside shopOrder -> Shop.name
            path: "shopOrder.Shop",
            model: ShopModel,
            select: "name",
          },
          {
            // populate product inside each shopOrder.shopOrderItems
            path: "shopOrder.shopOrderItems.product",
            model: ItemModel,
            select: "name image price",
          },
          {
            // populate assigned delivery boy if present
            path: "shopOrder.assignedDeliveryBoy",
            model: UserModel,
            select: "fullName mobile",
          },
        ],
      });

    if (!assignment) {
      return res.status(400).json({ message: "No assignments found" });
    }
    if (!assignment.order) {
      return res
        .status(404)
        .json({ message: "Order not found for this assignment" });
    }

    // shopOrder subdoc id is stored in assignment.shopOrder
    const shopOrderAssign =
      (typeof assignment.order.shopOrder?.id === "function" &&
        assignment.order.shopOrder.id(assignment.shopOrder)) ||
      assignment.order.shopOrder.find(
        (so) => String(so._id) === String(assignment.shopOrder)
      );

    if (!shopOrderAssign) {
      return res
        .status(404)
        .json({ message: "Shop order not found in this order" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    const coords = assignment.assignedTo?.location?.coordinates;
    if (Array.isArray(coords) && coords.length === 2) {
      deliveryBoyLocation.lon = coords[0];
      deliveryBoyLocation.lat = coords[1];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order?.deliveryAddress) {
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder: shopOrderAssign,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (err) {
    console.error("Get current orders error:", err);
    return res.status(500).json({ message: "Get current orders error" });
  }
};

// GET /api/order/:orderId
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId)
      .populate({ path: "user", model: UserModel, select: "-password" })
      .populate({
        path: "shopOrder.Shop",
        select: "name",
        model: ShopModel,
      })
      .populate({
        path: "shopOrder.assignedDeliveryBoy",
        model: UserModel,
        select: "fullName mobile location",
      })
      .populate({
        path: "shopOrder.shopOrderItems.product",
        model: ItemModel,
        select: "name image price foodType",
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
  } catch (err) {
    return res.status(400).json({ message: "Get order by id error" });
  }
};

exports.sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    if (!orderId || !shopOrderId) {
      return res
        .status(400)
        .json({ message: "orderId and shopOrderId are required" });
    }

    // load order without populate to avoid model name mismatch issues
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // safe shopOrder lookup (supports mongoose subdoc id() helper or manual find)
    const shopOrder =
      typeof order.shopOrder.id === "function"
        ? order.shopOrder.id(shopOrderId)
        : (order.shopOrder || []).find(
            (so) => String(so._id) === String(shopOrderId)
          );

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    // generate OTP and save on the shopOrder subdoc
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = generatedOtp;
    shopOrder.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await order.save();

    // Try to resolve user document explicitly (avoid populate-model name issues)
    let userDoc = null;
    if (order.user && typeof order.user === "object" && order.user.email) {
      userDoc = order.user;
    } else if (order.user) {
      userDoc = await UserModel.findById(order.user).select(
        "fullName email mobile"
      );
    }

    if (userDoc && userDoc.email) {
      try {
        await sendDeliveryOtpEmail(userDoc, generatedOtp);
        return res.status(200).json({
          message: `Delivery OTP sent successfully to ${
            userDoc.fullName || userDoc.email
          }`,
        });
      } catch (emailErr) {
        console.error("sendDeliveryOtp: failed to send email", emailErr);
        return res.status(500).json({
          message: "Failed to send OTP email",
          error:
            emailErr && emailErr.message ? emailErr.message : String(emailErr),
        });
      }
    }

    // OTP saved but no email to send to
    console.warn("sendDeliveryOtp: user email not available, OTP saved only", {
      orderId,
      shopOrderId,
    });
    return res.status(200).json({
      message:
        "OTP generated and saved, but user email is not available to send.",
    });
  } catch (err) {
    console.error("Send delivery OTP error:", err);
    return res.status(500).json({
      message: "Send delivery OTP error",
      error: err && err.message ? err.message : String(err),
    });
  }
};

// POST /api/order/delivery/verify-otp
exports.verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    if (!orderId || !shopOrderId || !otp) {
      return res
        .status(400)
        .json({ message: "orderId, shopOrderId and otp are required" });
    }

    // load order without populate to avoid model name/populate issues
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // safe shopOrder lookup (supports mongoose subdoc id() helper or manual find)
    const shopOrder =
      typeof order.shopOrder.id === "function"
        ? order.shopOrder.id(shopOrderId)
        : (order.shopOrder || []).find(
            (so) => String(so._id) === String(shopOrderId)
          );

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    // normalize and validate OTP format
    const providedOtp = String(otp).trim();
    if (!/^\d{4,6}$/.test(providedOtp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    if (!shopOrder.deliveryOtp) {
      return res
        .status(400)
        .json({ message: "No OTP generated for this shop order" });
    }

    if (String(shopOrder.deliveryOtp) !== providedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (shopOrder.otpExpires && new Date() > new Date(shopOrder.otpExpires)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid — mark delivered for this shopOrder
    shopOrder.deliveryOtp = null;
    shopOrder.otpExpires = null;
    shopOrder.status = "Delivered";
    shopOrder.deliveredAt = new Date();

    // determine if all shopOrders are delivered -> mark order delivered
    const allDelivered = (order.shopOrder || []).every((so) =>
      String(so._id) === String(shopOrder._id)
        ? so.status === "Delivered"
        : so.status === "Delivered"
    );

    if (allDelivered) {
      order.status = "Delivered";
      order.deliveredAt = new Date();
    }

    await order.save();

    // remove any delivery assignment for this shopOrder (if exists)
    try {
      await DeliveryAssignment.deleteOne({
        order: order._id,
        shopOrder: shopOrder._id,
        assignedTo: shopOrder.assignedDeliveryBoy,
      });
    } catch (delErr) {
      console.warn(
        "verifyDeliveryOtp: failed to delete assignment (non-fatal)",
        delErr
      );
    }

    // resolve user name/email for response without relying on populate
    let userDoc = null;
    if (order.user && typeof order.user === "object" && order.user.fullName) {
      userDoc = order.user;
    } else if (order.user) {
      try {
        userDoc = await UserModel.findById(order.user).select("fullName email");
      } catch (uErr) {
        // non-fatal: continue without user info
      }
    }

    return res.status(200).json({
      message: `Delivery OTP verified successfully${
        userDoc?.fullName ? ", " + userDoc.fullName : ""
      }`,
      orderId: order._id,
      shopOrderId: shopOrder._id,
    });
  } catch (err) {
    console.error("Verify delivery OTP error:", err);
    return res.status(500).json({
      message: "Verify delivery OTP error",
      error: err && err.message ? err.message : String(err),
    });
  }
};
