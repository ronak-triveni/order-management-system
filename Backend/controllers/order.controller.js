const db = require("../models");
const { Customer, Order } = db;
const { publishToQueue } = require("../services/rabbitmq");
const { indexOrder, searchOrders } = require("../services/esService");
const redis = require("../services/redisClient");
const { where } = require("sequelize");

exports.createOrder = async (req, res) => {
  try {
    const { customer, items, shipping, extra } = req.body;

    let cust = await Customer.findOne({ where: { email: customer.email } });

    if (!cust) {
      cust = await Customer.create({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      });
    }

    const order = await Order.create({
      customerId: cust.id,
      status: "pending",
      orderDetails: { items, shipping, extra },
    });

    await publishToQueue("orders_queue", { orderId: order.id });

    try {
      await indexOrder(order, cust);
    } catch (error) {
      console.error("Elasticsearch indexing failed:", error);
    }

    return res.json({ orderId: order.id, completed: true });
  } catch (error) {
    console.error("Error while processing order...", error);
    return res.status(500).json("Internal Server Error!");
  }
};

exports.getOrderById = async (req, res) => {
  const id = req.params.id;
  const cacheKey = `order:${id}`;
  try {
    const orderExist = await Order.findByPk(id);

    if (!orderExist) {
      return res.status(400).json({ message: "Order not found!" });
    }
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({ source: "cache", order: JSON.parse(cached) });
    }

    const order = await Order.findOne({
      where: { id },
      include: [{ model: db.Customer }],
    });
    if (!order) {
      return res.json(404).json({ error: "Order Not Found!" });
    }
    const result = order.toJSON();

    await redis.set(cacheKey, JSON.stringify(result), "EX", 30);
    return res.json({ source: "db", order: result });
  } catch (error) {
    console.error("Error while fetching orders!", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

exports.orderSearch = async (req, res) => {
  try {
    const { input, page = 1, size = 10 } = req.body;
    const results = await searchOrders(
      { text: input},
      (page - 1) * size,
      Number(size)
    );
    return res.json({ results });
  } catch (error) {
    console.error("Error while searching order!", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

exports.generateReport = (req, res) => {};
