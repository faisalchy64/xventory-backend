import { check, validationResult } from "express-validator";

export const orderValidation = [
  check("products")
    .not()
    .isEmpty()
    .withMessage("Products are required.")
    .isArray({ min: 1 })
    .withMessage("Minimum one product is required."),
  check("products.*.product")
    .not()
    .isEmpty()
    .withMessage("Id is required.")
    .isMongoId()
    .withMessage("Enter valid id.")
    .trim(),
  check("products.*.price")
    .not()
    .isEmpty()
    .withMessage("Price is required.")
    .isFloat()
    .withMessage("Price should contain only numbers."),
  check("products.*.orderQty")
    .not()
    .isEmpty()
    .withMessage("Quantity is required.")
    .isNumeric({ no_symbols: true })
    .withMessage("Quantity should contain only numbers.")
    .trim(),
  check("products.*.unit")
    .not()
    .isEmpty()
    .withMessage("Unit is required.")
    .isIn(["kg", "dz", "pc"])
    .withMessage("Only kg, dz and pc units are allowed.")
    .trim(),
  check("products.*.seller")
    .not()
    .isEmpty()
    .withMessage("Id is required.")
    .isMongoId()
    .withMessage("Enter valid id.")
    .trim(),
  check("amount")
    .not()
    .isEmpty()
    .withMessage("Amount is required.")
    .isFloat()
    .withMessage("Amount should contain only numbers."),
  check("customer")
    .not()
    .isEmpty()
    .withMessage("Id is required.")
    .isMongoId()
    .withMessage("Enter valid id.")
    .trim(),
  check("phone_number")
    .not()
    .isEmpty()
    .withMessage("Number is required.")
    .isMobilePhone("any")
    .withMessage("Enter valid number.")
    .trim(),
  check("address")
    .not()
    .isEmpty()
    .withMessage("Address is required.")
    .isLength({ min: 5 })
    .withMessage("Minimum 5 characters needed.")
    .matches(/^(?!\s)([a-zA-Z0-9.,'"\-:;()&%$#!? ]{10,500})$/)
    .withMessage("Enter valid address.")
    .trim(),
];

export const orderUpdateValidation = [
  check("order_status")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Status is required.")
    .isIn(["delivered", "cancelled"])
    .withMessage("Only delivered and cancelled methods are allowed.")
    .trim(),
  check("payment_status")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Status is required.")
    .isIn(["paid", "failed"])
    .withMessage("Only paid and failed methods are allowed.")
    .trim(),
];

export const orderValidationCheck = (req, res, next) => {
  const errors = validationResult(req).mapped();

  if (Object.keys(errors).length === 0) {
    next();
  } else {
    const result = {};
    Object.keys(errors).forEach((error) => {
      result[error] = errors[error].msg;
    });

    res.status(400).send(result);
  }
};

export const orderUpdateValidationCheck = (req, res, next) => {
  const errors = validationResult(req).mapped();

  if (Object.keys(errors).length === 0) {
    next();
  } else {
    const result = {};
    Object.keys(errors).forEach((error) => {
      result[error] = errors[error].msg;
    });

    res.status(400).send(result);
  }
};
