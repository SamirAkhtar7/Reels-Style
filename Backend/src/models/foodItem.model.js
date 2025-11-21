const mongoose = require("mongoose");
const userModel = require ("./user.model")

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
});

const foodModel = mongoose.model("food", foodSchema)
module.exports = foodModel;
