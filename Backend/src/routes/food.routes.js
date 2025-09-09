const express = require("express");
const foodController = require("../controllers/food.controller")
const authMiddleware = require("../middlewares/auth.middleware")







const router = express.Router();
router.post("/",authMiddleware.authFoodpartnerMiddleware ,foodController.createFood);

module.exports = router;
