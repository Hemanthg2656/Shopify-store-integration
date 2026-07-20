import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getDashboard, getAnalytics } from "@/services/dashboard.services";

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, thunkAPI) => {
    try {
      const data = await getDashboard();

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch dashboard",
      );
    }
  },
);

export const fetchAnalytics = createAsyncThunk(
  "dashboard/fetchAnalytics",

  async (_, thunkAPI) => {
    try {
      return await getAnalytics();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch analytics",
      );
    }
  },
);

const initialState = {
  summary: null,
  recentOrders: [],
  topProducts: [],

  analytics: null,

  loadingDashboard: false,
  loadingAnalytics: false,

  error: null,
  firstSyncRequired: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchDashboard.pending, (state) => {
        state.loadingDashboard = true;
      })

      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loadingDashboard = false;

        state.summary = action.payload.summary;

        state.recentOrders = action.payload.recentOrders;

        state.topProducts = action.payload.topProducts;
        state.firstSyncRequired = action.payload.firstSyncRequired;
      })

      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loadingDashboard = false;

        state.error = action.payload;
      })

      .addCase(fetchAnalytics.pending, (state) => {
        state.loadingAnalytics = true;
      })

      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loadingAnalytics = false;

        state.analytics = action.payload.analytics;
      })

      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loadingAnalytics = false;

        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
