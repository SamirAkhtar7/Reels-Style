const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware");
const { addItem, editItem,getItemById  } = require('../controllers/item.controller');
const { upload } = require('../middlewares/multer');



const itemRouter = express.Router();

itemRouter.post("/add-item", authMiddleware.authUserMiddleware, upload.single("image"), addItem)
itemRouter.post("/edit-item/:id", authMiddleware.authUserMiddleware, upload.single("image"), editItem)
itemRouter.get("/get-item/:id", authMiddleware.authUserMiddleware, getItemById );

module.exports = itemRouter;