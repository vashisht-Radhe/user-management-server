import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getMyProfile } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/me", protect, getMyProfile);

export default userRouter;
