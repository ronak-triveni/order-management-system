const db = require("../models");
const { Customer, Order } = db;
const { publishToQueue } = require("../services/rabbitmq");
const { indexOrder, searchOrders } = require("../services/esService");
const redis = require("../services/redisClient");
const { sequelize } = require("../models");

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
    let status = null;
    const textLower = input?.trim().toLowerCase() || "";

    const validStatuses = ["pending", "processing", "completed", "failed"];
    if (validStatuses.includes(textLower)) {
      status = textLower;
    }
    const results = await searchOrders(
      { text: input, status },
      (page - 1) * size,
      Number(size)
    );
    return res.json({ results });
  } catch (error) {
    console.error("Error while searching order!", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

exports.getReport = async (req, res) => {
  try {
    const query = `
    WITH recent_status AS (
      SELECT
          o.id AS orderId,
          o.customerId,
          o.status AS currentStatus,
          log.step,
          log.status AS stepStatus,
          log.logMessage,
          log.createdAt AS transitionTime,

          /* Shipping fields */
          JSON_UNQUOTE(JSON_EXTRACT(o.orderDetails, '$.shipping.method')) AS shippingMethod,
          JSON_UNQUOTE(JSON_EXTRACT(o.orderDetails, '$.shipping.address')) AS shippingAddress,
          JSON_UNQUOTE(JSON_EXTRACT(o.orderDetails, '$.shipping.tracking')) AS trackingId,

          /* Items extracted with JSON_TABLE */
          jt.qty,
          jt.sku,
          jt.name,
          jt.price

      FROM Orders o
      JOIN OrderProcessingLogs log ON log.orderId = o.id

      JOIN JSON_TABLE(
        o.orderDetails,
        '$.items[*]'
        COLUMNS (
          qty INT PATH '$.qty',
          sku VARCHAR(50) PATH '$.sku',
          name VARCHAR(100) PATH '$.name',
          price DECIMAL(10,2) PATH '$.price'
        )
      ) AS jt

      WHERE o.createdAt >= NOW() - INTERVAL 7 DAY
    ),

    status_count AS (
      SELECT
          o.status,
          COUNT(*) AS totalOrders
      FROM Orders o
      GROUP BY o.status
    )

    /* FINAL OUTPUT */
    SELECT
      /* Transitions with items merged */
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'orderId', rs.orderId,
            'customerId', rs.customerId,
            'currentStatus', rs.currentStatus,
            'step', rs.step,
            'stepStatus', rs.stepStatus,
            'logMessage', rs.logMessage,
            'transitionTime', rs.transitionTime,
            'item', JSON_OBJECT(
              'qty', rs.qty,
              'sku', rs.sku,
              'name', rs.name,
              'price', rs.price
            ),
            'shippingMethod', rs.shippingMethod,
            'shippingAddress', rs.shippingAddress,
            'trackingId', rs.trackingId
          )
        )
        FROM recent_status rs
      ) AS recentTransitions,

      /* Status Count */
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'status', sc.status,
            'totalOrders', sc.totalOrders
          )
        )
        FROM status_count sc
      ) AS statusCounts;
    `;

    const [rows] = await sequelize.query(query);

    res.json({
      success: true,
      recentTransitions: rows[0].recentTransitions || [],
      statusCounts: rows[0].statusCounts || [],
    });
  } catch (error) {
    console.error("Error while generating report!", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
