import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { generateOtp } from "../utils/generateOtp.js";
import { throwError } from "../utils/errorHandler.js";
import crypto from "crypto";
import { sendForgetPassword } from "./email.service.js";

export const registerService = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.isDeleted) {
      throwError(
        "This account was permanently deleted and cannot be registered again",
        403,
      );
    }

    if (!existingUser.isActive) {
      throwError(
        "This account is deactivated. Please log in to reactivate it",
        403,
      );
    }

    throwError("User already exists", 409);
  }

  const { otp, hashedOtp, expiresAt } = generateOtp();

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    emailOtp: hashedOtp,
    emailOtpExpires: expiresAt,
    otpAttempts: 0,
    otpLastSent: Date.now(),
  });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRE_IN,
    },
  );


  // user.password = undefined;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.emailOtp;

  return {
    user: userObject,
    token,
    otp,
  };
};

export const loginService = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    throwError("Invalid email or password", 401);
  }

  if (user.isDeleted) {
    throwError(
      "This account has been permanently deleted and cannot be recovered",
      403,
    );
  }

  if (!user.isActive) {
    if (user.deactivatedReason === "admin") {
      throwError(
        "Your account has been deactivated by admin. Please contact support.",
        403,
      );
    }
  }

  if (user.deactivatedReason === "self") {
    user.isActive = true;
    user.deactivatedAt = null;
    user.deactivatedBy = null;
    user.deactivatedReason = null;
    await user.save();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throwError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRE_IN,
    },
  );


  user.password = undefined;

  return { user, token };
};

export const forgetPasswordService = async (email) => {
  const normalizedEmail = email?.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetLink = `http://localhost:${env.FRONTEND_URL}/reset-password?token=${token}`;

  console.log("Password Reset Link:", resetLink);

  const expiresText = "15 minutes";

  await sendForgetPassword({
    email: user.email,
    name: user.name,
    resetLink,
    expiresText,
  });

  return;
};

export const resetPasswordService = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throwError("Invalid or expired token", 400);
  }

  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  return;
};
