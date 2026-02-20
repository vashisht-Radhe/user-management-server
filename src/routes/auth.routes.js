import express from "express";
import {
  forgetPassword,
  login,
  logout,
  register,
  resendOtp,
  resetPassword,
  verifyEmailOtp,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validations/auth/auth.validation.js";
import { authLimiter } from "../config/rateLimiter.js";

const authRoutes = express.Router();
authRoutes.use(authLimiter);

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post(
  "/verify-otp",
  protect,
  validate(verifyOtpSchema),
  verifyEmailOtp,
);
authRoutes.post("/resend-otp", protect, resendOtp);
authRoutes.post("/logout", protect, logout);
authRoutes.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgetPassword,
);
authRoutes.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword,
);
export default authRoutes;
