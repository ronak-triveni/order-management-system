export const handleApiError = (error, thunkAPI) => {
  if (error.code === "ERR_NETWORK") {
    return thunkAPI.rejectWithValue({
      error: "Server is down or not reachable",
    });
  }

  if (error.response) {
    return thunkAPI.rejectWithValue({
      error: error.response.data?.error || error.response.statusText,
    });
  }

  return thunkAPI.rejectWithValue({
    error: "Network error",
  });
};
