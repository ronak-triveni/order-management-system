const express = require("express");
const dotenv = require("dotenv");
const db = require("./models");
const app = express();
router = express.Router();
dotenv.config();
app.use(express.json());

const PORT = process.env.PORT;

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log("Server is running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    console.error(
      "Please make sure your database is running and credentials are correct."
    );
    process.exit(1);
  });
