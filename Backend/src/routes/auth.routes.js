const express = require("express");
const authController = require("../controllers/auth.controller");
const { body } = require("express-validator");

const router = express.Router();

// user auth APIs - refined /user/register validators
router.post(
  "/user/register",
  body("fullName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("mobile")
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Mobile must be a 10 digit number"),
  body("role")
    .optional()
    .isIn(["user", "owner", "foodDelivery"])
    .withMessage("Role must be one of: user, owner,foodDelivery"),
  authController.register
);

router.post(
  "/user/login",
  body("email").trim().isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  authController.loginUser
);

router.post(
  "/user/send-otp",
  body("email").trim().isEmail().withMessage("Valid email required"),
  authController.sendOtp
);

router.post(
  "/user/verify-otp",
  body("email").trim().isEmail().withMessage("Valid email required"),
  body("otp")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Valid OTP required"),
  authController.verifyOtp
);
router.post(
  "/user/reset-otp",
  body("email").trim().isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  authController.resetOtp
);

router.post(
  "/user/google-auth",
  body("email").trim().isEmail().withMessage("Valid email required"),
  authController.googleAuth
);

router.get("/user/logout", authController.logoutUser);

// Food partner auth APIs
router.post("/food-partner/register", authController.registerFoodPartner);
router.post("/food-partner/loggin", authController.loginFoodpartner);
router.get("/food-partner/logout", authController.logoutFoodpartner);

module.exports = router;
