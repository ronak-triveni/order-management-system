const express = require("express");
const db = require("./models");
const orders = require("./routes/order.route");
const esClient = require("./services/esClient");
const redis = require("./services/redisClient");
const cors = require("cors");

require("dotenv").config();
router = express.Router();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.use(
  cors({
    origin: "*",
    methods: "GET,POST",
    allowedHeaders: "*",
  })
);

app.use("/orders", orders);

// redis connection
async function ensureRedis() {
  (async () => {
    const client = await redis;
    await client.set("name", "triveni");
    const data = await client.get("name");
    console.log(data);
  })();
}

// elastic connection
async function ensureElasticIfRequired() {
  try {
    await esClient.ping();
    console.log("ElasticSearch connected...");
  } catch (err) {
    console.error("ElasticSearch ping failed:", err);
    process.exit(1);
  }
}

// sql db connection
db.sequelize
  .authenticate()
  .then(async () => {
    console.log("Database connection successful");
    await ensureElasticIfRequired();
    await ensureRedis();
    app.listen(PORT, () => {
      console.log("Server is running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
