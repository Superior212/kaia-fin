import express from "express";
import { TaskService } from "../services/taskService";
import { GeminiService } from "../services/geminiService";
import { TaskExecutionRequest } from "../types/tasks";

const router = express.Router();

// Initialize services
const geminiService = new GeminiService(process.env.GEMINI_API_KEY || "");
const taskService = new TaskService(geminiService);

// Execute a new task
router.post("/execute", async (req, res) => {
  try {
    const { taskType, parameters, walletAddress, userId } =
      req.body as TaskExecutionRequest;

    if (!taskType || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: "taskType and walletAddress are required",
      });
    }

    const response = await taskService.createTask({
      taskType,
      parameters: parameters || {},
      walletAddress,
      userId,
    });

    return res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Task execution failed:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to execute task",
    });
  }
});

// Get task status
router.get("/status/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const status = await taskService.getTaskStatus(taskId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    return res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Failed to get task status:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get task status",
    });
  }
});

// Get user's task history
router.get("/user/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const tasks = await taskService.getUserTasks(walletAddress, limit);

    return res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Failed to get user tasks:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get user tasks",
    });
  }
});

// Cancel a pending task
router.post("/cancel/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const cancelled = await taskService.cancelTask(taskId);

    if (!cancelled) {
      return res.status(400).json({
        success: false,
        error: "Task cannot be cancelled or not found",
      });
    }

    return res.json({
      success: true,
      message: "Task cancelled successfully",
    });
  } catch (error) {
    console.error("Failed to cancel task:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to cancel task",
    });
  }
});

// Get available task templates
router.get("/templates", (req, res) => {
  const templates = {
    SAVE_USDT: {
      type: "SAVE_MONEY",
      parameters: {
        token: "USDT",
        amount: "0",
      },
      description: "Save money in USDT",
    },
    SEND_USDT: {
      type: "SEND_MONEY",
      parameters: {
        token: "USDT",
        amount: "0",
        recipient: "",
      },
      description: "Send USDT to another address",
    },
    SET_SUBSCRIPTION: {
      type: "SET_SUBSCRIPTION",
      parameters: {
        amount: "0",
        frequency: "monthly",
        serviceAddress: "",
      },
      description: "Set up a recurring subscription",
    },
    CHECK_BALANCE: {
      type: "CHECK_BALANCE",
      parameters: {},
      description: "Check wallet balances",
    },
    ANALYZE_SPENDING: {
      type: "ANALYZE_SPENDING",
      parameters: {
        analysisType: "general",
      },
      description: "Analyze spending patterns",
    },
    AUTO_SAVE: {
      type: "AUTO_SAVE",
      parameters: {
        percentage: 10,
        token: "USDT",
      },
      description: "Automatically save a percentage of transactions",
    },
  };

  return res.json({
    success: true,
    data: templates,
  });
});

export default router;
