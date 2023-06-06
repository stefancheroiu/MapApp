const router = require("express").Router();
const Pin = require("../models/Pin");

//create a pin
router.post("/", async (req, res) => {
  const newPin = new Pin(req.body);
  try {
    const savedPin = await newPin.save();
    res.status(200).json(savedPin);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all pins
router.get("/", async (req, res) => {
  try {
    const pins = await Pin.find();
    res.status(200).json(pins);
  } catch (err) {
    res.status(500).json(err);
  }
});

//like a pin
router.put("/:pinId/like", async (req, res) => {
  const { pinId } = req.params;
  const { rating } = req.body;
  console.log(pinId, rating)
  try {
    // Find the pin by ID and update the rating
    let _pin = await Pin.findById(pinId).exec()
    console.log(_pin)
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
