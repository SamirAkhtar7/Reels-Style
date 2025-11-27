const ItemImport = require("../models/item.model");
const itemModel = ItemImport.default || ItemImrt;

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await itemModel
      .find({ video: { $exists: true } })
      .select("video videoTitle videoDescription -_id");
    return res.status(200).json({ videos });
  } catch (error) {
    return res.status(500).json({ message: `Error getting videos: ${error}` });
  }
};

exports.getAllVideoByShopeId = async (req, res) => {

    const { shopId } = req.params;

    try {
        const videos = await itemModel
            .find({ shop: shopId, video: { $exists: true } })
            .select("video videoTitle videoDescription -_id");
        return res.status(200).json({ videos });
    } catch (error) {
        return res.status(500).json({ message: `Error getting videos: ${error}` });
    }
   
}
