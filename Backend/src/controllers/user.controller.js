const { parse } = require("dotenv");
const { updateMany } = require("../models/order.model");
const userModel = require("../models/user.model");

// return current authenticated user
exports.getUsers = async (req, res) => {
  try {
    // middleware should attach the full user (without password)
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // return sanitized user object
    return res.status(200).json({ user });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ message: `get current user error ${err}` });
  }
};

// update user's location
exports.updateUserLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // DEBUG: log incoming payload and auth info
    //console.log("updateUserLocation payload:", { latitude, longitude });
    // console.log(
    //   "req.userId:",
    //   req.userId,
    //   "req.user?._id:",
    //   req.user && req.user._id
    // );

    // resolve user id robustly
    const userId = req.userId || (req.user && (req.user._id || req.user.id));
    if (!userId) {
      console.warn("updateUserLocation: no user id in request");
      return res.status(401).json({ message: "Please login first" });
    }

    // coerce to number and validate
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      console.warn("updateUserLocation: invalid coords", { lat, lon });
      return res.status(400).json({ message: "Invalid latitude or longitude" });
    }

    // guard against accidental zeros (optional)
    if (lat === 0 && lon === 0) {
      console.warn("updateUserLocation: received 0,0 coords — skipping update");
      // still allow if you intentionally want to save 0,0 — remove this block then
      return res.status(400).json({ message: "Received zero coordinates" });
    }

    // Determine correct field name from schema
    const hasLower = !!userModel.schema.path("location");
    const hasUpper = !!userModel.schema.path("Location");
    const fieldName = hasLower
      ? "location"
      : hasUpper
      ? "Location"
      : "location";

    const geoPoint = { type: "Point", coordinates: [lon, lat] };

    // Try atomic update first
    let user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { [fieldName]: geoPoint } },
      { new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // If atomic update didn't return the updated document, fallback to load & save
    if (!user) {
      user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user[fieldName] = geoPoint;
      await user.save();
    }

    // console.log("updateUserLocation saved:", {
    //   userId,
    //   fieldName,
    //   coords: user[fieldName] && user[fieldName].coordinates,
    // });

    return res.status(200).json({
      message: "Location updated successfully",
      coords: { latitude: lon, longitude: lat },
      user,
    });
  } catch (err) {
    console.error("updateUserLocation error:", err);
    return res
      .status(500)
      .json({ message: `update location error ${err.message || err}` });
  }
};
