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

  if (!req.body.role) {
    return res.status(400).send("No role mentioned.");
  }

  const user = req.user;
  const role = req.body.role;

  try {
    const newResume = new Resume({
      userId: user._id,
      fileName: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await newResume.save();
    user.resumes.push({ rId: newResume._id, role: role });
    await user.save();

    res.status(200).send(`Resume uploaded for ${role} role.`);
  } catch (err) {
    console.log("Error uploading file:", err);
    res.status(500).send("Error uploading file.");
  }
});

router.get("/g", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const resumeArr = user.resumes;
    console.log(resumeArr);
    res.send(resumeArr);
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
