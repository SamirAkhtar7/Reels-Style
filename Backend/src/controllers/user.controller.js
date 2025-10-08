const { updateMany } = require("../models/order.model");
const userModel = require("../models/user.model");


exports.getUsers = async (req, res) => {
  try {
    // middleware now attaches the full user (without password)
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // return sanitized user object
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: `get current user error ${err}` });
  }
};


exports.const = updateUserLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Please provide both latitude and longitude" });
    }
    // support both auth middleware shapes: req.user (object) or req.userId (id)
    const user = await userModel.findByIdAndUpdate(req.userId || (req.user && req.user._id), {
      Location: {
      type: "Point",
      coordinates: [longitude, latitude], // Note: GeoJSON format is [longitude, latitude]
      }
    },{new:true});

    if (!user) {
      return res.status(401).json({ messagee: "Please login first" });
    }
    return res.status(200).json({ message: "Location updated successfully", user });  
    
  } catch (err) {
    
  }
}