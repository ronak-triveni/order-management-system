const express = require("express");
const {
  createOrder,
  getOrderById,
  orderSearch,
  generateReport,
} = require("../controllers/order.controller");
router = express.Router();

router.post("/", createOrder);
router.get("/:id", getOrderById);
router.post("/search", orderSearch);
router.get("/report", generateReport);

module.exports = router;
