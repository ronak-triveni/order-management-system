const redis = require("redis");
const REDIS_URL = process.env.REDIS_URL;

const client = redis.createClient({
  url: REDIS_URL,
  legacyMode: false,
});

client.on("error", (err) => logger.error("Redis error", { error: err.stack }));

client
  .connect()
  .then(() => console.log("Redis connected"))
  .catch((err) => logger.error("Redis connection failed", { error: err.stack }));

module.exports = client;
