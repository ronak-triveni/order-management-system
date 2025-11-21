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

// async function searchOrders(query, from = 0, size = 10) {
//   const esQuery = {
//     index: INDEX,
//     from,
//     size,
//     body: {
//       bool: {
//         must: [
//           ...(query.text
//             ? [
//                 {
//                   multi_match: {
//                     query: query.text,
//                     fields: ["customerName^2", "items.name", "orderId"],
//                   },
//                 },
//               ]
//             : []),
//           ...(query.status ? [{ term: { status: query.status } }] : []),
//         ],
//       },
//     },
//   };
//   const result = await esClient.search(esQuery);
//   return result.hits.hits.map((h) => h._source);
// }

async function searchOrders(query, from = 0, size = 10) {
  let mustClauses = [];

  if (query.text) {
    mustClauses.push({
      multi_match: {
        query: query.text,
        fields: ["customerName^2", "items.name", "orderId"],
      },
    });
  }

  if (query.status) {
    mustClauses.push({
      term: { status: query.status.toLowerCase() },
    });
  }

  const esQuery = {
    index: INDEX,
    from,
    size,
    body: {
      query: {
        bool: {
          must: mustClauses,
        },
      },
    },
  };

  const result = await esClient.search(esQuery);
  return result.hits.hits.map((h) => h._source);
}

module.exports = { indexOrder, searchOrders, ensureIndex };
