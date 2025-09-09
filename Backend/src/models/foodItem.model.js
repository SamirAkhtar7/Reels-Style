const mongoose = require("mongoose");
const foodpartnerModel = require("./foodpartner.model");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  video: {
    type: String,
    require: true,
  },
  description: {
    type: String,
 
    },
    foodpartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"foodpartner"
  }
});

const foodModel = mongoose.model("food", foodSchema)
module.exports = foodModel;
