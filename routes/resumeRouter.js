const express = require("express");
const multer = require("multer");
const Resume = require("../db/Resume");
const User = require("../db/User");
const { authenticate } = require("../middleware/auth");
const mongoose = require("mongoose");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
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
  const app_rId = uuidv4();

  try {
    const newResume = new Resume({
      userId: user._id,
      fileName: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await newResume.save();
    user.resumes.push({
      rId: String(newResume._id),
      role: role,
      app_rId: app_rId,
    });
    await user.save();

    res.status(200).send(`Resume uploaded for ${role} role.`);
  } catch (err) {
    // console.log("Error uploading file:", err);
    res.status(500).send("Error uploading file.");
  }
});

router.get("/all", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const resumeArr = user.resumes;
    // console.log(resumeArr);
    res.send(resumeArr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.get("/resumes", authenticate, async (req, res) => {
  const user = req.user;
  const userId = user._id;
  const resumeId = req.query.rId;

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
    // const base64Data = matchedResume.data.toString("base64");

    // Set the appropriate headers
    res.setHeader("Content-Type", matchedResume.contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${matchedResume.name}"`
    );
    // res.status(200).send(matchedResume.data);
    res.status(200).send(matchedResume.data);
    // console.log(base64Data)
    // res.setHeader("Content-Type", matchedResume.contentType);
    // res.send(matchedResume.data);
  } catch (error) {
    console.error("error", error);
    res.status(500).json("Internal Server Error");
  }
});

router.patch("/rem", authenticate, async (req, res) => {
  try {
    const { app_rId, rId } = req.body;
    const user = req.user;
    if (
      !app_rId ||
      app_rId.trim() === "" ||
      !rId ||
      rId.trim() === "" ||
      !mongoose.Types.ObjectId.isValid(rId)
    ) {
      return res.status(400).json({ message: "Invalid id provided" });
    }
    const result = await User.updateOne(
      { _id: user._id },
      { $pull: { resumes: { app_rId: app_rId } } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const delResume = await Resume.findByIdAndDelete(rId);
    if (!delResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await user.save();

    res.status(200).json({ message: "Application removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove application", error: error.message });
  }
});

module.exports = router;
