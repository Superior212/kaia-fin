import mongoose, { Document, Schema } from "mongoose";

export interface IInsight extends Document {
  walletAddress: string;
  type: "spending" | "savings" | "investment" | "risk" | "goal" | "general";
  title: string;
  description: string;
  data: {
    amount?: number;
    percentage?: number;
    period?: string;
    category?: string;
    trend?: "increasing" | "decreasing" | "stable";
    recommendation?: string;
  };
  priority: "low" | "medium" | "high";
  isRead: boolean;
  isActionable: boolean;
  actionUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const insightSchema = new Schema<IInsight>(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["spending", "savings", "investment", "risk", "goal", "general"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      amount: Number,
      percentage: Number,
      period: String,
      category: String,
      trend: {
        type: String,
        enum: ["increasing", "decreasing", "stable"],
      },
      recommendation: String,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isActionable: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
insightSchema.index({ walletAddress: 1, createdAt: -1 });
insightSchema.index({ type: 1 });
insightSchema.index({ priority: 1 });
insightSchema.index({ isRead: 1 });
insightSchema.index({ expiresAt: 1 });

export const Insight = mongoose.model<IInsight>("Insight", insightSchema);
