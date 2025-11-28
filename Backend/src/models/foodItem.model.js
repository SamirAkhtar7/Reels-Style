const mongoose = require("mongoose");
const userModel = require ("./user.model")

const videoSchema = new mongoose.Schema({
 name: {
    type: String,
    require: true,
  },
  videoUrl: {
    type: String,
    require: true,
  },
  description: {
    type: String,
 
  },
  like: {
    type: Number,
    default: 0,
  }
});

const videoModel = mongoose.model("food", videoSchema)
module.exports = videoModel;
