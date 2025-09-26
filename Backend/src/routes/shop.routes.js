const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { createEditShope, getShop, getShopByCity } = require("../controllers/shop.controllers");
const { upload } = require("../middlewares/multer");


const shopRouter = express.Router();

shopRouter.get("/get-shop", authMiddleware.authUserMiddleware,getShop)
shopRouter.post("/create-edit-shop", authMiddleware.authUserMiddleware,upload.single("image"),createEditShope)
shopRouter.get("/get-shop-by-city/:city", authMiddleware.authUserMiddleware, getShopByCity);





module.exports = shopRouter;