const express = require("express");
const { authenticate } = require("../middleware/auth");
const User = require("../db/User");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/add", authenticate, async (req, res) => {
  try {
    const { company, jobRole, platform, dateApplied } = req.body;
    if (!company || !jobRole || !platform || !dateApplied) {
      return res.status(400).json({ message: "Incomplete data sent" });
    }
    const appId = uuidv4();
    const newApplication = {
      appId: appId,
      company,
      jobRole,
      platform,
      dateApplied: new Date(dateApplied),
    };
    const user = req.user;
    user.applications.push(newApplication);
    await user.save();

    res.status(200).json({
      message: `Application added with ID : ${appId}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add application", error: error.message });
  }
});

router.get("/get", authenticate, (req, res) => {
  try {
    const user = req.user;
    const applications = user.applications;

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: `Error getting applications : ${error}` });
  }
});

router.patch("/rem", authenticate, async (req, res) => {
  try {
    const { appId } = req.body;
    const user = req.user;
    if (!appId || appId.trim() === "") {
      return res.status(400).json({ message: "Invalid Id provided" });
    }
    const result = await User.updateOne(
      //   { _id: user._id },
      { $pull: { applications: { appId } } }
    );
    // console.log(result);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove application", error: error.message });
  }
});

module.exports = router;
