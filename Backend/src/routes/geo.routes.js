
const express = require("express");
const { reverseGeocode } = require("../controllers/geo.controller");

const router = express.Router();

router.get("/reverse", reverseGeocode);


module.exports = router;
