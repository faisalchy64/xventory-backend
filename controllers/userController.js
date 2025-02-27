import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import generateOTP from "../utils/generateOTP.js";
import { sendVerifyEmail } from "../utils/sendEmail.js";
import { generateTokens } from "../utils/token.js";

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user === null) {
      return next({ status: 404, message: "User not found." });
    }

    const compare = await bcrypt.compare(password, user.password);

    if (compare) {
      const { _id, name, email, isVerified } = user;
      const { accessToken, refreshToken } = generateTokens({
        _id,
        name,
        email,
        isVerified,
      });

      user.refreshToken = refreshToken;
      await user.save();

      return res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        })
        .send({
          status: 200,
          data: { _id, name, email, isVerified, accessToken },
        });
    }

    next({ status: 401, message: "Incorrect email or password." });
  } catch (error) {
    next({ message: "User signin failed." });
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
      return res.send({
        status: 200,
        message: "User verification successful.",
      });
    }

    return next({ status: 400, message: "Invalid verification code." });
  } catch (error) {
    next({ message: "User verification failed." });
  }
};
