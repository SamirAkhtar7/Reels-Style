const foodModel = require("../models/foodItem.model");
const storageService =require("../services/storage.service")
const {v4:uuid } = require("uuid")
exports.createFood = async (req, res) => {

    // console.log(req.body)
    // console.log(req.file)
    const fileUploadResult =await storageService.uploadFile(req.file.buffer,uuid())
    
    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video: fileUploadResult.url,
        foodPartner:req.foodPartner
    })


    res.status(201).json({
        Message: "food create succssfully",
        food:foodItem
    })
};
