import { unlinkSync } from "fs";
import { check, validationResult } from "express-validator";

export const productValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters needed.")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name should contain only alphabets.")
    .trim(),
  check("image").custom((value, { req }) => {
    if (req.file && req.file.mimetype.includes("image") === false) {
      unlinkSync(req.file.path);
      throw new Error("Only image files are allowed.");
    }

    if (req.file === undefined) {
      throw new Error("Image is required.");
    }

    return true;
  }),
  check("description")
    .not()
    .isEmpty()
    .withMessage("Description is required.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters needed.")
    .matches(/^(?!\s)([a-zA-Z0-9.,'"\-:;()&%$#!? ]{10,500})$/)
    .withMessage("Enter valid description.")
    .trim(),
  check("price")
    .not()
    .isEmpty()
    .withMessage("Price is required.")
    .isFloat()
    .withMessage("Price should contain only numbers.")
    .trim(),
  check("quantity")
    .not()
    .isEmpty()
    .withMessage("Quantity is required.")
    .isNumeric({ no_symbols: true })
    .withMessage("Quantity should contain only numbers.")
    .trim(),
  check("unit")
    .isIn(["kg", "dz", "pc"])
    .withMessage("Only kg, dz and pc units are allowed.")
    .trim(),
  check("seller").not().isEmpty().withMessage("Id is required.").trim(),
];

export const productUpdateValidation = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters needed.")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name should contain only alphabets.")
    .trim(),
  check("image")
    .optional()
    .custom(async (value, { req }) => {
      if (req.file && req.file.mimetype.includes("image") === false) {
        unlinkSync(req.file.path);
        throw new Error("Only image files are allowed.");
      }
    }),
  check("description")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters needed.")
    .isAlpha("en-US", { ignore: " -." })
    .withMessage("Description should contain only alphabets.")
    .trim(),
  check("price")
    .optional()
    .isFloat()
    .withMessage("Price should contain only numbers.")
    .trim(),
  check("quantity")
    .optional()
    .isNumeric({ no_symbols: true })
    .withMessage("Quantity should contain only numbers.")
    .trim(),
  check("unit")
    .optional()
    .isIn(["kg", "dz", "pc"])
    .withMessage("Only kg, dz and pc units are allowed.")
    .trim(),
];

export const productValidationCheck = (req, res, next) => {
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

export const productUpdateValidationCheck = (req, res, next) => {
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
