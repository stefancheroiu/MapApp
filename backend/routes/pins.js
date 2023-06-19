const router = require("express").Router();
const Pin = require("../models/Pin");
const MediaFile = require("../models/MediaFile");

router.post("/", async (req, res) => {
  try {
    const newPin = new Pin(req.body);
    const savedPin = await newPin.save();
    if (req.file) {
      const newMediaFile = new MediaFile({
        type: "image",
        username: req.body.username,
        path: req.file.path,
      });
      const savedMediaFile = await newMediaFile.save();
      savedPin.mediaFile = savedMediaFile._id;
      await savedPin.save();
    }
    res.status(200).json(savedPin);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const pins = await Pin.find();
    res.status(200).json(pins);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:pinId/like", async (req, res) => {
  const { pinId } = req.params;
  const { rating } = req.body;
  try {
    let _pin = await Pin.findById(pinId).exec()
    let pin = null;
    if(_pin.rating.includes(rating)) {
      pin = await Pin.findByIdAndUpdate(
        pinId,
        { $pull: {rating:rating}},
        { new: true }
      ); 
    } else {
      pin = await Pin.findByIdAndUpdate(
        pinId,
        { $push: {rating:rating}},
        { new: true }
      );
    }
    if (!pin) {
      return res.status(404).json({ error: "Pin not found" });
    }
    res.json(pin);
  } catch (error) {
    console.error("Failed to update pin rating", error);
    res.status(500).json({ error: "Failed to update pin rating" });
  }
});

module.exports = router;
