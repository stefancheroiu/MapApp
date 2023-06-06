const router = require("express").Router();
const Comment = require("../models/Comment");

// Create a comment
router.post("/", async (req, res) => {
  try {
    const { username, body, pinId } = req.body;
    const newComment = new Comment({
      username,
      body,
      pinId,
    });

    const savedComment = await newComment.save();
    res.status(200).json(savedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all comments for a pin
router.get("/:pinId", async (req, res) => {
  try {
    const { pinId } = req.params;
    const comments = await Comment.find({ pinId });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
