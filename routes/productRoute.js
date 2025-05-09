import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import upload from "../middlewares/upload.js";
import {
  productValidation,
  productUpdateValidation,
  productValidationCheck,
  productUpdateValidationCheck,
} from "../middlewares/productValidate.js";
import {
  getProducts,
  getProduct,
  manageProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/products", getProducts);

productRouter.get("/products/:id", getProduct);

productRouter.get("/manage-products", verifyJWT, manageProducts);

productRouter.post(
  "/products",
  verifyJWT,
  upload.single("image"),
  productValidation,
  productValidationCheck,
  createProduct
);

productRouter.patch(
  "/products/:id",
  verifyJWT,
  upload.single("image"),
  productUpdateValidation,
  productUpdateValidationCheck,
  updateProduct
);

productRouter.delete("/products/:id", verifyJWT, deleteProduct);

export default productRouter;
