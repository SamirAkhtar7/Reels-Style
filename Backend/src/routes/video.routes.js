const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const { getAllVideos} = require("../controllers/video.controller");
const { getAllVideoByShopeId} = require("../controllers/video.controller"); 

// Public Routes

router.get("/get-all-videos", getAllVideos);
router.get("/get-all-videos-by-shop/:shopId",getAllVideoByShopeId  );

// Protected Routes

module.exports = router;