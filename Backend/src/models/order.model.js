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
    subtotal:
    {
        type: Number,

    },
    
        shopOrderItems: [
            shopOrderItemSchema
        
    ]

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
      enum: ["Pending", "Accepted", "Prepared", "On the way", "Delivered","Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);





const Order = mongoose.model("Order", orderSchema);
module.exports =Order; 