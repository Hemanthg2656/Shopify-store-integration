import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getSyncStatus } from "@/services/sync.services";

export const fetchSyncStatus = createAsyncThunk(
  "sync/fetchSyncStatus",
  async (_, thunkAPI) => {
    try {
      return await getSyncStatus();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch sync status"
      );
    }
  }
);

const initialState = {
  syncStatus: null,
  loading: false,
  error: null,
};

const syncSlice = createSlice({
  name: "sync",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchSyncStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSyncStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.syncStatus = action.payload.syncStatus;
      })

      .addCase(fetchSyncStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default syncSlice.reducer;