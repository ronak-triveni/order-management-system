import axios from "axios";
import { toast } from "react-toastify";

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    // toast.error(error.response.data.message || "Something went wrong");

    return Promise.reject(error.response.data);
  }
);

export default api;
