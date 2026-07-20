import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getCustomers } from "@/services/customer.services";
import { syncCustomers } from "@/services/sync.services";

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",

  async (params, thunkAPI) => {
    try {
      const response = await getCustomers(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch customers",
      );
    }
  },
);

export const syncCustomersData = createAsyncThunk(
  "customers/syncCustomers",
  async (_, thunkAPI) => {
    try {
      const response = await syncCustomers();
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to sync customers",
      );
    }
  },
);

const initialState = {
  customers: [],
  pageInfo: null,

  loading: false,
  initialized: false,
  error: null,
  syncing: false,
  search: "",

  sort: "newest",
  page: 1,
};

const customerSlice = createSlice({
  name: "customers",

  initialState,

  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1;
    },

    setSort(state, action) {
      state.sort = action.payload;
      state.page = 1;
    },

    clearCustomers(state) {
      state.customers = [];
      state.pageInfo = null;
      state.error = null;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.customers = action.payload.customers;
        state.pageInfo = action.payload.pageInfo;
      })

      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload;
      })
      .addCase(syncCustomersData.pending, (state) => {
        state.syncing = true;
      })

      .addCase(syncCustomersData.fulfilled, (state) => {
        state.syncing = false;
      })

      .addCase(syncCustomersData.rejected, (state) => {
        state.syncing = false;
      });
  },
});

export const { setSearch, setSort, clearCustomers,setPage } = customerSlice.actions;

export default customerSlice.reducer;
