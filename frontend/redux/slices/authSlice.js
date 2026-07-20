import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMe, logout as logoutApi } from "@/services/auth.services";

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, thunkAPI) => {
  try {
    return await getMe();
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Authentication failed",
    );
  }
});

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await logoutApi();
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Logout failed",
      );
    }
  },
);

const initialState = {
  isInitialized: false,
  isAuthenticated: false,

  loading: false,

  user: null,

  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },

    setInitialized(state) {
      state.isInitialized = true;
    },

    setError(state, action) {
      state.error = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })

      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLoading, setInitialized, setError } = authSlice.actions;

export default authSlice.reducer;
