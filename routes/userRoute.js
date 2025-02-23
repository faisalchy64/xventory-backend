import express from "express";
import {
  signinValidation,
  signupValidation,
  signinValidationCheck,
  signupValidationCheck,
} from "../middlewares/userValidate.js";
import { signin, signup } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/signin", signinValidation, signinValidationCheck, signin);

userRouter.post("/signup", signupValidation, signupValidationCheck, signup);

export default userRouter;
