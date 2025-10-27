const mongoose = require("mongoose");

const shopOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  foodType: {
    type: String,
    required: true,
    enum: ["Veg", "Non-Veg"],
  },
  name: {
    type: String,
    required: true,
  },
});

const shopOrderSchema = new mongoose.Schema(
  {
    Shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subtotal: {
      type: Number,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Prepared",
        "Out for delivery",
        "Out of delivery",
        "Accepted",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    shopOrderItems: [shopOrderItemSchema],

    // who was assigned for this shopOrder (nullable)
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // reference to the delivery assignment document (optional)
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    deliveryOtp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "ONLINE"],
    },

    deliveryAddress: {
      text: String,
      latitude: Number,
      longitude: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    shopOrder: [shopOrderSchema],
    status: {
      type: String,
      enum: [
        "Pending",
        "Prepared",
        "Out of delivery",
        "Accepted",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
