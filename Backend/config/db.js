const mongoose = require("mongoose");
const logger = require("../utils/errorLogger");
mongoose
  .connect("mongodb://localhost:27017/oms_error_logs")
  .then(() => console.log("MongoDB connected"))
  .catch((error) =>
    logger.error("MongoDB connection error", { error: error.stack })
  );

module.exports = mongoose;
