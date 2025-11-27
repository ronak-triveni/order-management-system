import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/apiClient";
import { handleApiError } from "../utils/handleApiError";

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (payload, thunkAPI) => {
    try {
      const res = await api.createOrder(payload);
      return res.data;
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await api.getOrderById(id);
      console.log(res.data);
      return res.data;
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

export const searchOrders = createAsyncThunk(
  "orders/search",
  async ({ input, page = 1, size = 10 }, thunkAPI) => {
    try {
      const res = await api.searchOrders({ input, page, size });
      console.log(res.data.results[0]);
      return res.data;
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

export const fetchOrdersGrid = createAsyncThunk(
  "orders/fetchGrid",
  async (params, thunkAPI) => {
    try {
      const res = await api.fetchOrdersForGrid(params);
      console.log("grid response:", res.data);
      return res.data;
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

export const fetchReport = createAsyncThunk(
  "orders/getReport",
  async (params, thunkAPI) => {
    try {
      const res = await api.fetchOrderReport(params);
      return res.data;
    } catch (error) {
      console.log(error);
      return handleApiError(error, thunkAPI);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    creating: false,
    createResult: null,
    currentOrder: null,
    searchResults: null,
    gridData: null,
    gridError: null,
    loading: false,
    error: null,
    reportData: null,
  },
  reducers: {
    clearCreateResult(state) {
      state.createResult = null;
    },
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
    clearSearchResults(state) {
      state.searchResults = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearReportResults(state) {
      state.reportData = null;
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
        state.error = action.payload?.error || "Unexpected server error";
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
        state.error = action.payload?.error || "Unexpected server error";
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
        state.error = action.payload?.error || "Unexpected server error";
      })

      .addCase(fetchOrdersGrid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersGrid.fulfilled, (state, action) => {
        state.loading = false;
        state.gridData = action.payload;
      })
      .addCase(fetchOrdersGrid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Unexpected server error";
      })

      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Unexpected server error";
      });
  },
});

export const {
  clearCreateResult,
  clearCurrentOrder,
  clearSearchResults,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
