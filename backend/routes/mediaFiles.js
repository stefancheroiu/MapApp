const router = require("express").Router();
const multer = require("multer"); 
const MediaFile = require("../models/MediaFile");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "..\\frontend\\public\\uploads"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname); 
  },
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { type, username, pinId } = req.body;
    const path = 'uploads\\' + req.file.filename;
    const newMediaFile = new MediaFile({
      type,
      username,
      path,
      pinId,
    });
    const savedMediaFile = await newMediaFile.save();
    res.status(200).json(savedMediaFile);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:pinId", async (req, res) => {
    const { pinId } = req.params;
    try {
      const mediaFiles = await MediaFile.find({pinId});
      res.status(200).json(mediaFiles);
    } catch (err) {
      res.status(500).json(err);
    }
});

module.exports = router;
