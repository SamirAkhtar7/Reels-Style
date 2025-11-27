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
    video: {
      type: String,
    },
    videoTitle: {
      type: String,
    },
      videoDescription: {
        type: String,
      },
      videoLikes: {
        type: Number,
        default: 0,
      },

    // video: {

    //   videoUrl: {
    //     type: String,
    //     required: true,
    //   },

    // },
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
      min: 0,
    },
    foodType: {
      type: String,
      required: true,
      enum: ["Veg", "Non-Veg"],
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const Itms = mongoose.model("Item", itemSchema);
export default Itms;
