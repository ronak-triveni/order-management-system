const redis = require("redis");
const REDIS_URL = process.env.REDIS_URL;

const client = redis.createClient({
  url: REDIS_URL,
  legacyMode: false,
});

client.on("error", (err) => console.error("Redis Error", err));

client
  .connect()
  .then(() => console.log("Redis connected"))
  .catch((err) => console.error("Redis connection failed", err));

module.exports = client;
