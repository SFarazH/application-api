const express = require("express");
const { authenticate } = require("../middleware/auth");
const User = require("../db/User");

const router = express.Router();

router.post("/add", authenticate, async (req, res) => {
  try {
    const { note } = req.body;
    const user = req.user;
    user.notes.push(note);
    await user.save();
    res.status(200).json({ message: "Note added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add note", error: error.message });
  }
});

router.patch("/rem", authenticate, async (req, res) => {
  try {
    const { noteId } = req.body;
    const user = req.user;
    if (noteId < 0 || noteId >= user.notes.length) {
      return res.status(400).json({ message: "Invalid index provided" });
    }
    user.notes.splice(noteId, 1);
    await user.save();
    res.status(200).json({ message: "Note removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove note", error: error.message });
  }
});

router.get("/get", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const notes = user.notes;

    res.status(200).json({ notes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch notes", error: error.message });
  }
});

module.exports = router;
