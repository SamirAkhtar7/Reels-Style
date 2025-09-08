const express = require('express');
const authController =require('../controllers/auth.controller')


const router = express.Router();
//user auth APIs
router.post("/user/register", authController.register);
router.post("/user/loggin", authController.loginUser);
router.get("/user/logout", authController.logoutUser);

//Food partner auth APIs
router.post("/food-partner/register", authController.registerFoodPartner);
router.post("/food-partner/loggin", authController.loginFoodpartner);
router.get("/food-partner/logout", authController.logoutFoodpartner);
module.exports = router;