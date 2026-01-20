import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  changePassword,
  deactivateAccount,
  deleteAccount,
  getMyProfile,
  updateMyProfile,
  updateProfilePic,
} from "../controllers/user.controller.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const userRouter = express.Router();

userRouter.get("/me", protect, getMyProfile);
userRouter.patch("/me", protect, updateMyProfile);
userRouter.patch("/change-password", protect, changePassword);
userRouter.put("/me/avatar", protect, uploadSingle("avatar"), updateProfilePic);
userRouter.patch("/deactivate", protect, deactivateAccount);
userRouter.delete("/me", protect, deleteAccount);

export default userRouter;
