const express = require("express");
const { authenticate } = require("../middleware/auth");
const User = require("../db/User");

const router = express.Router();

router.post("/add", authenticate, async (req, res) => {
  try {
    const { company, jobRole, platform, dateApplied } = req.body;
    if (!company || !jobRole || !platform || !dateApplied) {
      return res.status(400).json({ message: "Incomplete data sent" });
    }
    const newApplication = {
      company,
      jobRole,
      platform,
      dateApplied: new Date(dateApplied),
    };
    const user = req.user;
    user.applications.push(newApplication);
    await user.save();

    res.status(200).json({
      message: "Application added successfully",
      application: newApplication,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add application", error: error.message });
  }
});

module.exports = router;
