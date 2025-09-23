import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Breakfast",
          "Lunch",
          "Dinner",
          "Snacks",
          "Drinks",
          "Dessert",
          "Beverages",
          "snacks",
          "Main Course",
          "Beverages",
          "Desserts",
          "Salad",
          "pizza",
          "sandwich",
          "south Indian ",
          "north Indian",
          "chinese",
          "fast food",
          "others",
      ],
        },
    price: {
      type: Number,
        required: true,
      min:0,
        },
        foodType: {
        type: String,
      required: true,
      enum: ["Veg", "Non-Veg"],
    },

  },
  { timestamps: true }
);


const Itms = mongoose.model("Item", itemSchema);
export default Itms;