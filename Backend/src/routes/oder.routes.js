
const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");


const router = express.Router();

router.post(
  "/place-order",
  authMiddleware.authUserMiddleware,
  orderController.placeOrder
);
 

module.exports = router;