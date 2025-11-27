const logger = require("../utils/errorLogger");
const db = require("../models");
const { Customer, Order } = db;
const { publishToQueue } = require("../services/rabbitmq");
const { indexOrder, searchOrders } = require("../services/esService");
const redis = require("../services/redisClient");
const { sequelize } = require("../models");
const { errors } = require("@elastic/elasticsearch");

exports.createOrder = async (req, res) => {
  try {
    const { customer, items, shipping, extra } = req.body;

    if (!customer || typeof customer !== "object") {
      logger.error("Validation failed: customer object missing", {
        body: req.body,
      });
      return res.status(400).json({ error: "Customer data is required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      logger.error("Validation failed: items missing", { body: req.body });
      return res.status(400).json({ error: "Item details are required!" });
    }

    if (
      !customer.name ||
      typeof customer.name !== "string" ||
      customer.name.length > 20
    ) {
      logger.error("Validation failed: invalid customer name", { customer });
      return res.status(400).json({ error: "Invalid customer name!" });
    }

    if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      logger.error("Validation failed: invalid email", { customer });
      return res.status(400).json({ error: "Invalid email address!" });
    }

    if (!customer.phone || !/^[0-9]{10}$/.test(customer.phone)) {
      logger.error("Validation failed: invalid phone", { customer });
      return res.status(400).json({ error: "Invalid phone number!" });
    }

    let cust = await Customer.findOne({
      where: { email: customer.email },
    }).catch((err) => {
      logger.error("DB error: failed to query customer", {
        error: err.stack,
        email: customer.email,
      });
      return null;
    });

    if (!cust) {
      try {
        cust = await Customer.create({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        });
      } catch (err) {
        logger.error("DB error: failed to create customer", {
          error: err.stack,
          customer,
        });
        return res.status(500).json({ error: "Customer creation failed!" });
      }
    }

    let order;
    try {
      order = await Order.create({
        customerId: cust.id,
        status: "pending",
        orderDetails: { items, shipping, extra },
      });
    } catch (err) {
      logger.error("DB error: order creation failed", {
        error: err.stack,
        body: req.body,
      });
      return res.status(500).json({ error: "Order creation failed!" });
    }

    try {
      await publishToQueue("orders_queue", { orderId: order.id });
    } catch (err) {
      logger.error("RabbitMQ error: failed to publish order event", {
        error: err.stack,
        orderId: order.id,
      });
    }

    try {
      await indexOrder(order, cust);
    } catch (err) {
      logger.error("Elasticsearch error: indexing failed", {
        error: err.stack,
        orderId: order.id,
      });
    }

    return res.json({ orderId: order.id, completed: true });
  } catch (error) {
    logger.error("Unhandled exception in createOrder", { error: error.stack });
    return res.status(500).json("Internal Server Error!");
  }
};

exports.getOrderById = async (req, res) => {
  const id = req.params.id;
  const cacheKey = `order:${id}`;

  try {
    const cached = await redis.get(cacheKey).catch((err) => {
      logger.error("Redis error: get failed", { error: err.stack, cacheKey });
      return null;
    });

    if (cached) {
      return res.json({ source: "cache", order: JSON.parse(cached) });
    }

    const order = await Order.findOne({
      where: { id },
      include: [{ model: db.Customer }],
    }).catch((err) => {
      logger.error("DB error: fetching order failed", { error: err.stack, id });
      return null;
    });

    if (!order) {
      logger.error("Order not found", { id });
      return res.status(404).json({ error: "Order Not Found!" });
    }

    const result = order.toJSON();

    await redis
      .set(cacheKey, JSON.stringify(result), { EX: 30 })
      .catch((err) => {
        logger.error("Redis error: set failed", { error: err.stack, cacheKey });
      });

    return res.json({ source: "db", order: result });
  } catch (error) {
    logger.error("Unhandled exception in getOrderById", { error: error.stack });
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

exports.orderSearch = async (req, res) => {
  try {
    const { text = "", page = 1, size = 10 } = req.query;

    const textLower = text.trim().toLowerCase();
    const validStatuses = ["pending", "processing", "completed", "failed"];
    let status = validStatuses.includes(textLower) ? textLower : null;

    const results = await searchOrders(
      { text, status },
      (page - 1) * size,
      Number(size)
    ).catch((err) => {
      logger.error("Elasticsearch error: search failed", {
        error: err.stack,
        text,
      });
      return null;
    });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Order Results Found." });
    }

    return res.json({ results });
  } catch (error) {
    logger.error("Unhandled exception in orderSearch", { error: error.stack });
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

exports.getOrdersForGrid = async (req, res) => {
  try {
    const {
      page = 1,
      size = 20,
      sortBy = "createdAt",
      sortDir = "DESC",
      status = "",
      filters = "{}",
    } = req.query;

    let filterObj = {};
    try {
      filterObj = JSON.parse(filters);
    } catch (err) {
      logger.warn("Invalid filters JSON", { filters });
    }

    const whereFilters = {
      status: filterObj.status?.filter || "",
      customerId: filterObj.customerId?.filter || "",
      shippingMethod: filterObj.shippingMethod?.filter || "",
      createdAtFrom: filterObj.createdAtCST?.dateFrom || "",
      createdAtTo: filterObj.createdAtCST?.dateTo || "",
      itemName: filterObj.items?.filter || "",
    };

    const offset = (page - 1) * size;

    const raw = await sequelize
      .query(
        `CALL GetOrdersForGrid(:offset, :limit, :sortBy, :sortDir, :status, :customerId, :shippingMethod,
      :createdAtFrom, :createdAtTo, :itemName)`,
        {
          replacements: {
            offset,
            limit: Number(size),
            sortBy,
            sortDir,
            ...whereFilters,
          },
        }
      )
      .catch((err) => {
        logger.error("DB error: GetOrdersForGrid failed", { error: err.stack });
        return null;
      });

    if (!raw) {
      return res.status(500).json({ message: "Database failure" });
    }

    const rows = raw;
    const results = rows.map((o) => {
      let details = {};

      if (typeof o.orderDetails === "string") {
        try {
          details = JSON.parse(o.orderDetails);
        } catch {
          logger.warn("Order details JSON parse failed", { orderId: o.id });
        }
      } else if (typeof o.orderDetails === "object") {
        details = o.orderDetails;
      }

      return {
        id: o.id,
        customerId: o.customerId,
        status: o.status,
        createdAtCST: o.createdAtCST,
        updatedAtCST: o.updatedAtCST,
        items: details.items || [],
        itemsText: details.items
          ? details.items.map((i) => i.name).join(", ")
          : "",
        itemsCount: details.items ? details.items.length : 0,
        shippingMethod: details.shipping?.method || "",
        shippingAddress: details.shipping?.address || "",
        tracking: details.shipping?.tracking || "",
      };
    });

    const countResult = await sequelize
      .query(`CALL CountOrdersForGrid(:status)`, { replacements: { status } })
      .catch((err) => {
        logger.error("DB error: CountOrdersForGrid failed", {
          error: err.stack,
        });
        return [{ total: 0 }];
      });

    res.json({
      results,
      total: countResult[0]?.total || 0,
      page: Number(page),
      size: Number(size),
    });
  } catch (err) {
    logger.error("Unhandled exception in getOrdersForGrid", {
      error: err.stack,
    });
    res.status(500).json({ message: "Internal Server Error" });
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
    logger.error("Unhandled exception in getReport", { error: error.stack });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
