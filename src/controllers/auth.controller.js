import User from "../models/user.model.js";
import { throwError } from "../utils/errorHandler.js";
import {
  forgetPasswordService,
  loginService,
  registerService,
  resetPasswordService,
} from "../services/auth.service.js";
import {
  sendForgetPassword,
  sendOtp,
  sendWelcome,
} from "../services/email.service.js";
import {
  resendEmailOtpService,
  verifyEmailOtpService,
} from "../services/otp.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";
import ACTIVITY_TYPES from "../constants/activityTypes.js";
import crypto from "crypto";

export const register = asyncHandler(async (req, res, next) => {
  const { user, token, otp } = await registerService(req.body);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await logActivity({
    user,
    action: ACTIVITY_TYPES.USER_REGISTERED,
    description: "User registered successfully",
    req,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });

  const expiresText = "in 10 minutes";

  sendOtp({
    name: user.firstName,
    email: user.email,
    otp,
    expiresText,
  }).catch(console.error);

  sendWelcome({
    name: user.firstName,
    email: user.email,
  }).catch(console.error);
});

export const verifyEmailOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  const { _id: userId } = req.user;

  const user = await User.findById(userId).select("+emailOtp");

  if (!user) throwError("User not found", 404);

  await verifyEmailOtpService(user, otp);

  await logActivity({
    user,
    action: ACTIVITY_TYPES.EMAIL_VERIFIED,
    description: "User verified email",
    req,
  });

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

export const resendOtp = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;

  const user = await User.findById(userId);

  if (!user) throwError("User not found", 404);

  const { otp } = await resendEmailOtpService(user);

  const expiresText = "in 10 minutes";

  sendOtp({
    name: user.firstName,
    email: user.email,
    otp,
    expiresText,
  }).catch(console.error);

  await logActivity({
    user,
    action: ACTIVITY_TYPES.OTP_SENT,
    description: "OTP resent to user",
    req,
  });

  res.status(200).json({
    success: true,
    message: "OTP resent successfully",
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { user, token } = await loginService(req.body);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  console.log(token);

  await logActivity({
    user,
    action: ACTIVITY_TYPES.USER_LOGIN,
    description: "User logged in",
    req,
  });

  res.status(200).json({
    success: true,
    message: "User signed in successfully",
    data: user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const user = req.user;

  await logActivity({
    user,
    action: ACTIVITY_TYPES.USER_LOGOUT,
    description: "User logged out",
    req,
  });

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  await forgetPasswordService(email);

  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    await logActivity({
      user,
      action: ACTIVITY_TYPES.PASSWORD_RESET_REQUESTED,
      description: "User requested password reset",
      req,
    });
  }

  return res.status(200).json({
    message: "If the email exists, a reset link has been sent (check console)",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throwError("Invalid or expired token", 400);
  }

  await resetPasswordService(token, newPassword);

  await logActivity({
    user,
    action: ACTIVITY_TYPES.PASSWORD_RESET_COMPLETED,
    description: "User reset password successfully",
    req,
  });

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
