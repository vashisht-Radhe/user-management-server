import User from "../models/user.model.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
