const express = require("express");
const { authenticate } = require("../middleware/auth");
const User = require("../db/User");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/add", authenticate, async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ message: "Incomplete data sent" });
    }
    const user = req.user;
    const noteId = uuidv4();
    user.notes.push({ noteId: noteId, note: note });
    await user.save();
    res.status(200).json({ message: `Note added with ID : ${noteId}` });
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
    if (!noteId || noteId.trim() === "") {
      return res.status(400).json({ message: "Invalid Id provided" });
    }
    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { notes: { noteId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }
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
