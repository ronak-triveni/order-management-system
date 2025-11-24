require("dotenv").config({ path: __dirname + "/../.env" });
const { indexOrder } = require("../services/esService");
const amqp = require("amqplib");
const db = require("../models");
const { Order, OrderProcessingLog } = db;
const RABBIT_URL = process.env.RABBIT_URL;
const QUEUE = "orders_queue";

const EXCHANGE = "order_exchange";
const ROUTINGKEY = "order.*";
const EXCHANGETYPE = "topic";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function orderWorker() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, EXCHANGETYPE, { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTINGKEY);

  console.log("Order worker running...");

  channel.consume(
    QUEUE,
    async (msg) => {
      const payload = JSON.parse(msg.content.toString());
      const { orderId } = payload;

      console.log("Processing order", orderId);
      try {
        await OrderProcessingLog.create({
          orderId,
          step: "validation",
          status: "success",
          logMessage: "Order validated",
        });

        await OrderProcessingLog.create({
          orderId,
          step: "payment",
          status: "processing",
          logMessage: "Payment started",
        });

        await delay(1000);

        const paymentSuccess = true;

        await OrderProcessingLog.create({
          orderId,
          step: "payment",
          status: paymentSuccess ? "success" : "error",
          logMessage: paymentSuccess ? "Payment done" : "Payment failed",
        });

        if (!paymentSuccess) {
          await Order.update({ status: "failed" }, { where: { id: orderId } });
          channel.ack(msg);
          return;
        }

        await OrderProcessingLog.create({
          orderId,
          step: "invoice",
          status: "success",
          logMessage: "Invoice generated",
        });

        await Order.update({ status: "completed" }, { where: { id: orderId } });

        const updatedOrder = await Order.findByPk(orderId);
        const customer = await db.Customer.findByPk(updatedOrder.customerId);

        await indexOrder(updatedOrder, customer);

        channel.ack(msg);
      } catch (error) {
        console.error("Worker error:", error);

        await OrderProcessingLog.create({
          orderId,
          step: "worker",
          status: "error",
          logMessage: error.message || "unknown",
        });

        await Order.update({ status: "failed" }, { where: { id: orderId } });

        const updatedOrder = await Order.findByPk(orderId);
        const customer = await db.Customer.findByPk(updatedOrder.customerId);
        await indexOrder(updatedOrder, customer);

        channel.ack(msg);
      }
    },
    { noAck: false }
  );
}

orderWorker();
