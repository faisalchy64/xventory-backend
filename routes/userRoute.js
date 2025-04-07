import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import {
  emailValidation,
  signinValidation,
  signupValidation,
  verifyValidation,
  resetPasswordValidation,
  emailValidationCheck,
  signinValidationCheck,
  signupValidationCheck,
  verifyValidationCheck,
  resetPasswordValidationCheck,
} from "../middlewares/userValidate.js";
import {
  signin,
  withGoogle,
  signup,
  verifyCode,
  signout,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  manageUsers,
  deleteUser,
  updateProfile,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/signin", signinValidation, signinValidationCheck, signin);

userRouter.post("/google", withGoogle);

userRouter.post("/signup", signupValidation, signupValidationCheck, signup);

userRouter.post("/verify", verifyValidation, verifyValidationCheck, verifyCode);

userRouter.patch("/signout", emailValidation, emailValidationCheck, signout);

userRouter.patch(
  "/forgot-password",
  emailValidation,
  emailValidationCheck,
  forgotPassword
);

userRouter.patch(
  "/reset-password",
  resetPasswordValidation,
  resetPasswordValidationCheck,
  resetPassword
);

userRouter.get("/refresh-token", refreshAccessToken);

userRouter.get("/manage-users", verifyJWT, manageUsers);

userRouter.delete("/manage-users/:id", verifyJWT, deleteUser);

userRouter.patch("/profile/:id", verifyJWT, updateProfile);

export default userRouter;
