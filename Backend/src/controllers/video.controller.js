const ItemImport = require("../models/item.model");
const itemModel = ItemImport.default || ItemImport;
const FoodVideoImport = require("../models/foodItem.model");
const FoodVideoModel = FoodVideoImport.default || FoodVideoImport;

// Helper: normalize items -> video objects (prefer populated `videos` doc, fall back to legacy `video` URL)
function extractVideoFromItem(item) {
  if (!item) return null;
  if (item.videos) {
    const v = item.videos;
    return {
      _id: v._id,
      videoUrl: v.videoUrl || v.video || item.video || null,
      name: v.name || item.videoTitle || item.name,
      description: v.description || item.videoDescription || "",
      like: v.like || 0,
    };
  }
  if (item.video) {
    return {
      _id: item._id,
      videoUrl: item.video,
      name: item.videoTitle || item.name,
      description: item.videoDescription || "",
    };
  }
  return null;
}

// Get all videos across items
exports.getAllVideos = async (req, res) => {
  try {
    const items = await itemModel
      .find({
        $or: [
          { videos: { $exists: true, $ne: null } },
          { video: { $exists: true, $ne: null } },
        ],
      })
      .populate("videos");

    const videos = items.map((it) => extractVideoFromItem(it)).filter(Boolean);

    return res.status(200).json({ videos });
  } catch (error) {
    return res.status(500).json({ message: `Error getting videos: ${error}` });
  }
};

// Get all videos for a specific shop
exports.getAllVideoByShopeId = async (req, res) => {
  const { shopId } = req.params;
  if (!shopId) return res.status(400).json({ message: "shopId is required" });
  try {
    const items = await itemModel.find({ shop: shopId }).populate("videos");

    const videos = items.map((it) => extractVideoFromItem(it)).filter(Boolean);

    return res.status(200).json({ videos });
  } catch (error) {
    return res.status(500).json({ message: `Error getting videos: ${error}` });
  }
};
