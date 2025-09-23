const ShopModelImport = require("../models/shop.model");
const ShopModel = ShopModelImport.default || ShopModelImport;
const ItemModelImport = require("../models/item.model");
const ItemModel = ItemModelImport.default || ItemModelImport;
const { uploadOnCloudinary } = require("../services/cloudinary");

exports.addItem = async (req, res) => {
  try {
    const { name, category, foodType: rawFoodType, price } = req.body;

    // normalize foodType to match model enum values ("Veg" | "Non-Veg")
    const normalizeFoodType = (ft) => {
      if (!ft) return ft;
      const s = String(ft).trim().toLowerCase();
      if (s === "veg" || s === "vegetarian") return "Veg";
      if (
        s === "non-veg" ||
        s === "nonveg" ||
        s === "non veg" ||
        s === "nonvegetarian"
      )
        return "Non-Veg";
      // fallback: capitalize first letter
      return ft.charAt(0).toUpperCase() + ft.slice(1);
    };
    const foodType = normalizeFoodType(rawFoodType);

    // basic validation
    const missing = [];
    if (!name) missing.push("name");
    if (!price) missing.push("price");
    if (!category) missing.push("category");
    if (!foodType) missing.push("foodType");
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing fields: ${missing.join(", ")}` });
    }

    // handle image upload (cloudinary or local fallback inside service)
    let image = null;
    if (req.file) {
      try {
        const uploaded = await uploadOnCloudinary(
          req.file.path,
          req.file.filename
        );
        image =
          (uploaded && (uploaded.secure_url || uploaded)) ||
          `/uploads/${req.file.filename}`;
      } catch (err) {
        console.error("Item image upload failed:", err);
        // return error so caller knows upload failed
        return res.status(500).json({
          message: "Image upload failed",
          error: err.message || String(err),
        });
      }
    }
    // find shop by owner (auth middleware should set req.user._id)
    const ownerId = req.user && req.user._id ? req.user._id : req.userId;
    const shop = await ShopModel.findOne({ owner: ownerId });
    if (!shop)
      return res.status(404).json({ message: "Shop not found for owner" });

    const item = await ItemModel.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });

    // attach item to shop and save
    shop.items = shop.items || [];
    shop.items.push(item._id);
    await shop.save();
    await shop.populate("items owner");
    return res
      .status(201)
      .json({ message: "Item added successfully", item, shop });
  } catch (err) {
    console.error("Add item error:", err);
    return res.status(500).json({
      message: `Add item error ${err && err.message ? err.message : err}`,
    });
  }
};

exports.editItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, category, foodType, price } = req.body;

    let image;
    if (req.file) {
      try {
        const uploaded = await uploadOnCloudinary(
          req.file.path,
          req.file.filename
        );
        image =
          (uploaded && (uploaded.secure_url || uploaded)) ||
          `/uploads/${req.file.filename}`;
      } catch (err) {
        console.error("Edit item image upload failed:", err);
        return res.status(500).json({
          message: "Image upload failed",
          error: err.message || String(err),
        });
      }
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (category !== undefined) update.category = category;
    if (foodType !== undefined) update.foodType = foodType;
    if (price !== undefined) update.price = price;
    if (image !== undefined) update.image = image;

    const item = await ItemModel.findByIdAndUpdate(itemId, update, {
      new: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json({ message: "Item updated successfully", item });
  } catch (err) {
    console.error("Edit item error:", err);
    return res.status(500).json({
      message: `Edit item error ${err && err.message ? err.message : err}`,
    });
  }
};
