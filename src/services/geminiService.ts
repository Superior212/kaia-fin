import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  TransfersData,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIChatRequest,
  AIChatResponse,
} from "../types/ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = "gemini-2.5-flash";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async getSavingsPlan(transfersData: TransfersData): Promise<string | null> {
    console.log("Using Gemini API for savings plan generation");

    try {
      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const model = this.genAI.getGenerativeModel({
        model: this.model,
        safetySettings,
        generationConfig,
      });

      const prompt = `
        ${JSON.stringify(transfersData)}

        You are a financial savings AI called KaiaMate. Someone wants to save money with you. Advise your user on how to save properly based on their recent transaction history provided above.
        You must sound convincing and homely, explaining things clearly in soft diction. Review their recent transactions (ERC20 and native transfers) and consider how much they spend and how often.
        Craft a proper savings plan based on their past transactions.

        Offer these three savings plan options:
        1.  **Basic Plan:** A one-off savings plan with a fixed duration and fixed amount.
        2.  **Frequency Plan:** Automate saving a specific amount at regular intervals (e.g., daily, weekly, monthly).
        3.  **Spend & Save Plan:** Save a certain percentage of every transaction made from their wallet.

        Present these plans concisely and clearly so a layperson can understand and implement them.

        Always end with "Best regards from KaiaMate."

        NOTE: If the transaction data (JSON) is empty or shows no spending activity, state that you have no recent transaction data to analyze, do not use the word "json", and explain the savings plan options generally for the user.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log("Gemini API response received successfully");
      return text;
    } catch (error) {
      console.log("Error calling Gemini API:", error);
      return null;
    }
  }

  async analyzeWalletData(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    try {
      const generationConfig = {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1500,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const model = this.genAI.getGenerativeModel({
        model: this.model,
        safetySettings,
        generationConfig,
      });

      const prompt = `
        Analyze the following wallet transaction data and provide financial insights:

        Wallet Address: ${request.walletAddress}
        Analysis Type: ${request.analysisType}
        Transaction Count: ${request.transactions.length}

        Transaction Data:
        ${JSON.stringify(request.transactions, null, 2)}

        Please provide:
        1. 3-5 key insights about spending patterns
        2. 3-5 actionable recommendations
        3. A brief summary of the analysis
        4. Confidence level (0-100) based on data quality

        Format your response as JSON:
        {
          "insights": ["insight1", "insight2", "insight3"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "summary": "brief summary",
          "confidence": 85
        }
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(text);
        return {
          insights: parsed.insights || ["No insights available"],
          recommendations: parsed.recommendations || [
            "No recommendations available",
          ],
          summary: parsed.summary || "Analysis completed",
          confidence: parsed.confidence || 50,
        };
      } catch (parseError) {
        console.log("Failed to parse Gemini response as JSON, using fallback");
        return {
          insights: ["Analysis completed successfully"],
          recommendations: ["Consider reviewing your spending patterns"],
          summary: text.substring(0, 200) + "...",
          confidence: 70,
        };
      }
    } catch (error) {
      console.log("Error analyzing wallet data with Gemini:", error);
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
      const generationConfig = {
        temperature: 0.8,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const model = this.genAI.getGenerativeModel({
        model: this.model,
        safetySettings,
        generationConfig,
      });

      const conversationHistory = request.messages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const prompt = `
        You are a helpful financial AI assistant for Kaia Finance. You help users with:
        - Financial advice and insights
        - Wallet analysis and spending patterns
        - Savings recommendations
        - General financial questions

        Context: ${request.context || "General financial assistance"}
        Wallet Address: ${request.walletAddress || "Not provided"}

        Conversation History:
        ${conversationHistory}

        Please provide a helpful, friendly response. If asked about wallet analysis, mention that detailed analysis is available through the wallet analysis feature.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return {
        message: text,
        suggestions: [
          "Analyze my wallet spending",
          "Get savings recommendations",
          "View transaction history",
        ],
        confidence: 85,
      };
    } catch (error) {
      console.log("Error in AI chat with Gemini:", error);
      return {
        message:
          "I'm having trouble processing your request right now. Please try again later.",
        suggestions: ["Try again", "Contact support"],
        confidence: 0,
      };
    }
  }
}
