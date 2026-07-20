import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";
import customerReducer from "./slices/customerSlice";
import dashboardReducer from "./slices/dashboardSlice";
import storeReducer from "./slices/storeSlice";
import syncReducer from "./slices/syncSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
    customers: customerReducer,
    dashboard: dashboardReducer,
    store:storeReducer,
    sync:syncReducer
  },
});
