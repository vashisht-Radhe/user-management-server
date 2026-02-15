import mongoose from "mongoose";
import { env } from "../config/env.js";

if (!env.DB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env<development/production>.local",
  );
}

const connectDB = async () => {
  try {
    await mongoose.connect(env.DB_URI);
    console.log(`✅ Database connected successfully in ${env.NODE_ENV} mode`);
  } catch (error) {
    console.error("Error connnecting to database: ", error);

    process.exit(1);
  }
};

export default connectDB;
