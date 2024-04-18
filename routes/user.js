const express = require("express");
const { authenticate } = require("../middleware/auth");
const noteRouter = require("./notesRouter");
const appRouter = require("./applicationRouter");
const router = express.Router();

router.use("/notes", noteRouter);
router.use("/app", appRouter);

router.get("/profile", authenticate, (req, res) => {
  res.status(200).json(req.user.name);
});

module.exports = router;
