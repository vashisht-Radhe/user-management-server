import User from "../models/user.model.js";
import { throwError } from "../utils/errorHandler.js";
import { safeDelete } from "../utils/file.util.js";
import { getUploadPath } from "../utils/uploadPath.js";
import {
  changePasswordService,
  deactivateAccountService,
  deleteAccountService,
  profileService,
  updateProfileService,
} from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ACTIVITY_TYPES from "../constants/activityTypes.js";
import logActivity from "../utils/logActivity.js";

const isProduction = process.env.NODE_ENV === "production";

export const getMyProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const user = await profileService(userId);

  res.status(200).json({
    message: "Profile retrieved successfully",
    success: true,
    data: user,
  });
});

export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  const { firstName, lastName } = req.body;

  const user = await updateProfileService({ userId, firstName, lastName });

  await logActivity({
    user,
    action: ACTIVITY_TYPES.PROFILE_UPDATED,
    description: "User updated profile",
    req,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  await changePasswordService({
    userId,
    currentPassword,
    newPassword,
  });

  await logActivity({
    user: req.user,
    action: ACTIVITY_TYPES.PASSWORD_CHANGED,
    description: "User changed password",
    req,
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const updateProfilePic = asyncHandler(async (req, res, next) => {
  let uploadedFilePath;

  if (!req.file) {
    throwError("No file uploaded", 400);
  }

  uploadedFilePath = getUploadPath(req.file.filename);

  const user = await User.findById(req.user._id).select("avatar");
  if (!user) {
    throwError("User not found", 404);
  }

  const oldAvatar = user.avatar;
  // user.avatar = req.file.filename;

  user.avatar = `/uploads/${req.file.filename}`;

  await user.save();

  if (oldAvatar) {
    await safeDelete(getUploadPath(oldAvatar));
  }

  await logActivity({
    user: req.user,
    action: ACTIVITY_TYPES.PROFILE_UPDATED,
    description: "User updated profile picture",
    req,
  });

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    avatar: user.avatar,
  });
});

export const deactivateAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const deactivatedAt = await deactivateAccountService(userId);

  await logActivity({
    user: req.user,
    action: ACTIVITY_TYPES.ACCOUNT_DEACTIVATED,
    description: "User deactivated account",
    req,
  });

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    deactivatedAt,
    message: "Account deactivated successfully",
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { password } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await deleteAccountService({ userId, password });

  await logActivity({
    user,
    action: ACTIVITY_TYPES.USER_DELETED,
    description: "User permanently deleted account",
    req,
  });

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Your account has been permanently deleted",
  });
});
