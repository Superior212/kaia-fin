import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  walletAddress: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  tokenSymbol: string;
  tokenDecimals: number;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  timestamp: Date;
  status: "pending" | "confirmed" | "failed";
  category?: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    from: {
      type: String,
      required: true,
      lowercase: true,
    },
    to: {
      type: String,
      required: true,
      lowercase: true,
    },
    value: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      lowercase: true,
    },
    tokenSymbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    tokenDecimals: {
      type: Number,
      required: true,
      default: 18,
    },
    gasUsed: {
      type: String,
      required: true,
    },
    gasPrice: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
transactionSchema.index({ walletAddress: 1, timestamp: -1 });
transactionSchema.index({ blockNumber: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ category: 1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
