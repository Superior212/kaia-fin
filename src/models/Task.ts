import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  id: string;
  type: string;
  parameters: Record<string, any>;
  status: string;
  walletAddress: string;
  userId?: string;
  createdAt: Date;
  executedAt?: Date;
  result?: {
    success: boolean;
    transactionHash?: string;
    message: string;
    data?: any;
  };
  error?: string;
}

const TaskSchema = new Schema<ITask>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "SAVE_MONEY",
      "SEND_MONEY",
      "SET_SUBSCRIPTION",
      "CHECK_BALANCE",
      "ANALYZE_SPENDING",
      "OPTIMIZE_YIELD",
      "SET_BUDGET_LIMIT",
      "AUTO_SAVE",
    ],
  },
  parameters: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
  status: {
    type: String,
    required: true,
    enum: ["PENDING", "EXECUTING", "COMPLETED", "FAILED", "CANCELLED"],
    default: "PENDING",
  },
  walletAddress: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  executedAt: {
    type: Date,
    required: false,
  },
  result: {
    success: { type: Boolean, default: false },
    transactionHash: { type: String, required: false },
    message: { type: String, required: false },
    data: { type: Schema.Types.Mixed, required: false },
  },
  error: {
    type: String,
    required: false,
  },
});

// Index for efficient queries
TaskSchema.index({ walletAddress: 1, createdAt: -1 });
TaskSchema.index({ status: 1, createdAt: -1 });

export const Task = mongoose.model<ITask>("Task", TaskSchema);
