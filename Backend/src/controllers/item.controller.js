

const shopModel = require("../models/shop.model");
const { uploadOnCloudinary } = require("../services/cloudinary");
const itemModel = require("../models/item.model");


export const addItem = async (req, res) => {

    try {
        const { name, catagory, foodType, price, } = req.body;
        let image;
        if (req.file) {
          image = await uploadOnCloudinary(req.file.path);
        }
        const shop = await shopModel.findOne({ ower: req.user._id });
        if (!shop) {
          return res.status(404).json({ message: "Shop not found" });
        }

        item = await itemModel.create({
            name,
            catagory,
            foodType,
            price,
            image,
            shop: shop._id,
        })
        return res.status(201).json({ message: "Item added successfully", item });


    } catch (error) {
        return res.status(500).json({ message: `Add item error ${err}` });
      }

}
 

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const { name, catagory, foodType, price } = req.body;
        let image;
        if (req.file) {
          image = await uploadOnCloudinary(req.file.path);
        }
        const item = await itemModel.findById(itemId, {
            name,
            catagory,
            foodType,
            price,
            image,
        }, { new: true });
        if (!item) {
          return res.status(404).json({ message: "Item not found" });
        }
        return res.status(200).json({ message: "Item updated successfully", item });
    }
    catch (error) {
        return res.status(500).json({ message: `Edit item error ${err}` });
    }
}