const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/oms_error_logs")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("Mongodb connection error", error));

module.exports = mongoose;
