import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getStoreDetails } from "@/services/store.services";

export const fetchStore = createAsyncThunk(
  "store/fetchStore",

  async (_, thunkAPI) => {
    try {
      return await getStoreDetails();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch store"
      );
    }
  }
);

const initialState = {
  store: null,

  loading: false,

  error: null,
};

const storeSlice = createSlice({
  name: "store",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchStore.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchStore.fulfilled, (state, action) => {
        state.loading = false;

        state.store = action.payload.store;
      })

      .addCase(fetchStore.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      });
  },
});

export default storeSlice.reducer;