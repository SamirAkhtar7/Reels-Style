const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  addItem,
  editItem,
  getItemById,
  deleteItem,
  getItemByCity,
  getItemByShop,
  searchItems,
  rating,
  getAllItems
} = require("../controllers/item.controller");


const multer = require("multer");
const { memoryStorage } = require("multer");
const storage = memoryStorage();
const upload = multer({ storage: storage });

const itemRouter = express.Router();



//pubic Routes





//protected Routes

itemRouter.post(
  "/add-item",
  authMiddleware.authUserMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  addItem
);
itemRouter.post(
  "/edit-item/:id",
  authMiddleware.authUserMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  editItem
);
itemRouter.get("/get-item/:id", authMiddleware.authUserMiddleware, getItemById);
itemRouter.get(
  "/delete-item/:id",
  authMiddleware.authUserMiddleware,
  deleteItem
);
itemRouter.get(
  "/get-item-by-city/:city",
  authMiddleware.authUserMiddleware,
  getItemByCity
);
itemRouter.get(
  "/get-item-by-shop/:shopId",
  authMiddleware.authUserMiddleware,
  getItemByShop
);
// Allow search using query params (e.g. /api/item/search-items?query=xxx&city=yyy)
itemRouter.get("/search-items", authMiddleware.authUserMiddleware, searchItems);

// Backwards-compatible route that uses path params (city & query)
itemRouter.get(
  "/search-items/:city/:query",
  authMiddleware.authUserMiddleware,
  searchItems
);

// Export the router
itemRouter.post("/rating", authMiddleware.authUserMiddleware, rating);

//all items 
itemRouter.get("/all-items",getAllItems)

module.exports = itemRouter;
