import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import {
  orderValidation,
  orderUpdateValidation,
  orderValidationCheck,
  orderUpdateValidationCheck,
} from "../middlewares/orderValidate.js";
import {
  getOrders,
  getPurchaseHistory,
  createOrder,
  updateOrder,
  getCheckoutSession,
  createCheckoutSession,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.get("/orders", verifyJWT, getOrders);

orderRouter.get("/purchase-history", verifyJWT, getPurchaseHistory);

orderRouter.post(
  "/orders",
  verifyJWT,
  orderValidation,
  orderValidationCheck,
  createOrder
);

orderRouter.patch(
  "/orders/:id",
  verifyJWT,
  orderUpdateValidation,
  orderUpdateValidationCheck,
  updateOrder
);

orderRouter.post("/create-checkout-session", verifyJWT, createCheckoutSession);

orderRouter.get("/checkout-session", verifyJWT, getCheckoutSession);

export default orderRouter;
