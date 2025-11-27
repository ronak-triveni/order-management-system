const amqp = require("amqplib");
const RABBIT_URL = process.env.RABBIT_URL;

let channel = null;

async function connectRabbit() {
  try {
    if (channel) return channel;
    connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createChannel();
    console.log("RabbitMQ connected...");
    return channel;
  } catch (error) {
    logger.error("RabbitMQ connection issue", {
      error: error.stack,
    });
    throw error;
  }
}

async function publishToQueue(queueName, payload) {
  const channel = await connectRabbit();
  const EXCHANGE = "order_exchange";
  const ROUTING_KEY = "order.created";

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, EXCHANGE, "order.*");

  const sent = channel.publish(
    EXCHANGE,
    ROUTING_KEY,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );

  console.log("Published to exchange?", sent);
}

module.exports = { connectRabbit, publishToQueue };
