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

export const register = asyncHandler(async (req, res, next) => {
  const { user, token, otp } = await registerService(req.body);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
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

  res.status(200).json({
    success: true,
    message: "User signed in successfully",
    data: user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
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
  await forgetPasswordService(email);

  return res.status(200).json({
    message: "If the email exists, a reset link has been sent (check console)",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  await resetPasswordService(token, newPassword);

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
