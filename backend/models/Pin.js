const mongoose = require("mongoose");

const PinSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      require: true,
      min: 3,
      max: 60,
    },
    desc: {
      type: String,
      require: true,
      min: 3,
    },
    rating: {
      type: Array,
      default: [],
    },
    long: {
      type: Number,
      require: true,
    },
    lat: {
      type: Number,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pin", PinSchema);
