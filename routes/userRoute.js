import express from "express";
import {
  signinValidation,
  signupValidation,
  verifyValidation,
  signinValidationCheck,
  signupValidationCheck,
  verifyValidationCheck,
} from "../middlewares/userValidate.js";
import { signin, signup, verifyCode } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/signin", signinValidation, signinValidationCheck, signin);

userRouter.post("/signup", signupValidation, signupValidationCheck, signup);

userRouter.post("/verify", verifyValidation, verifyValidationCheck, verifyCode);

export default userRouter;
