const mongoose = require("../config/db");

const errorLogSchema = new mongoose.Schema({
  level: { type: String, default: "error" },
  message: { type: String, required: true },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ErrorLog", errorLogSchema);
