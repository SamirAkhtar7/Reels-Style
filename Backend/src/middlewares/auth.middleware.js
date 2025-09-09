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
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            Message:"Please login first"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id);
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({
            message:"Invalid token"
        })
    }
}