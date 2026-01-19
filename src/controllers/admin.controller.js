import mongoose from "mongoose";
import User, { ROLES } from "../models/user.model.js";
import { throwError } from "../utils/errorHandler.js";

export const getUsers = async (req, res, next) => {
  try {
    const { includeDelete } = req.query;

    const filter = {};

    if (includeDelete !== "true") {
      filter.isDeleted = false;
    }

    const users = await User.find(filter);

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      totalUser: totalUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throwError("Invalid user ID", 400);
    }

    const user = await User.findById(id);

    if (!user) {
      throwError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const { userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throwError("Invalid user ID", 400);
    }

    if (!ROLES.includes(role)) {
      throwError("Invalid role value", 400);
    }

    if (userId === id) {
      throwError("You cannot change your own role", 403);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    );

    if (!user) {
      throwError("User not found", 404);
    }

    if (user.isDeleted) throwError("Cannot update role of deleted user", 403);

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
