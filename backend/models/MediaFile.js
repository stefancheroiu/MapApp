const mongoose = require("mongoose");

const mediaFileSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      require: true,
    },
    username: {
      type: String,
      require: true,
    },
    pinId: {
      type: String,
      require: true,
    },
    path: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MediaFile", mediaFileSchema);