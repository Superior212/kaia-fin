import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";

// Import routes
import aiRoutes from "./routes/ai";
import walletRoutes from "./routes/wallet";
import insightRoutes from "./routes/insights";
import userRoutes from "./routes/users";
import subscriptionRoutes from "./routes/subscriptions";
import taskRoutes from "./routes/tasks";

const app = express();

// Only create WebSocket server in non-serverless environments
let io: Server | null = null;
let server: any = null;

if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  const { createServer } = require("http");
  server = createServer(app);
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
}

const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(rateLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/ai", aiRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/tasks", taskRoutes);

// WebSocket connection for real-time AI chat (only in non-serverless environments)
if (io) {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-chat", (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined chat`);
    });

    socket.on("send-message", async (data) => {
      try {
        // Handle AI chat messages
        const { userId, message } = data;
        // TODO: Process with AI service
        socket.emit("ai-response", { message: "AI response placeholder" });
      } catch (error) {
        console.log("Error processing message:", error);
        socket.emit("error", { message: "Failed to process message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB (only if not in serverless mode)
    if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
      await connectDB();
    }

    if (server) {
      // Full server with WebSocket support
      server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      });
    } else {
      // Serverless environment - just start the app
      console.log(`🚀 Serverless function ready`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    }
  } catch (error) {
    console.log("Failed to start server:", error);
    // Don't exit in serverless mode
    if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
      process.exit(1);
    }
  }
};

startServer();

export { app, io };
