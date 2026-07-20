import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getProducts, getProductsTypes } from "@/services/product.services";
import { syncProducts } from "@/services/sync.services";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params, thunkAPI) => {
    try {
      return await getProducts(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

export const syncProductsData = createAsyncThunk(
  "products/syncProducts",
  async (_, thunkAPI) => {
    try {
      const response = await syncProducts();

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to sync products",
      );
    }
  },
);

export const fetchProductTypes = createAsyncThunk(
  "products/fetchProductTypes",
  async (_, thunkAPI) => {
    try {
      return await getProductsTypes();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch product types",
      );
    }
  },
);

const initialState = {
  products: [],
  productTypes: [],

  pageInfo: null,

  loading: false,
  loadingProductTypes: false,

  initialized: false,

  error: null,
  productTypesError: null,
  syncing: false,

  search: "",
  sort: "newest",
  status: "",
  productType: "",

  page: 1,
};

const productSlice = createSlice({
  name: "products",

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

    setStatus(state, action) {
      state.status = action.payload;
      state.page = 1;
    },

    setProductType(state, action) {
      state.productType = action.payload;
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;

        state.products = action.payload.products;
        state.pageInfo = action.payload.pageInfo;
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload;
      })

      .addCase(fetchProductTypes.pending, (state) => {
        state.loadingProductTypes = true;
        state.productTypesError = null;
      })

      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.loadingProductTypes = false;
        state.productTypes = action.payload.productTypes;
      })

      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.loadingProductTypes = false;
        state.productTypesError = action.payload;
      })
      .addCase(syncProductsData.pending, (state) => {
        state.syncing = true;
      })

      .addCase(syncProductsData.fulfilled, (state) => {
        state.syncing = false;
      })

      .addCase(syncProductsData.rejected, (state) => {
        state.syncing = false;
      });
  },
});

export const { setSearch, setSort, setStatus, setProductType, setPage } =
  productSlice.actions;

export default productSlice.reducer;
