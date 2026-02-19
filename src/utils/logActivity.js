import Activity from "../models/activity.model.js";

const logActivity = async ({ user, action, description, targetUser, req }) => {
  try {
    await Activity.create({
      user: user?._id,
      userSnapshot: {
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },

      action,
      description,

      targetUser: targetUser?._id,
      targetUserSnapshot: targetUser
        ? {
            name: targetUser.name,
            email: targetUser.email,
          }
        : undefined,

      ipAddress: req?.ip,
      userAgent: req?.headers["user-agent"],
    });
  } catch (error) {
    console.error("Activity log failed:", error.message);
  }
};

export default logActivity;
