import { GeminiService } from "./geminiService";
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIChatRequest,
  AIChatResponse,
  TransfersData,
} from "../types/ai";

class AIService {
  private geminiService: GeminiService | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        this.geminiService = new GeminiService(apiKey);
        console.log("Gemini AI service initialized successfully");
      } catch (error) {
        console.log("Failed to initialize Gemini service:", error);
      }
    } else {
      console.log("GEMINI_API_KEY not configured, AI features will be limited");
    }
  }

  async analyzeWalletData(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    try {
      if (!this.geminiService) {
        console.log("Gemini API key not configured, returning mock analysis");
        return {
          insights: ["Mock insight: Consider diversifying your portfolio"],
          recommendations: ["Mock recommendation: Set up automatic savings"],
          summary: "Mock analysis - configure GEMINI_API_KEY for real insights",
          confidence: 50,
        };
      }

      return await this.geminiService.analyzeWalletData(request);
    } catch (error) {
      console.log("AI analysis failed:", error);
      return {
        insights: ["Error analyzing wallet data"],
        recommendations: ["Please try again later"],
        summary: "Analysis failed - please check configuration",
        confidence: 0,
      };
    }
  }

  async chatWithAI(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      if (!this.geminiService) {
        console.log("Gemini API key not configured, returning mock response");
        return {
          message:
            "I'm currently in demo mode. Please configure your GEMINI_API_KEY for full AI functionality.",
          suggestions: ["Configure API key", "Try again later"],
          confidence: 0,
        };
      }

      return await this.geminiService.chatWithAI(request);
    } catch (error) {
      console.log("AI chat failed:", error);
      return {
        message:
          "I'm having trouble processing your request right now. Please try again later.",
        suggestions: ["Try again", "Contact support"],
        confidence: 0,
      };
    }
  }

  async getSavingsPlan(transfersData: TransfersData): Promise<string | null> {
    try {
      if (!this.geminiService) {
        console.log(
          "Gemini API key not configured, returning mock savings plan"
        );
        return `
          **SaveSense Savings Plans**

          Since I don't have access to your transaction data, here are our general savings plan options:

          1. **Basic Plan:** Set aside a fixed amount (e.g., 100 KAIA) for a specific duration (e.g., 30 days)
          2. **Frequency Plan:** Automate saving 50 KAIA every week or 200 KAIA every month
          3. **Spend & Save Plan:** Save 10% of every transaction you make

          Configure your GEMINI_API_KEY to get personalized savings recommendations based on your transaction history.

          Best regards from SaveSense.
        `;
      }

      return await this.geminiService.getSavingsPlan(transfersData);
    } catch (error) {
      console.log("Savings plan generation failed:", error);
      return null;
    }
  }
}

export const aiService = new AIService();
