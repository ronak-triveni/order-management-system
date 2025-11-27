const winston = require("winston");
const Errorlogs = require("../models/errorlog.model");

class MongoDBTransport extends winston.Transport {
  log(info, callback) {
    const { level, message, ...meta } = info;

    Errorlogs.create({
      level,
      message,
      meta,
    }).catch((err) => console.log("Mongo logging failed:", err));

    callback();
  }
}

const errorLogger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console(), new MongoDBTransport()],
});

module.exports = errorLogger;
