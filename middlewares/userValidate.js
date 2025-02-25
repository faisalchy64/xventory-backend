import { check, validationResult } from "express-validator";

export const signinValidation = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter valid email.")
    .trim(),
  check("password").not().isEmpty().withMessage("Password is required.").trim(),
];

export const signupValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters needed.")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name should contain only alphabets.")
    .trim(),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter valid email.")
    .trim(),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required.")
    .isStrongPassword({ minLength: 8, minUppercase: 0 })
    .withMessage(
      "Minimum 8 characters needed (at least one letter, one digit and one special character)."
    )
    .trim(),
];

export const verifyValidation = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter valid email.")
    .trim(),
  check("otp")
    .not()
    .isEmpty()
    .withMessage("Verification code is required.")
    .isNumeric({ no_symbols: true })
    .withMessage("Enter valid verification code.")
    .trim(),
];

export const signinValidationCheck = (req, res, next) => {
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

export const signupValidationCheck = (req, res, next) => {
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

export const verifyValidationCheck = (req, res, next) => {
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
