import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "./ordersSlice";
import reportReducer from "./reportSlice";

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    report: reportReducer,
  },
});

export default store;
