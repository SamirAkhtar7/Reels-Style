import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const shopSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    // Use the same model name as registered in user.model.js ("user")
    owner: { type: Types.ObjectId, ref: "user", required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    items: [{ type: Types.ObjectId, ref: "Item" }],
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;