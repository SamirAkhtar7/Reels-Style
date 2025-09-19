const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { createEditShope } = require("../controllers/shop.controllers");
const { upload } = require("../middlewares/multer");


const shopRouter = express.Router();

shopRouter.post("/create-edit-shop", authMiddleware.authUserMiddleware,upload.single("image"),createEditShope)







module.exports = shopRouter;