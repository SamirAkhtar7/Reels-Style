const foodpartnerModel = require("../models/foodpartner.model");
const jwt = require("jsonwebtoken");




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