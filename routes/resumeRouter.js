const express = require("express");
const multer = require("multer");
const Resume = require("../db/Resume");
const { authenticate } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add", authenticate, upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const resumeId = uuidv4();
  const user = req.user
  try {
    const newResume = new Resume({
      userId : user._id,
      fileName: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      role: req.body.role,
    });

    
    
    await newResume.save();

    res.status(200).send(`Resume uploaded for ${req.body.role} role.`);
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
    res.send(resume.data);
    console.log(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.get("/get", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const resume = user.resume;
    const roles = resume.map((resu) => resu.role);

    res.status(200).json({ resume });
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).send("Error retrieving file.");
  }
});

router.get("/view", authenticate, async (req, res) => {
  const { resumeId } = req.body;

  try {
    const user = req.user;
    if (!user) {
      return res.status(404).send("Resume not found");
    }

    const resume = user.resume.find((r) => r.resumeId === resumeId);
    if (!resume) {
      return res.status(404).send("Resume not found");
    }

    console.log(typeof resume.data);
    res.json(resume);
  } catch (err) {
    console.log("Error retrieving file:", err);
    res.status(500).send("Error retrieving file.");
  }
});

router.get("/getResume", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const resumeId = req.body.resumeId;
    const resume = user.resume;
    const result = resume.filter((resu) => resu.resumeId === resumeId);

    res.setHeader("Content-Type", result[0].contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result[0].fileName}"`
    );
    res.send(result[0].data);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Error" });
  }
});

module.exports = router;
