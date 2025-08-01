export interface TransfersData {
  walletAddress: string;
  transactions: Transaction[];
  totalSpent: string;
  totalReceived: string;
  averageTransactionValue: string;
  mostFrequentToken: string;
  transactionCount: number;
  lastTransactionDate?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  tokenSymbol: string;
  timestamp: Date;
  blockNumber: number;
  status: "pending" | "confirmed" | "failed";
}

export interface AIAnalysisRequest {
  walletAddress: string;
  transactions: Transaction[];
  analysisType: "savings" | "spending" | "general";
}

export interface AIAnalysisResponse {
  insights: string[];
  recommendations: string[];
  summary: string;
  confidence: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIChatRequest {
  messages: ChatMessage[];
  walletAddress?: string;
  context?: string;
}

export interface AIChatResponse {
  message: string;
  suggestions?: string[];
  confidence: number;
}
