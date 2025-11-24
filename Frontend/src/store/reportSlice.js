import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchReport = createAsyncThunk("orders/getReport", async () => {
  const res = await axios.get("/orders/report");
  return res.data;
});

const reportSlice = createSlice({
  name: "report",
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = "Failed to load report";
      });
  },
});

export default reportSlice.reducer;
