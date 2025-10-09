const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false, // do not return password field by default
    },
    mobile: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      enum: ["user", "owner", "foodDelivery"],
      require: true,
    },
    resetOtp: {
      type: String,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpires: {
      type: Date,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [latitude,longitude]
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: '2dsphere' });

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;