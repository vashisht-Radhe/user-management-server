import { config } from "dotenv";
import { z } from "zod";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

const envSchema = z.object({
  PORT: z.coerce.number().default(5500),

  FRONTEND_URL: z.coerce.number().default(5173),

  NODE_ENV: z.enum(["development", "production", "test"]),

  DB_URI: z.string().min(1),

  JWT_SECRET: z.string().min(10),
  JWT_EXPIRE_IN: z.string(),

  EMAIL_USERNAME: z.string().email(),
  EMAIL_PASSWORD: z.string().min(8),

  AUTH_RATE_WINDOW: z.coerce.number(),
  AUTH_RATE_MAX: z.coerce.number(),

  USER_RATE_WINDOW: z.coerce.number(),
  USER_RATE_MAX: z.coerce.number(),

  ADMIN_RATE_WINDOW: z.coerce.number(),
  ADMIN_RATE_MAX: z.coerce.number(),

  SALT: z.coerce.number().min(8).max(15),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
