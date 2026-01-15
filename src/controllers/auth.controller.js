import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRE_IN, JWT_SECRET } from "../config/env.js";

const SALT = 10;

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
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

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      const error = new Error("User does not exist");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordVaild = await bcrypt.compare(password, user.password);
    if (!isPasswordVaild) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
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

