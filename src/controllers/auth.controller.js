import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRE_IN, JWT_SECRET } from "../config/env.js";
import { throwError } from "../utils/errorHandler.js";

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throwError("All fields are required", 400);
    }

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

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
    });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE_IN,
    });

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token: token,
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throwError("Email and password are required", 400);
    }

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throwError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      user.isActive = true;
      user.deactivatedAt = null;
      user.deactivatedBy = null;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE_IN,
    });
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
};
