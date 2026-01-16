import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  changePassword,
  deactivateAccount,
  deleteAccount,
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/me", protect, getMyProfile);
userRouter.patch("/me", protect, updateMyProfile);
userRouter.patch("/change-password", protect, changePassword);
userRouter.patch("/deactivate", protect, deactivateAccount);
userRouter.delete("/me", protect, deleteAccount);

export default userRouter;
