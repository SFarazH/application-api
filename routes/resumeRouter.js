const express = require('express')
const multer = require("multer");
const Resume = require("../db/Resume");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const newPdf = new Resume({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      role: req.body.role,
    });

    await newPdf.save();
    res
      .status(200)
      .send(`File "${req.file.originalname}" uploaded successfully.`);
  } catch (err) {
    console.log("Error uploading file:", err);
    res.status(500).send("Error uploading file.");
  }
});

router.get("/download/:id", async (req, res) => {
  try {
    const pdf = await PdfModel.findById(req.params.id);

    if (!pdf) {
      return res.status(404).send("PDF file not found.");
    }

    res.setHeader("Content-Type", pdf.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${pdf.name}"`);
    res.send(pdf.data);
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).send("Error retrieving file.");
  }
});

module.exports = router;