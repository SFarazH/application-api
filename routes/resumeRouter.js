const express = require("express");
const multer = require("multer");
const Resume = require("../db/Resume");
const { authenticate } = require("../middleware/auth");
const mongoose = require("mongoose");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add", authenticate, upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const user = req.user;
  try {
    const newResume = new Resume({
      userId: user._id,
      fileName: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await newResume.save();
    user.resumes.push(newResume._id);
    await user.save();

    res.status(200).send(`Resume uploaded for role.`);
  } catch (err) {
    console.log("Error uploading file:", err);
    res.status(500).send("Error uploading file.");
  }
});

router.get("/g", async (req, res) => {
  try {
    const rId = req.body.rId;
    const resume = await Resume.findById(rId);
    res.setHeader("Content-Type", resume.contentType);
    // res.send(resume.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.get("/resumes", authenticate, async (req, res) => {
  const user = req.user;
  const userId = user._id;
  const resumeId = req.body.rId;

  try {
    const query = {
      userId: userId,
      _id: resumeId,
    };

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(404).json({ error: "Invalid Resume ID" });
    }

    const matchedResume = await Resume.findOne(query);

    if (!matchedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.setHeader("Content-Type", matchedResume.contentType);
    res.send(matchedResume.data);
  } catch (error) {
    console.error("error", error);
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
