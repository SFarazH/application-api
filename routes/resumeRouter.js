const express = require("express");
const multer = require("multer");
const Resume = require("../db/Resume");
const { authenticate } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add", authenticate, upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const resumeId = uuidv4();
  try {
    const newResume = {
      resumeId: resumeId,
      fileName: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      role: req.body.role,
    };

    const user = req.user;
    user.resume.push(newResume);
    await user.save();

    res.status(200).send(`Resume uploaded for ${req.body.role} role.`);
  } catch (err) {
    console.log("Error uploading file:", err);
    res.status(500).send("Error uploading file.");
  }
});

router.get("/get", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const resume = user.resume;
    const roles = resume.map((resu) => resu.role);

    res.status(200).json({ resume });

    // const pdf = await PdfModel.findById(req.params.id);

    // if (!pdf) {
    //   return res.status(404).send("PDF file not found.");
    // }
    // res.send(pdf.data);
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).send("Error retrieving file.");
  }
});

router.get("/getResume", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const resumeId = req.body.resumeId;
    const resume = user.resume;
    const result = resume.filter((resu) => resu.resumeId === resumeId);
    res.send(result[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Error" });
  }
});

module.exports = router;
