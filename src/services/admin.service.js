import Activity from "../models/activity.model.js";
import User, { ROLES } from "../models/user.model.js";
import { throwError } from "../utils/errorHandler.js";

export const getUsersService = async (includeDelete) => {
  const filter = {};

  if (includeDelete !== "true") filter.isDeleted = false;

  const [users, totalUsers] = await Promise.all([
    User.find(filter),
    User.countDocuments(filter),
  ]);

  return { users, totalUsers };
};

export const getUserByIdService = async (id) => {
  const user = await User.findById(id);

  if (!user) throwError("User not found", 404);

  return user;
};

export const getActionActivityService = async () => {
  const [activities, total] = await Promise.all([
    Activity.find().sort({ createdAt: -1 }).limit(100),

    Activity.countDocuments(),
  ]);

  return {
    total,
    activities,
  };
};

export const updateUserRoleService = async ({ id, role, adminId }) => {
  if (!ROLES.includes(role)) {
    throwError("Invalid role value", 400);
  }

  if (adminId.equals(id)) {
    throwError("You cannot change your own role", 403);
  }

  const user = await User.findById(id);
  if (!user) throwError("User not found", 404);
  if (user.isDeleted) throwError("Cannot update deleted user", 403);

  if (user.role === "admin" && role !== "admin") {
    const adminCount = await User.countDocuments({
      role: "admin",
      isDeleted: false,
    });

    if (adminCount === 1) {
      throwError("Cannot downgrade the last admin", 403);
    }
  }

  user.role = role;
  await user.save();

  return user;
};

export const deactivateUserService = async ({ id, adminId }) => {
  if (adminId.equals(id)) {
    throwError("You cannot deactivate your own account", 403);
  }

  const user = await User.findById(id);
  if (!user) throwError("User not found", 404);
  if (user.isDeleted) throwError("User account is deleted", 410);
  if (!user.isActive) throwError("Account already deactivated", 409);

  user.isActive = false;
  user.deactivatedAt = new Date();
  user.deactivatedBy = adminId;
  user.deactivatedReason = "admin";

  await user.save();
  return user;
};

export const reactivateUserService = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throwError("User not found", 404);
  }

  if (user.isDeleted) {
    throwError("User account is deleted", 410);
  }

  if (user.isActive) {
    throwError("Account already active", 409);
  }

  user.isActive = true;
  user.deactivatedAt = null;
  user.deactivatedBy = null;
  user.deactivatedReason = null;

  await user.save();

  return user;
};

export const deleteUserService = async ({ id, adminId }) => {
  if (adminId.equals(id)) {
    throwError("You cannot delete your own account", 403);
  }

  const user = await User.findById(id);

  if (!user) {
    throwError("User not found", 404);
  }

  if (user.isDeleted) {
    throwError("User account already deleted", 410);
  }

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({
      role: "admin",
      isDeleted: false,
    });

    if (adminCount === 1) {
      throwError("Cannot delete the last admin", 403);
    }
  }

  user.isDeleted = true;
  user.isActive = false;
  user.deletedAt = new Date();

  user.deletedBy = adminId;

  user.deactivatedAt = null;
  user.deactivatedBy = null;

  await user.save();

  return user;
};
