import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import helmetMiddleware from "./config/helmet.js";
import { apiLimiter } from "./config/rateLimiter.js";

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import customerRouter from "./routes/customer.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import storeRouter from "./routes/store.routes.js";
import syncRouter from "./routes/sync.routes.js";

const app = express();

app.use(helmetMiddleware);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(apiLimiter);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/store", storeRouter);
app.use("/api/v1/sync",syncRouter);

app.get("/", (req, res) => {
  res.send("API running");
});

export default app;