import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getOrders } from "@/services/order.services";
import { syncOrders } from "@/services/sync.services";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",

  async (params, thunkAPI) => {
    try {
      const response = await getOrders(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

export const syncOrdersData = createAsyncThunk(
  "orders/syncOrders",
  async (_, thunkAPI) => {
    try {
      const response = await syncOrders();
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to sync orders",
      );
    }
  },
);

const initialState = {
  orders: [],
  pageInfo: null,
  initialized: false,
  loading: false,
  error: null,

  search: "",

  financialStatus: "",

  fulfillmentStatus: "",

  dateFrom: "",

  dateTo: "",

  sort: "newest",
  syncing: false,
  page: 1,
};

const orderSlice = createSlice({
  name: "orders",

  initialState,

  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.page=1;
    },

    setFinancialStatus(state, action) {
      state.financialStatus = action.payload;
      state.page=1;
    },

    setFulfillmentStatus(state, action) {
      state.fulfillmentStatus = action.payload;
      state.page=1;
    },

    setDateFrom(state, action) {
      state.dateFrom = action.payload;
      state.page=1;
    },

    setDateTo(state, action) {
      state.dateTo = action.payload;
      state.page=1;
    },

    setSort(state, action) {
      state.sort = action.payload;
      state.page=1;
    },

    clearOrders(state) {
      state.orders = [];
      state.pageInfo = null;
      state.error = null;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.orders = action.payload.orders;

        state.pageInfo = action.payload.pageInfo;
      })

      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload;
      })
      .addCase(syncOrdersData.pending, (state) => {
        state.syncing = true;
      })

      .addCase(syncOrdersData.fulfilled, (state) => {
        state.syncing = false;
      })

      .addCase(syncOrdersData.rejected, (state) => {
        state.syncing = false;
      });
  },
});

export const {
  setSearch,
  setFinancialStatus,
  setFulfillmentStatus,
  setDateFrom,
  setDateTo,
  setSort,
  clearOrders,
} = orderSlice.actions;

export default orderSlice.reducer;
