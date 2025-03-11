import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import generateOTP from "../utils/generateOTP.js";
import { sendVerifyEmail, sendResetPasswordEmail } from "../utils/sendEmail.js";
import { generateTokens, verifyToken } from "../utils/token.js";
import admin from "../firebase.js";

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

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

      return res.cookie("refreshToken", refreshToken, options).send({
        status: 200,
        data: { _id, name, email, isVerified, accessToken },
      });
    }

    next({ status: 401, message: "Incorrect email or password." });
  } catch (error) {
    next({ message: "User signin failed." });
  }
};

export const withGoogle = async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = await admin.auth().verifyIdToken(token);

    const { name, email, email_verified } = decoded;
    const payload = {};

    const is_user = await User.findOne({ email });

    if (is_user === null) {
      payload.name = name;
      payload.email = email;
      payload.password = randomBytes(32).toString("hex");
      payload.isVerified = email_verified;
    }

    const user = await User.findOneAndUpdate(
      { email },
      { ...payload },
      { new: true, upsert: true }
    );

    if (user) {
      const { _id, name, email, isVerified } = user;
      const { accessToken, refreshToken } = generateTokens({
        _id,
        name,
        email,
        isVerified,
      });

      user.refreshToken = refreshToken;
      await user.save();

      return res.cookie("refreshToken", refreshToken, options).send({
        status: 200,
        data: { _id, name, email, isVerified, accessToken },
      });
    }

    next({ status: 400, message: "Token verification failed." });
  } catch (error) {
    console.log(error.message);
    next({ message: "User signin with google failed." });
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

        return res
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

    next({ status: 400, message: "Invalid verification code." });
  } catch (error) {
    next({ message: "User verification failed." });
  }
};

export const signout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user && user.refreshToken === refreshToken) {
      user.refreshToken = "";
      await user.save();

      return res
        .clearCookie("refreshToken", options)
        .send({ status: 200, message: "Signout successful." });
    }

    res
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .status(401)
      .send({ status: 401, message: "Unauthorized user access." });
  } catch (err) {
    next({ message: "User signout failed." });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user === null) {
      return next({ status: 404, message: "User not found." });
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 900000;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    await sendResetPasswordEmail(email, otp);

    res.send({ status: 200, message: "Reset password email sent." });
  } catch (err) {
    next({ message: "Reset password request failed." });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user === null) {
      return next({ status: 404, message: "User not found." });
    }

    if (user.otp === req.body.otp && user.otpExpiry < Date.now()) {
      return next({ status: 400, message: "Verification code expired." });
    }

    if (user.otp === req.body.otp && user.otpExpiry > Date.now()) {
      const password = await bcrypt.hash(req.body.password, 10);
      user.password = password;
      user.otp = "";
      user.otpExpiry = 0;
      await user.save();

      return res.send({
        status: 200,
        message: "Password reset successful.",
      });
    }

    next({ status: 400, message: "Invalid verification code." });
  } catch (error) {
    next({ message: "Password reset request failed." });
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken === undefined) {
      return next({ status: 401, message: "Unauthorized user access." });
    }

    const user = await User.findOne({ refreshToken }).select(
      "name email isVerified refreshToken"
    );

    if (user && user.refreshToken === refreshToken) {
      const decoded = verifyToken(refreshToken);

      if (decoded === null) {
        return res.clearCookie("refreshToken", options).status(401).send({
          status: 401,
          message: "Session expired, sign in again.",
        });
      }

      if (decoded) {
        const { _id, name, email, isVerified } = user;
        const { accessToken, refreshToken } = generateTokens({
          _id,
          name,
          email,
          isVerified,
        });

        user.refreshToken = refreshToken;
        await user.save();

        return res.cookie("refreshToken", refreshToken, options).send({
          status: 200,
          data: { _id, name, email, isVerified, accessToken },
        });
      }
    }
  } catch (err) {
    next({ message: "Refresh token request failed." });
  }
};
