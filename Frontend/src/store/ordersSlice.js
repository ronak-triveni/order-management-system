import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/apiClient";

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (payload, thunkAPI) => {
    const res = await api.createOrder(payload);
    return res.data;
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id, thunkAPI) => {
    const res = await api.getOrderById(id);
    console.log(res);
    return res.data;
  }
);

export const searchOrders = createAsyncThunk(
  "orders/search",
  async ({ input, page = 1, size = 10 }, thunkAPI) => {
    const res = await api.searchOrders({ input, page, size });
    console.log(res.data.results[0]);
    return res.data;
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    creating: false,
    createResult: null,
    currentOrder: null,
    searchResults: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCreateResult(state) {
      state.createResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        state.createResult = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error;
      })

      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })

      .addCase(searchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
  },
});

export const { clearCreateResult } = ordersSlice.actions;

export default ordersSlice.reducer;
