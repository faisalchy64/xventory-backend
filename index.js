import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./db.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { webhook } from "./controllers/orderController.js";

const app = express();
const port = process.env.PORT || 8000;

// Stripe webhook endpoint
app.post("/api/webhook", express.raw({ type: "application/json" }), webhook);

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Database connection
dbConnect();

// Routes
app.get("/", (req, res) => {
  res.send({ message: "Xventory backend" });
});

app.use("/api", userRouter);

app.use("/api", productRouter);

app.use("/api", orderRouter);

// Not found route
app.use((req, res, next) => {
  next({ status: 404, message: "Resource not found." });
});

// Error boundary
app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
