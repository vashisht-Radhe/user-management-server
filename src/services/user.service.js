import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { throwError } from "../utils/errorHandler.js";

export const profileService = async (userId) => {
  const user = await User.findById(userId).select(
    "firstName lastName email avatar role createdAt",
  );

  if (!user) {
    throwError("User not found", 404);
  }

  return user;
};

export const updateProfileService = async ({ userId, firstName, lastName }) => {
  const user = await User.findById(userId);

  if (!user) {
    throwError("User not found", 404);
  }

  if (!firstName && !lastName) {
    throwError("Nothing to update", 400);
  }

  user.firstName = firstName ?? user.firstName;
  user.lastName = lastName ?? user.lastName;

  await user.save();

  return user;
};

export const changePasswordService = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throwError("User not found", 404);
  }

  const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordMatch) {
    throwError("Current password is incorrect", 403);
  }

  if (currentPassword === newPassword) {
    throwError("New password must be different", 400);
  }

  user.password = newPassword;

  await user.save();
};

export const deactivateAccountService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throwError("Unauthorized", 401);
  }

  if (user.isDeleted) {
    throwError("Account is deleted", 403);
  }

  if (!user.isActive) {
    throwError("Account already deactivated", 403);
  }

  user.isActive = false;
  user.deactivatedAt = new Date();
  user.deactivatedBy = userId;
  user.deactivatedReason = "self";

  await user.save();

  return user.deactivatedAt;
};

export const deleteAccountService = async ({ userId, password }) => {
  if (!password) {
    throwError("Password is required to delete account", 400);
  }

  const user = await User.findById(userId).select("+password");

  if (!user || user.isDeleted) {
    throwError("Account not accessible", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throwError("Incorrect Password", 401);
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.isActive = false;

  user.deletedBy = userId;

  user.deactivatedAt = null;
  user.deactivatedBy = null;

  await user.save();
};
