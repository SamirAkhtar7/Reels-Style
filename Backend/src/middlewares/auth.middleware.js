const foodpartnerModel = require("../models/foodpartner.model");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model")




exports.authFoodpartnerMiddleware = async(req, res, next) => {
    
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            Message:"Unauthorized"
        })
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const foodPartner = await foodpartnerModel.findById(decode.id);
        req.foodPartner = foodPartner;
        next()


    } catch (err) {
        return res.status(401).json({
            Message :"Invalid token"
        })
    }
}


exports.authUserMiddleware = async (req, res, next) => {
  try {
    const cookies = req.cookies || {};
    const token = cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded?.id || decoded?.userId || decoded?._id;
    if (!id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await userModel.findById(id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};