const esClient = require("../services/esClient");
const { publishToQueue } = require("./rabbitmq");
const INDEX = process.env.ELASTIC_INDEX;

async function ensureIndex() {
  try {
    const exists = await esClient.indices.exists({ index: INDEX });

    if (!exists) {
      await esClient.indices.create({
        index: INDEX,
        body: {
          mappings: {
            properties: {
              orderId: { type: "long" },
              customerId: { type: "long" },
              customerName: { type: "text" },
              status: { type: "keyword" },
              items: {
                type: "nested",
                properties: {
                  sku: { type: "keyword" },
                  name: { type: "text" },
                  qty: { type: "integer" },
                  price: { type: "double" },
                },
              },
              createdAt: { type: "date" },
            },
          },
        },
      });
    }
  } catch (err) {
    console.error("Error while checking indexes!", err);
    throw err;
  }
}

async function indexOrder(order, customer) {
  try {
    await ensureIndex();
    const body = {
      orderId: order.id,
      customerId: order.customerId,
      customerName: customer ? customer.name : null,
      status: order.status,
      items: order.orderDetails.items || [],
      createdAt: order.createdAt,
    };
    const resp = await esClient.index({
      index: INDEX,
      id: String(order.id),
      document: body,
      refresh: "wait_for",
    });
    return resp;
  } catch (err) {
    console.error(`Failed to index order ${order.id} in ElasticSearch:`, err);
  }
}

async function searchOrders(query, from = 0, size = 10) {
  const must = [];
  const should = [];

  const text = query.text && String(query.text).trim();
  if (text && !query.status) {
    should.push({
      match: { customerName: { query: text, fuzziness: "AUTO" } },
    });

    should.push({
      nested: {
        path: "items",
        query: { match: { "items.name": { query: text, fuzziness: "AUTO" } } },
      },
    });

    if (/^\d+$/.test(text)) {
      should.push({ term: { orderId: Number(text) } });
    }
  }

  if (query.status) {
    must.push({ term: { status: query.status } });
  }

  const body = { query: { bool: {} } };
  if (must.length) body.query.bool.must = must;
  if (should.length && !query.status) {
    body.query.bool.should = should;
    body.query.bool.minimum_should_match = 1;
  }

  const esQuery = {
    index: INDEX,
    from,
    size,
    body,
  };

  const result = await esClient.search(esQuery);
  return result.hits.hits;
}

module.exports = { indexOrder, searchOrders, ensureIndex };
