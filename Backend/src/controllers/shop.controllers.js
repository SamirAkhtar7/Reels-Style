// ...existing code...
const ShopModelImport = require("../models/shop.model");
const ShopModel = ShopModelImport.default || ShopModelImport;
const {
  uploadOnCloudinary,
  uploadBufferToCloudinary,
} = require("../services/cloudinary");
const fs = require("fs").promises;
const path = require("path");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");

// ...existing code...
exports.createEditShope = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;
    console.log("File received:", req.file || req.files);

    // Support both single-file (upload.single) and multi-file (upload.array / fields)
    if (req.file) {
      const imgFile = req.file;
      if (imgFile.path) {
        try {
          await fs.access(imgFile.path);
          image = await uploadOnCloudinary(imgFile.path, imgFile.filename);
        } catch (e) {
          if (imgFile.buffer) {
            image = await uploadBufferToCloudinary(
              imgFile.buffer,
              imgFile.originalname || imgFile.filename || undefined
            );
          } else {
            console.warn("Image path missing and no buffer present:", imgFile);
            image = null;
          }
        }
      } else if (imgFile.buffer) {
        image = await uploadBufferToCloudinary(
          imgFile.buffer,
          imgFile.originalname || uuid()
        );
      }
    } else if (req.files && req.files.image && req.files.image.length > 0) {
      const imgFile = req.files.image[0];
      if (imgFile.path) {
        try {
          await fs.access(imgFile.path);
          image = await uploadOnCloudinary(imgFile.path, imgFile.filename);
        } catch (e) {
          if (imgFile.buffer) {
            image = await uploadBufferToCloudinary(
              imgFile.buffer,
              imgFile.originalname || imgFile.filename || undefined
            );
          } else {
            console.warn("Image path missing and no buffer present:", imgFile);
            image = null;
          }
        }
      } else if (imgFile.buffer) {
        image = await uploadBufferToCloudinary(
          imgFile.buffer,
          imgFile.originalname || uuid()
        );
      }
    }

    // if (req.file) {
    //   try {
    //     image = await uploadOnCloudinary(req.file.path);
    //     console.log("Uploaded image URL:", image);
    //   } catch (uploadErr) {
    //     // optional: remove local uploaded file to keep disk clean
    //     try {
    //       if (req.file && req.file.path) {
    //         await fs.unlink(path.resolve(req.file.path)).catch(() => {});
    //       }
    //     } catch (e) {
    //       // ignore
    //     }
    //     console.error("Cloudinary upload failed:", uploadErr);
    //     return res.status(500).json({
    //       message: "Cloudinary upload failed",
    //       error: uploadErr.message || String(uploadErr),
    //     });
    //   }
    // }

    // get owner id from middleware-attached user
    const ownerId = req.user && req.user._id ? req.user._id : req.userId;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // find shop by owner
    let shop = await ShopModel.findOne({ owner: ownerId });

    if (!shop) {
      // Creating new shop: require image (avoid mongoose validation error)
      if (!image) {
        return res
          .status(400)
          .json({ message: "Image is required to create a shop" });
      }

      shop = await ShopModel.create({
        name,
        city,
        state,
        address,
        image,
        owner: ownerId,
      });

      // populate owner before returning
      await shop.populate("owner", "-password");

      return res.status(201).json({
        message: "Shop created successfully",
        shop,
      });
    } else {
      // Updating existing shop: if no new image uploaded, keep existing image
      const updatedData = {
        name,
        city,
        state,
        address,
        owner: ownerId,
      };
      if (image) updatedData.image = image;

      shop = await ShopModel.findByIdAndUpdate(shop._id, updatedData, {
        new: true,
      });

      await shop.populate("owner").populate({
        path: "items",
        options: { sort: { createdAt: -1 } },
      });

      return res.status(200).json({
        message: "Shop updated successfully",
        shop,
      });
    }
  } catch (err) {
    console.error("Create/Edit shop error:", err);
    return res
      .status(500)
      .json({
        message: `Create/Edit shop error ${
          err && err.message ? err.message : err
        }`,
      });
  }
};

// ...existing code...
exports.getShop = async (req, res) => {
  try {
    const ownerId = req.user && req.user._id ? req.user._id : req.userId;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const shop = await ShopModel.findOne({ owner: ownerId })
      .populate("owner", "-password")
      .populate("items");

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    return res.status(200).json(shop);
  } catch (err) {
    console.error("Get shop error:", err);
    return res.status(500).json({
      message: `Get shop error ${err && err.message ? err.message : err}`,
    });
  }
};
// ...existing code...

exports.getShopByCity = async (req, res) => {
  try {
    const city = req.params.city;

    if (!city) {
      return res.state(400).json({ message: "City parameter is required" });
    }

    const shops = await ShopModel.find({
      city: {
        $regex: new RegExp(`^${city}$`, "i"), // case-insensitive exact match
      },
    }).populate("items");
    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "No shops found in this city" });
    }
    return res.status(200).json({ shops });
  } catch (err) {
    console.error("Get shop by city error:", err);
    return res.status(500).json({
      message: `Get shop by city error ${
        err && err.message ? err.message : err
      }`,
    });
  }
};
