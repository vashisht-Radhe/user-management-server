import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userSnapshot: {
      name: String,
      email: String,
      role: String,
    },

    action: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    targetUserSnapshot: {
      name: String,
      email: String,
    },

    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true },
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
