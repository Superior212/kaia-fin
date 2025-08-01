import { Task, ITask } from "../models/Task";
import { GeminiService } from "./geminiService";
import {
  AITask,
  TaskType,
  TaskParameters,
  TaskStatus,
  TaskResult,
  TaskExecutionRequest,
  TaskExecutionResponse,
} from "../types/tasks";
import { v4 as uuidv4 } from "uuid";

export class TaskService {
  private geminiService: GeminiService;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }

  async createTask(
    request: TaskExecutionRequest
  ): Promise<TaskExecutionResponse> {
    try {
      const taskId = uuidv4();

      const task = new Task({
        id: taskId,
        type: request.taskType,
        parameters: request.parameters,
        status: "PENDING",
        walletAddress: request.walletAddress,
        userId: request.userId,
        createdAt: new Date(),
      });

      await task.save();

      // Execute the task asynchronously
      this.executeTask(taskId).catch((error) => {
        console.error(`Task execution failed for ${taskId}:`, error);
      });

      return {
        taskId,
        status: "PENDING",
      };
    } catch (error) {
      console.error("Failed to create task:", error);
      throw new Error("Failed to create task");
    }
  }

  async executeTask(taskId: string): Promise<void> {
    try {
      const task = await Task.findOne({ id: taskId });
      if (!task) {
        throw new Error("Task not found");
      }

      // Update status to executing
      await Task.updateOne(
        { id: taskId },
        {
          status: "EXECUTING",
          executedAt: new Date(),
        }
      );

      let result: TaskResult;

      switch (task.type) {
        case "SAVE_MONEY":
          result = await this.executeSaveMoney(task);
          break;
        case "SEND_MONEY":
          result = await this.executeSendMoney(task);
          break;
        case "SET_SUBSCRIPTION":
          result = await this.executeSetSubscription(task);
          break;
        case "CHECK_BALANCE":
          result = await this.executeCheckBalance(task);
          break;
        case "ANALYZE_SPENDING":
          result = await this.executeAnalyzeSpending(task);
          break;
        case "AUTO_SAVE":
          result = await this.executeAutoSave(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      // Update task with result
      await Task.updateOne(
        { id: taskId },
        {
          status: "COMPLETED",
          result: result,
        }
      );
    } catch (error) {
      console.error(`Task execution failed for ${taskId}:`, error);

      await Task.updateOne(
        { id: taskId },
        {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
    }
  }

  private async executeSaveMoney(task: ITask): Promise<TaskResult> {
    const { amount, token } = task.parameters;

    // This would integrate with your smart contract
    // For now, we'll simulate the action
    const message = `Successfully saved ${amount} ${token} to your savings account.`;

    return {
      success: true,
      message,
      data: {
        amount,
        token,
        action: "SAVE_MONEY",
      },
    };
  }

  private async executeSendMoney(task: ITask): Promise<TaskResult> {
    const { amount, token, recipient } = task.parameters;

    // This would integrate with your smart contract
    // For now, we'll simulate the action
    const message = `Successfully sent ${amount} ${token} to ${recipient}.`;

    return {
      success: true,
      message,
      data: {
        amount,
        token,
        recipient,
        action: "SEND_MONEY",
      },
    };
  }

  private async executeSetSubscription(task: ITask): Promise<TaskResult> {
    const { amount, frequency, serviceAddress } = task.parameters;

    // This would integrate with your subscription service
    const message = `Successfully set up ${frequency} subscription for ${amount} to service ${serviceAddress}.`;

    return {
      success: true,
      message,
      data: {
        amount,
        frequency,
        serviceAddress,
        action: "SET_SUBSCRIPTION",
      },
    };
  }

  private async executeCheckBalance(task: ITask): Promise<TaskResult> {
    // This would integrate with your wallet service
    const message =
      "Balance check completed. Check your wallet for current balances.";

    return {
      success: true,
      message,
      data: {
        action: "CHECK_BALANCE",
      },
    };
  }

  private async executeAnalyzeSpending(task: ITask): Promise<TaskResult> {
    const { analysisType } = task.parameters;

    // This would use the existing AI analysis
    const analysis = await this.geminiService.analyzeWalletData({
      walletAddress: task.walletAddress,
      analysisType: analysisType || "general",
      transactions: [], // This would be populated with real transaction data
    });

    return {
      success: true,
      message: "Spending analysis completed successfully.",
      data: {
        analysis,
        action: "ANALYZE_SPENDING",
      },
    };
  }

  private async executeAutoSave(task: ITask): Promise<TaskResult> {
    const { percentage, token } = task.parameters;

    const message = `Auto-save configured: ${percentage}% of incoming transactions will be saved in ${token}.`;

    return {
      success: true,
      message,
      data: {
        percentage,
        token,
        action: "AUTO_SAVE",
      },
    };
  }

  async getTaskStatus(taskId: string): Promise<TaskExecutionResponse | null> {
    try {
      const task = await Task.findOne({ id: taskId });
      if (!task) {
        return null;
      }

      return {
        taskId: task.id,
        status: task.status as TaskStatus,
        result: task.result,
        error: task.error,
      };
    } catch (error) {
      console.error("Failed to get task status:", error);
      throw new Error("Failed to get task status");
    }
  }

  async getUserTasks(
    walletAddress: string,
    limit: number = 10
  ): Promise<AITask[]> {
    try {
      const tasks = await Task.find({ walletAddress })
        .sort({ createdAt: -1 })
        .limit(limit);

      return tasks.map((task) => ({
        id: task.id,
        type: task.type as TaskType,
        parameters: task.parameters,
        status: task.status as TaskStatus,
        createdAt: task.createdAt,
        executedAt: task.executedAt,
        result: task.result,
        error: task.error,
      }));
    } catch (error) {
      console.error("Failed to get user tasks:", error);
      throw new Error("Failed to get user tasks");
    }
  }

  async cancelTask(taskId: string): Promise<boolean> {
    try {
      const result = await Task.updateOne(
        { id: taskId, status: "PENDING" },
        { status: "CANCELLED" }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Failed to cancel task:", error);
      throw new Error("Failed to cancel task");
    }
  }
}
