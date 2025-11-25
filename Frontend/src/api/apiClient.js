import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

export const createOrder = (payload) => api.post("/orders", payload);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const searchOrders = ({ input, page = 1, size = 10 }) =>
  api.get("/orders/search", {
    params: { text: input, page, size },
  });
export const fetchOrdersForGrid = ({
  page = 1,
  size = 20,
  sortBy = "createdAt",
  sortDir = "DESC",
  status,
}) =>
  api.get("/orders/ag-grid", {
    params: { page, size, sortBy, sortDir, status },
  });

export const getReport = () => api.get("/orders/report");

export default api;
