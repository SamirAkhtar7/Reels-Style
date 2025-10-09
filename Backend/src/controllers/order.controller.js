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

    return res.status(400).json({ message: "Invalid user role" });
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
    const shopOrder = await order.shopOrder.find(o => o.Shop == shopId);
    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found in this order" });
    }


    // Update the status of the specific shopOrder entry
    order.status = status ;


    if (status == "Out of delivery" || shopOrder.assignment) {
      const { latitude, longitude } = order.deliveryAddress;
      const nearByDeliveryBoys = await UserModel.find({
        role: "foodDelivery",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 5000, // 5 km radius
          },
        },
      });

      //Delivery Boy available check

      if (nearByDeliveryBoys.length === 0) {
        console.log("No delivery  ")
        return res.status(200).json({ message: "Delivery Boy not available " });  
      }

      console.log("nearByDeliveryBoys", nearByDeliveryBoys.length);
      // Assign the first available

      const nearByDeliveryBoysIds = nearByDeliveryBoys.map((d) => d._id)

      const busyDeliveryBoysIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByDeliveryBoysIds },
        status: { $nin: ["BRODCASTED", "COMPLETED"] },

        
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyDeliveryBoysIds.map((id) => String(id)))
      const availableDeliveryBoys = nearByDeliveryBoysIds.filter((id) => !busyIdSet.has(String(id)))
      console.log("availableDeliveryBoys", availableDeliveryBoys.length);

      if (availableDeliveryBoys.length === 0) {
        console.log("No available delivery ")
      }
      
       
    }

   
    await order.save();
   // await shopOrder.populate(" shopOrder.shopOrderItems.product", "name image price foodType");

    
    
    
    
    return res.status(200).json(order.status );  

    
  } catch (err) {
    console.error("Update order status error:", err);
    return res.status(500).json({ message: "Update order status error" });
  }
 }