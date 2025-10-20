
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

router.post("/update-order-status/:orderId/:shopId", authMiddleware.authUserMiddleware, orderController.updateOrderStatus);
router.get("/get-assigned-orders", authMiddleware.authUserMiddleware, orderController.getDeliveryBoyAssignment);
router.get(
  "/accept-order/:assignmentId",
  authMiddleware.authUserMiddleware,
  orderController.acceptOrder
);

router.get(
  "/get-current-orders",
  authMiddleware.authUserMiddleware,
  orderController.getCurrentOrders
);
 

module.exports = router;