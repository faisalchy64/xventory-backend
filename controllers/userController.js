import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import generateOTP from "../utils/generateOTP.js";
import { sendVerifyEmail } from "../utils/sendEmail.js";

export const signin = async (req, res, next) => {};

export const signup = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return next({ status: 409, message: "User already exists." });
    }

    const password = await bcrypt.hash(req.body.password, 10);

    if (password) {
      const otp = generateOTP();
      const otpExpiry = Date.now() + 900000;
      const user = await User.create({ ...req.body, password, otp, otpExpiry });

      if (user) {
        await sendVerifyEmail(email, otp);
        res
          .status(201)
          .send({ status: 201, message: "Account verification email sent." });
      }
    }
  } catch (error) {
    next({ message: "User signup failed." });
  }
};

export const verifyCode = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (user === null) {
      return next({ status: 404, message: "User not found." });
    }

    if (user.otp === otp && user.otpExpiry < Date.now()) {
      return next({ status: 400, message: "Verification code expired." });
    }

    if (user.otp === req.body.otp && user.isVerified === false) {
      user.isVerified = true;
      user.otp = "";
      user.otpExpiry = 0;
      await user.save();
      return res
        .status(200)
        .send({ status: 200, message: "User verification successful." });
    }

    return next({ status: 400, message: "Invalid verification code." });
  } catch (error) {
    next({ message: "User verification failed." });
  }
};
