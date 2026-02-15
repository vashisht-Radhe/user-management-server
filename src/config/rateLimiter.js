import rateLimit from "express-rate-limit";
import { env } from "./env.js";

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs: Number(windowMs),
    max: Number(max),
    message: {
      success: false,
      message,
    },
  });

export const authLimiter = createLimiter(
  env.AUTH_RATE_WINDOW || 15 * 60 * 1000,
  env.AUTH_RATE_MAX || 5,
  "Too many authentication attempts. Try again later.",
);

export const userLimiter = createLimiter(
  env.USER_RATE_WINDOW || 15 * 60 * 1000,
  env.USER_RATE_MAX || 60,
  "Too many requests. Slow down.",
);

export const adminLimiter = createLimiter(
  env.ADMIN_RATE_WINDOW || 15 * 60 * 1000,
  env.ADMIN_RATE_MAX || 20,
  "Admin rate limit exceeded.",
);
