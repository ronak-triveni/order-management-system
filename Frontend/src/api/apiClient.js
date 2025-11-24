import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

export const createOrder = (payload) => api.post('/orders', payload);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const searchOrders = (body) => api.post('/orders/search', body);
export const getReport = () => api.get('/orders/report');

export default api;
