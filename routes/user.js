const express = require("express");
const { authenticate } = require("../middleware/auth");
const noteRouter = require("./notesRouter");
const appRouter = require("./applicationRouter");
const resumeRouter = require("./resumeRouter");
const router = express.Router();

router.use("/notes", noteRouter);
router.use("/app", appRouter);
router.use("/resume", resumeRouter);

router.get("/profile", authenticate, (req, res) => {
  res.status(200).json(req.user.name);
});

module.exports = router;
