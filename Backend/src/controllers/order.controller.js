const OrderModelImport = require("../models/order.model");
const OrderModel = OrderModelImport.default || OrderModelImport;

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
        owner: it.shopOwner || it.owner || null,
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
