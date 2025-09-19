const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware");
const { addItem, editItem } = require('../controllers/item.controller');
const { upload } = require('../middlewares/multer');


const itemRouter = express.Router();

itemRouter.post("/add-item", authMiddleware.authUserMiddleware, upload.single("image"), addItem)
itemRouter.get("/edit-item", authMiddleware.authUserMiddleware, editItem)


module.exports = itemRouter;