import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  username?: string;
  email?: string;
  preferences: {
    notifications: boolean;
    aiInsights: boolean;
    savingsGoals: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      aiInsights: {
        type: Boolean,
        default: true,
      },
      savingsGoals: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>("User", userSchema);
