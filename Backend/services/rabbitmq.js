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
    console.error("RabbitMQ connection error");
  }
}

async function publishToQueue(queueName, payload) {
  const channel = await connectRabbit();
  console.log("RabbitMQ channel ready");

  await channel.assertQueue(queueName, { durable: true });
  console.log("Queue asserted:", queueName);

  const sent = channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    }
  );

  console.log("Message sent?", sent);
}

module.exports = { connectRabbit, publishToQueue };
