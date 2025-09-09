const foodpartnerModel = require("../models/foodpartner.model");
const jwt = require("jsonwebtoken");




exports.authFoodpartnerMiddleware = async(req, res, next) => {
    
    const token = req.cookie.token;
    if (!token) {
        return res.state(401).json({
            Message:"Unauthorized"
        })
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const foodpartner = await foodpartnerModel.findById(decode._id);
        req.foodpartner = foodpartner;
        next()


    } catch (err) {
        return res.state(401).json({
            Message :"Invalid token"
        })
    }
}