const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    body: {
      type: String,
      require: true,
    },
    pinId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
