const ShopModelImport = require("../models/shop.model");
const ShopModel = ShopModelImport.default || ShopModelImport;
const ItemModelImport = require("../models/item.model");
const ItemModel = ItemModelImport.default || ItemModelImport;
const { uploadOnCloudinary } = require("../services/cloudinary");
const { v4: uuid } = require("uuid");
const storageService = require("../services/storage.service");
const FoodVideoImport = require("../models/foodItem.model");
const FoodVideoModel = FoodVideoImport.default || FoodVideoImport;

exports.addItem = async (req, res) => {
  try {
    const {
      name,
      category,
      foodType: rawFoodType,
      price,
      videoTitle,
      videoDescription,
    } = req.body;

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
    if (videoTitle === undefined) missing.push("videoTitle");
    if (videoDescription === undefined) missing.push("videoDescription");
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing fields: ${missing.join(", ")}` });
    }

    let image = null;
    let video = null;

    // handle image upload (support disk path OR memory buffer)
    if (req.files && req.files.image && req.files.image.length > 0) {
      const imgFile = req.files.image[0];
      if (imgFile.path) {
        // disk storage -> upload by path
        image = await uploadOnCloudinary(imgFile.path, imgFile.filename);
      } else if (imgFile.buffer) {
        // memory storage -> upload buffer via storageService (ImageKit)
        const uploadResult = await storageService.uploadFile(
          imgFile.buffer,
          uuid()
        );
        image =
          uploadResult?.url || uploadResult?.secure_url || uploadResult || null;
      }
    }

    // handle video upload (support disk path OR memory buffer)
    if (req.files && req.files.video && req.files.video.length > 0) {
      const vidFile = req.files.video[0];
      if (vidFile.path) {
        video = await uploadOnCloudinary(vidFile.path, vidFile.filename);
      } else if (vidFile.buffer) {
        const uploadResult = await storageService.uploadFile(
          vidFile.buffer,
          uuid()
        );
        video =
          uploadResult?.url || uploadResult?.secure_url || uploadResult || null;
      }
    }

    // find shop by owner (auth middleware should set req.user._id)
    const ownerId = req.user && req.user._id ? req.user._id : req.userId;
    const shop = await ShopModel.findOne({ owner: ownerId });
    if (!shop)
      return res.status(404).json({ message: "Shop not found for owner" });

    // If we have an uploaded video URL, create a separate video doc and reference it
    let videoRef = null;
    if (video) {
      const fv = await FoodVideoModel.create({
        name: videoTitle || name,
        videoUrl: video,
        description: videoDescription || "",
        like: 0,
      });
      videoRef = fv._id;
    }

    const item = await ItemModel.create({
      name,
      category,
      foodType,
      price,
      image,
      // keep legacy video url (optional), and store reference in `videos`
      video: video || null,
      videos: videoRef,
      shop: shop._id,
      videoTitle,
      videoDescription,
    });

    // attach item to shop and save
    shop.items = shop.items || [];
    shop.items.push(item._id);
    await shop.save();

    // populate owner and items correctly
    await shop.populate("owner", "-password");
    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });
    console.log("Added item:", item);
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
    const { name, category, foodType, price, videoTitle, videoDescription } =
      req.body;

    let image = null;
    let video = null;

    // handle image upload (support disk path OR memory buffer)
    if (req.files && req.files.image && req.files.image.length > 0) {
      const imgFile = req.files.image[0];
      if (imgFile.path) {
        // disk storage -> upload by path
        image = await uploadOnCloudinary(imgFile.path, imgFile.filename);
      } else if (imgFile.buffer) {
        // memory storage -> upload buffer via storageService (ImageKit)
        const uploadResult = await storageService.uploadFile(
          imgFile.buffer,
          uuid()
        );
        image =
          uploadResult?.url || uploadResult?.secure_url || uploadResult || null;
      }
    }

    // handle video upload (support disk path OR memory buffer)
    if (req.files && req.files.video && req.files.video.length > 0) {
      const vidFile = req.files.video[0];
      if (vidFile.path) {
        video = await uploadOnCloudinary(vidFile.path, vidFile.filename);
      } else if (vidFile.buffer) {
        const uploadResult = await storageService.uploadFile(
          vidFile.buffer,
          uuid()
        );
        video =
          uploadResult?.url || uploadResult?.secure_url || uploadResult || null;
      }
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (category !== undefined) update.category = category;
    if (foodType !== undefined) update.foodType = foodType;
    if (price !== undefined) update.price = price;
    if (image !== undefined) update.image = image;
    if (video !== undefined) update.video = video;
    if (videoTitle !== undefined) update.videoTitle = videoTitle;
    if (videoDescription !== undefined)
      update.videoDescription = videoDescription;

    // If a new video URL is present in the update, create or update the referenced video doc
    if (update.video) {
      const existingItem = await ItemModel.findById(itemId);
      if (existingItem && existingItem.videos) {
        // update existing referenced video document
        await FoodVideoModel.findByIdAndUpdate(existingItem.videos, {
          videoUrl: update.video,
          name:
            update.videoTitle || existingItem.videoTitle || existingItem.name,
          description:
            update.videoDescription || existingItem.videoDescription || "",
        });
      } else {
        // create a new video doc and attach
        const fv = await FoodVideoModel.create({
          name: update.videoTitle || update.name || "",
          videoUrl: update.video,
          description: update.videoDescription || "",
          like: 0,
        });
        update.videos = fv._id;
      }
    }

    const item = await ItemModel.findByIdAndUpdate(itemId, update, {
      new: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    const shop = await ShopModel.findById(item.shop).populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });
    if (!shop)
      return res.status(404).json({ message: "Shop not found for item" });

    return res.status(200).json({ message: "Item updated successfully", shop });
  } catch (err) {
    console.error("Edit item error:", err);
    return res.status(500).json({
      message: `Edit item error ${err && err.message ? err.message : err}`,
    });
  }
};

//get-Item-by-Id

exports.getItemById = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await ItemModel.findById(itemId).populate("videos");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ item });
  } catch (err) {
    console.error("Get item by ID error:", err);
    return res.status(500).json({
      message: `Get item by ID error ${err && err.message ? err.message : err}`,
    });
  }
};

// get-all-items

exports.getAllItems = async (req, res) => {
  try {
    const items = await ItemModel.find().populate("videos");
    return res.status(200).json({ items });
  } catch (err) {
    console.error("Get all items error:", err);
    return res.status(500).json({
      message: `Get all items error ${err && err.message ? err.message : err}`,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await ItemModel.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const shop = await ShopModel.findById(item.shop);
    shop.items = shop.items.filter((i) => i !== item._id);
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });
    return res.status(200).json({ message: "Item deleted successfully", shop });
  } catch (err) {
    console.error("Delete item error:", err);
    return res.status(500).json({
      message: `Delete item error ${err && err.message ? err.message : err}`,
    });
  }
};

exports.getItemByCity = async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }
    const shops = await ShopModel.find({ city }).populate({
      path: "items",
      populate: { path: "videos" },
    });
    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "No shops found in this city" });
    }

    const items = shops.flatMap((shop) => shop.items);
    return res.status(200).json({ items });
  } catch (err) {
    console.error("Get item by city error:", err);
    return res.status(500).json({
      message: `Get item by city error ${
        err && err.message ? err.message : err
      }`,
    });
  }
};

exports.getItemByShop = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const shop = await ShopModel.findById(shopId).populate({
      path: "items",
      populate: { path: "videos" },
    });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found " });
    }

    return res.status(200).json({ shop, items: shop.items });
  } catch (err) {
    return res.status(500).json({
      message: `Get item by shop error ${
        err && err.message ? err.message : err
      }`,
    });
  }
};

exports.searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    if (!query || !city)
      return res
        .status(400)
        .json({ message: "Query and city parameters are required" });

    const shop = await ShopModel.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (!shop || shop.length === 0) {
      return res.status(404).json({ message: "No shops found in this city" });
    }
    const shopIds = shop.map((s) => s._id);
    const items = await ItemModel.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: new RegExp(query, "i") } },
        { category: { $regex: new RegExp(query, "i") } },
      ],
    })
      .populate("shop", "name image")
      .populate("videos");

    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({
      message: `Search items error ${err && err.message ? err.message : err}`,
    });
  }
};

//rating Controller

exports.rating = async (req, res) => {
  try {
    const { itemId, rating } = req.body;
    if (!itemId || typeof rating !== "number") {
      return res
        .status(400)
        .json({ message: "itemId and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }
    const item = await ItemModel.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update average rating and count
    const newCount = item.ratings.count + 1;
    const newAverage =
      (item.ratings.average * item.ratings.count + rating) / newCount;
    item.ratings.count = newCount;
    item.ratings.average = newAverage;
    await item.save();

    return res
      .status(200)
      .json({ message: "Rating submitted successfully", item });
  } catch (err) {
    console.error("rating error:", err);
    return res
      .status(500)
      .json({ message: `rating error ${err.message || err}` });
  }
};
