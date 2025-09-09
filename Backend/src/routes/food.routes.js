const express = require("express");
const foodController = require("../controllers/food.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const multer = require("multer")



const upload = multer({
    storage:multer.memoryStorage()
})


const router = express.Router();
router.post("/", authMiddleware.authFoodpartnerMiddleware, upload.single("video"), foodController.createFood);
/*GET /api/food/*/
router.get("/",
   authMiddleware.authUserMiddleware,
    foodController.getFoodItems
)

module.exports = router;
