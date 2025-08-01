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
        Analyze the following wallet transaction data from the Kaia Kairos testnet and provide financial insights:

        Wallet Address: ${request.walletAddress}
        Analysis Type: ${request.analysisType}
        Transaction Count: ${request.transactions.length}
        Network: Kaia Kairos Testnet (Chain ID: 1001)

        Transaction Data:
        ${JSON.stringify(request.transactions, null, 2)}

        Important Context:
        - This is testnet data, so transactions are for testing purposes
        - Token values may be test tokens (KAIA, USDT, etc.)
        - Focus on patterns and behaviors rather than absolute values
        - Provide insights that would be useful for real mainnet usage

        Please provide a well-formatted analysis with the following structure:

        📊 Wallet Analysis Complete!

        Key Insights:
        • [Analyze spending patterns, transaction frequency, amounts, and behaviors]
        • [Identify if the wallet is primarily sending or receiving]
        • [Note any patterns in transaction timing or amounts]
        • [Comment on interaction with DeFi protocols if applicable]

        Recommendations:
        • [Based on spending patterns, suggest savings strategies]
        • [Recommend transaction frequency optimization]
        • [Suggest ways to reduce gas costs if applicable]
        • [Provide DeFi usage recommendations if relevant]

        Summary:
        [Brief summary of the analysis in 2-3 sentences focusing on actual transaction patterns]

        Confidence Level: [0-100]% based on data quality and transaction count

        Would you like me to help you with:
        • Setting up savings goals
        • Analyzing spending patterns
        • Creating a financial plan

        Important: Format your response as clean, readable text. Use bullet points (•) for lists, not asterisks (*). Do not include any JSON formatting, code blocks, or duplicate content. Keep the response concise and well-structured.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      // Clean up formatting issues
      text = text
        .replace(/\*\*\*/g, "•") // Replace asterisks with bullet points
        .replace(/\*\*/g, "") // Remove double asterisks
        .replace(/\*/g, "") // Remove single asterisks
        .replace(/```json\n[\s\S]*?\n```/g, "") // Remove JSON code blocks
        .replace(/```\n[\s\S]*?\n```/g, "") // Remove any code blocks
        .replace(
          /📊 Wallet Analysis Complete!\s*\n\s*📊 Wallet Analysis Complete!/g,
          "📊 Wallet Analysis Complete!"
        ) // Remove duplicate headers
        .trim();

      // Parse the formatted text to extract insights and recommendations
      const lines = text.split("\n");
      const insights: string[] = [];
      const recommendations: string[] = [];
      let summary = "";
      let currentSection = "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.includes("Key Insights:")) {
          currentSection = "insights";
        } else if (trimmedLine.includes("Recommendations:")) {
          currentSection = "recommendations";
        } else if (trimmedLine.includes("Summary:")) {
          currentSection = "summary";
        } else if (
          trimmedLine.startsWith("•") &&
          currentSection === "insights"
        ) {
          insights.push(trimmedLine.substring(1).trim());
        } else if (
          trimmedLine.startsWith("•") &&
          currentSection === "recommendations"
        ) {
          recommendations.push(trimmedLine.substring(1).trim());
        } else if (
          currentSection === "summary" &&
          trimmedLine &&
          !trimmedLine.includes("Confidence Level:")
        ) {
          summary += trimmedLine + " ";
        }
      }

      // Return the properly structured response
      return {
        insights:
          insights.length > 0 ? insights : ["Analysis completed successfully"],
        recommendations:
          recommendations.length > 0
            ? recommendations
            : ["Consider reviewing your spending patterns"],
        summary: summary.trim() || "Analysis completed successfully",
        confidence: 85,
      };
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
        You are a helpful financial AI assistant for Kaia Finance on the Kaia Kairos testnet. You help users with:
        - Financial advice and insights
        - Wallet analysis and spending patterns
        - Savings recommendations
        - General financial questions

        Context: ${request.context || "General financial assistance"}
        Wallet Address: ${request.walletAddress || "Not provided"}
        Network: Kaia Kairos Testnet (Chain ID: 1001)

        Conversation History:
        ${conversationHistory}

        Please provide a helpful, friendly response. If asked about wallet analysis, mention that detailed analysis is available through the wallet analysis feature. Remember that this is testnet data, so focus on patterns and behaviors rather than absolute values.
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
