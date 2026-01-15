import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import userRouter from "./user.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRouter);
router.use("/admin/users", adminRoutes);

export default router;
