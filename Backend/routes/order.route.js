const express = require("express");
const {
  createOrder,
  getOrderById,
  orderSearch,
  getReport,
  getOrdersForGrid,
} = require("../controllers/order.controller");
router = express.Router();

router.post("/", createOrder);
router.get("/search", orderSearch);
router.get("/report", getReport);
router.get("/ag-grid", getOrdersForGrid);
router.get("/:id", getOrderById);

module.exports = router;
