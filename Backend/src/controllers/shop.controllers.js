
const ShopModel = require("../models/shop.model");
const { uploadOnCloudinary } = require("../services/cloudinary");

exports.createEditShope = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    let shop = await shopModel.findOne({ ower: req.user._id });
    if (!shop) {
      shop = await ShopModel.create({
        name,
        city,
        state,
        address,
        image,
        ower: req.user._id,
      });
    } else {
      shop = await ShopModel.findOneAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image,
          owner: req.userId,
        },
        { new: true }
      );
      return res.status(200).json({
        message: "Shop updated successfully",
        shop,
      });
    }
    await ShopModel.populate("owner");
    return res.status(201).json({
      message: "Shop created successfully",
      shop,
    });
  } catch (err) {
    return res.status(500).json({ message: `Create shop error ${err}` });
  }
};

exports.getShop = async (req, res) => { 
    try {
        const shop = await ShopModel.findOne({ ower: req.userId }).populate("ower", "-password", "itms");
        console.log(shop);
        if (!shop) {
            return null
        }

        return res.status(200).json(shop)
        
    } catch (err) {
        return res.status(500).json({ message: `Get shop error1 ${err}` });
    }
}