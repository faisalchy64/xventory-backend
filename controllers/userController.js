import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import generateOTP from "../utils/generateOTP.js";
import { sendVerifyEmail } from "../utils/sendEmail.js";

export const signin = async (req, res, next) => {
  try {
    console.log(req.body);
  } catch (error) {
    console.log(error);
  }
};

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
      const otpExpiry = Date.now() + 300000;
      const user = await User.create({ ...req.body, password, otp, otpExpiry });

      if (user) {
        await sendVerifyEmail(email, otp);
        res
          .status(201)
          .send({ status: 201, message: "Verification email sent." });
      }
    }
  } catch (error) {
    console.log(error.message);
    next({ message: "User signup failed." });
  }
};
