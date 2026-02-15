import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const ROLES = ["user", "admin"];

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ROLES,
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailOtp: {
      type: String,
      select: false,
      minLength: [6, "OTP must be exactly 6 digits"],
    },
    emailOtpExpires: Date,
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLastSent: Date,
    otpBlockedUntil: Date,

    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: Date,

    avatar: {
      type: String,
      default: null,
    },

    deactivatedAt: {
      type: Date,
      default: null,
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deactivatedReason: {
      type: String,
      enum: ["admin", "self"],
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index({ isDeleted: 1, role: 1 });
userSchema.index({ isActive: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.SALT);
});

userSchema.pre("save", function () {
  if (this.isDeleted) {
    this.isActive = false;
  }
});

const User = mongoose.model("User", userSchema);

export default User;
