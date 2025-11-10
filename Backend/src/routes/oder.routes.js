const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const router = express.Router();

// Route to place an order
router.post(
  "/place-order",
  authMiddleware.authUserMiddleware,
  orderController.placeOrder
);
// Route to get user's orders
router.get(
  "/get-my-orders",
  authMiddleware.authUserMiddleware,
  orderController.getUserOrders
);
// New route to update order status
router.post(
  "/update-order-status/:orderId/:shopId",
  authMiddleware.authUserMiddleware,
  orderController.updateOrderStatus
);
// New route to get available delivery
router.get(
  "/get-assigned-orders",
  authMiddleware.authUserMiddleware,
  orderController.getDeliveryBoyAssignment
);
// New route to accept order
router.get(
  "/accept-order/:assignmentId",
  authMiddleware.authUserMiddleware,
  orderController.acceptOrder
);

// New route to get current orders for delivery boy

router.get(
  "/get-current-orders",
  authMiddleware.authUserMiddleware,
  orderController.getCurrentOrders
);

// New route to get order by ID

router.get(
  "/get-order-by-id/:orderId",
  authMiddleware.authUserMiddleware,
  orderController.getOrderById
);

// New route to send delivery OTP
router.post(
  "/send-delivery-otp",
  authMiddleware.authUserMiddleware,
  orderController.sendDeliveryOtp
);
// New route to verify delivery OTP
router.post(
  "/verify-delivery-otp",
  authMiddleware.authUserMiddleware,
  orderController.verifyDeliveryOtp
);
// New route to verify payment
router.post(
  "/verify-payment",
  authMiddleware.authUserMiddleware,
  orderController.verifyPayment
);

router.post(
  "/get-today-deliveries",
  authMiddleware.authUserMiddleware,
  orderController.getTotalDeliveredOrdersCount
);

module.exports = router;
