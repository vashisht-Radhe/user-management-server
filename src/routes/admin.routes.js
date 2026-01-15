import express from "express";
import { getUserById, getUsers } from "../controllers/admin.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

const adminRoutes = express.Router();

adminRoutes.get("/", protect, authorize("admin"), getUsers);
adminRoutes.get("/:id", protect, authorize("admin"), getUserById);

export default adminRoutes;
