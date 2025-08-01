export interface AITask {
  id: string;
  type: TaskType;
  parameters: TaskParameters;
  status: TaskStatus;
  createdAt: Date;
  executedAt?: Date;
  result?: TaskResult;
  error?: string;
}

export type TaskType =
  | "SAVE_MONEY"
  | "SEND_MONEY"
  | "SET_SUBSCRIPTION"
  | "CHECK_BALANCE"
  | "ANALYZE_SPENDING"
  | "OPTIMIZE_YIELD"
  | "SET_BUDGET_LIMIT"
  | "AUTO_SAVE";

export type TaskStatus =
  | "PENDING"
  | "EXECUTING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface TaskParameters {
  amount?: string;
  token?: string;
  recipient?: string;
  frequency?: string;
  walletAddress?: string;
  analysisType?: "savings" | "spending" | "general";
  percentage?: number;
  duration?: string;
  serviceAddress?: string;
}

export interface TaskResult {
  success: boolean;
  transactionHash?: string;
  message: string;
  data?: any;
}

export interface TaskExecutionRequest {
  taskType: TaskType;
  parameters: TaskParameters;
  walletAddress: string;
  userId?: string;
}

export interface TaskExecutionResponse {
  taskId: string;
  status: TaskStatus;
  result?: TaskResult;
  error?: string;
}

// Task templates for common actions
export const TASK_TEMPLATES = {
  SAVE_USDT: {
    type: "SAVE_MONEY" as TaskType,
    parameters: {
      token: "USDT",
      amount: "0",
    },
  },
  SEND_USDT: {
    type: "SEND_MONEY" as TaskType,
    parameters: {
      token: "USDT",
      amount: "0",
      recipient: "",
    },
  },
  SET_SUBSCRIPTION: {
    type: "SET_SUBSCRIPTION" as TaskType,
    parameters: {
      amount: "0",
      frequency: "monthly",
      serviceAddress: "",
    },
  },
  CHECK_BALANCE: {
    type: "CHECK_BALANCE" as TaskType,
    parameters: {},
  },
  ANALYZE_SPENDING: {
    type: "ANALYZE_SPENDING" as TaskType,
    parameters: {
      analysisType: "general",
    },
  },
  AUTO_SAVE: {
    type: "AUTO_SAVE" as TaskType,
    parameters: {
      percentage: 10,
      token: "USDT",
    },
  },
} as const;
