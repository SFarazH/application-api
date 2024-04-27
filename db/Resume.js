const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  name: String,
  data: Buffer,
  contentType: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const File = mongoose.model("Resume", resumeSchema);

module.exports = File;
