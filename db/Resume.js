const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  name: String,
  data: Buffer,
  contentType: String,
  role : String
});

const File = mongoose.model('Resume', resumeSchema);

module.exports = File;