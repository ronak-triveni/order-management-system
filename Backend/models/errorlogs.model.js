const mongoose = require("../config/db");

const errorSchema = new mongoose.Schema({
  error: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Errorlogs", errorSchema);
