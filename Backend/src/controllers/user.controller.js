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