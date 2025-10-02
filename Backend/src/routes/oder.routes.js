
const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");


const router = express.Router();

router.post(
  "/place-order",
  authMiddleware.authUserMiddleware,
  orderController.placeOrder
);
router.get(
  "/get-my-orders",
  authMiddleware.authUserMiddleware,
  orderController.getUserOrders
);

 

module.exports = router;