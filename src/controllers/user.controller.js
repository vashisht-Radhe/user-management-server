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

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    avatar: user.avatar,
  });
});

export const deactivateAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const deactivatedAt = await deactivateAccountService(userId);

  res.status(200).json({
    success: true,
    deactivatedAt,
    message: "Account deactivated successfully",
  });
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  const { password } = req.body;

  await deleteAccountService({ userId, password });

  res.status(200).json({
    success: true,
    message: "Your account has been permanently deleted",
  });
});
