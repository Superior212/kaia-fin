import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
  walletAddress: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
    intent?: string;
    confidence?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      tokens: Number,
      model: String,
      processingTime: Number,
      intent: String,
      confidence: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
chatMessageSchema.index({ walletAddress: 1, sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1 });
chatMessageSchema.index({ role: 1 });

export const ChatMessage = mongoose.model<IChatMessage>(
  "ChatMessage",
  chatMessageSchema
);
