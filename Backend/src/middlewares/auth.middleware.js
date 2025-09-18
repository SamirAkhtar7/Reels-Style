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




exports.verifyToken = (req, res, next)=> {
  try {
    // read token from cookie or Authorization header
    const token =
      (req.cookies && req.cookies.token) ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          // clear cookie if present and inform client
          if (req.cookies && req.cookies.token) {
            res.clearCookie("token");
          }
          return res.status(401).json({ message: "TokenExpired" });
        }
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded;
      next();
    });
  } catch (e) {
    return res.status(500).json({ message: "Authentication error" });
  }
};