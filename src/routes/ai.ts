import { Router } from "express";
import { aiService } from "../services/aiService";
import { walletService } from "../services/walletService";
import { ChatMessage } from "../models/ChatMessage";
import { Insight } from "../models/Insight";
import { AIAnalysisRequest, AIChatRequest, TransfersData } from "../types/ai";

const router = Router();

// AI Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { messages, walletAddress, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const chatRequest: AIChatRequest = {
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()),
      })),
      walletAddress,
      context,
    };

    const response = await aiService.chatWithAI(chatRequest);

    // Save the conversation messages
    const sessionId = `session_${Date.now()}`;

    // Save user message
    await ChatMessage.create({
      walletAddress: walletAddress || "anonymous",
      sessionId,
      role: "user",
      content: messages[messages.length - 1].content,
      metadata: {
        model: "gemini-2.5-pro-exp-03-25",
        confidence: response.confidence,
      },
    });

    // Save AI response
    await ChatMessage.create({
      walletAddress: walletAddress || "anonymous",
      sessionId,
      role: "assistant",
      content: response.message,
      metadata: {
        model: "gemini-2.5-pro-exp-03-25",
        confidence: response.confidence,
      },
    });

    return res.json({
      message: response.message,
      suggestions: response.suggestions,
      confidence: response.confidence,
    });
  } catch (error) {
    console.log("AI chat error:", error);
    return res.status(500).json({ error: "Failed to process chat request" });
  }
});

// Wallet Analysis endpoint
router.post("/analyze", async (req, res) => {
  try {
    const { walletAddress, analysisType = "general" } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // Get transactions from database or blockchain
    const transactions = await walletService.getTransactionHistory(
      walletAddress
    );

    // Check if this is a testnet wallet with no transactions
    if (transactions.length === 0) {
      return res.json({
        analysis: {
          insights: [
            `This wallet (${walletAddress}) has no transaction history on the Kaia Kairos testnet.`,
            "To get personalized insights, you'll need to perform some transactions on the testnet.",
            "You can try depositing funds, making transfers, or using our savings features.",
          ],
          recommendations: [
            "Connect to Kaia Kairos testnet in your wallet",
            "Get some test KAIA tokens from the faucet",
            "Try our savings features to generate transaction data",
            "Make some test transactions to see analysis in action",
          ],
          summary: `Wallet Analysis: No transactions found on Kaia Kairos testnet. This is normal for new wallets or wallets that haven't been used on the testnet yet.`,
          confidence: 90,
        },
        insightId: null,
      });
    }

    const analysisRequest: AIAnalysisRequest = {
      walletAddress,
      transactions: transactions.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        token: tx.token,
        tokenSymbol: tx.tokenSymbol,
        timestamp: tx.timestamp,
        blockNumber: tx.blockNumber,
        status: tx.status,
      })),
      analysisType,
    };

    const analysis = await aiService.analyzeWalletData(analysisRequest);

    // Save the insight
    const insight = new Insight({
      walletAddress,
      type: "general",
      title: `${
        analysisType.charAt(0).toUpperCase() + analysisType.slice(1)
      } Analysis`,
      description: analysis.summary,
      data: {
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence,
      },
      priority: analysis.confidence > 70 ? "high" : "medium",
      isRead: false,
    });

    await insight.save();

    return res.json({
      analysis,
      insightId: insight._id,
    });
  } catch (error) {
    console.log("Wallet analysis error:", error);

    // Create fallback insight for empty wallets or errors
    try {
      const fallbackInsight = new Insight({
        walletAddress: req.body.walletAddress,
        type: "general",
        title: "Welcome to Kaia Finance",
        description:
          "We're here to help you manage your finances. Connect your wallet to get personalized insights and recommendations.",
        data: {
          recommendation:
            "Start by exploring our features and connecting your wallet for personalized insights.",
        },
        priority: "medium",
        isRead: false,
        isActionable: true,
        actionUrl: "/dashboard",
      });

      await fallbackInsight.save();

      return res.json({
        analysis: {
          insights: [
            "Welcome to Kaia Finance! We're here to help you manage your finances.",
          ],
          recommendations: [
            "Connect your wallet to get personalized insights",
            "Explore our features to get started",
          ],
          summary: "Welcome to your financial journey with Kaia Finance",
          confidence: 100,
        },
        insightId: fallbackInsight._id,
      });
    } catch (fallbackError) {
      console.log("Fallback insight creation failed:", fallbackError);
      return res.status(500).json({ error: "Failed to analyze wallet data" });
    }
  }
});

// Savings Plan endpoint
router.post("/savings-plan", async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // Get transactions from database or blockchain
    const transactions = await walletService.getTransactionHistory(
      walletAddress
    );

    // Calculate transaction statistics
    const totalSpent = transactions
      .filter((tx) => tx.from.toLowerCase() === walletAddress.toLowerCase())
      .reduce((sum, tx) => sum + parseFloat(tx.value), 0)
      .toString();

    const totalReceived = transactions
      .filter((tx) => tx.to.toLowerCase() === walletAddress.toLowerCase())
      .reduce((sum, tx) => sum + parseFloat(tx.value), 0)
      .toString();

    const averageTransactionValue =
      transactions.length > 0
        ? (
            transactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0) /
            transactions.length
          ).toString()
        : "0";

    const mostFrequentToken =
      transactions.length > 0
        ? transactions.reduce((acc, tx) => {
            acc[tx.tokenSymbol] = (acc[tx.tokenSymbol] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        : {};

    const transfersData: TransfersData = {
      walletAddress,
      transactions: transactions.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        token: tx.token,
        tokenSymbol: tx.tokenSymbol,
        timestamp: tx.timestamp,
        blockNumber: tx.blockNumber,
        status: tx.status,
      })),
      totalSpent,
      totalReceived,
      averageTransactionValue,
      mostFrequentToken:
        Object.keys(mostFrequentToken).length > 0
          ? Object.entries(mostFrequentToken).sort(
              ([, a], [, b]) => (b as number) - (a as number)
            )[0][0]
          : "KAIA",
      transactionCount: transactions.length,
      lastTransactionDate:
        transactions.length > 0
          ? transactions[transactions.length - 1].timestamp.toISOString()
          : undefined,
    };

    const savingsPlan = await aiService.getSavingsPlan(transfersData);

    if (!savingsPlan) {
      // Create fallback savings plan for empty wallets
      const fallbackPlan = `
**SaveSense Savings Plans**

Since you're new to Kaia Finance, here are our general savings plan options:

1. **Basic Plan:** Set aside a fixed amount (e.g., 10 KAIA) for a specific duration (e.g., 30 days)
2. **Frequency Plan:** Automate saving 5 KAIA every week or 20 KAIA every month
3. **Spend & Save Plan:** Save 10% of every transaction you make

Start with a small amount and gradually increase as you become more comfortable with saving.

Best regards from SaveSense.
      `;

      return res.json({
        savingsPlan: fallbackPlan,
        transactionStats: {
          totalSpent: "0",
          totalReceived: "0",
          averageTransactionValue: "0",
          transactionCount: 0,
        },
      });
    }

    return res.json({
      savingsPlan,
      transactionStats: {
        totalSpent,
        totalReceived,
        averageTransactionValue,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.log("Savings plan generation error:", error);

    // Create fallback savings plan for errors
    const fallbackPlan = `
**SaveSense Savings Plans**

We're here to help you start your savings journey! Here are our general savings plan options:

1. **Basic Plan:** Set aside a fixed amount (e.g., 10 KAIA) for a specific duration (e.g., 30 days)
2. **Frequency Plan:** Automate saving 5 KAIA every week or 20 KAIA every month
3. **Spend & Save Plan:** Save 10% of every transaction you make

Best regards from SaveSense.
    `;

    return res.json({
      savingsPlan: fallbackPlan,
      transactionStats: {
        totalSpent: "0",
        totalReceived: "0",
        averageTransactionValue: "0",
        transactionCount: 0,
      },
    });
  }
});

// Get AI Insights
router.get("/insights/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const insights = await Insight.find({ walletAddress }).sort({
      createdAt: -1,
    });

    // If no insights exist, create a welcome insight
    if (insights.length === 0) {
      try {
        const welcomeInsight = new Insight({
          walletAddress,
          type: "general",
          title: "Welcome to Kaia Finance",
          description:
            "We're here to help you manage your finances. Connect your wallet to get personalized insights and recommendations.",
          data: {
            recommendation:
              "Start by exploring our features and connecting your wallet for personalized insights.",
          },
          priority: "medium",
          isRead: false,
          isActionable: true,
          actionUrl: "/dashboard",
        });

        await welcomeInsight.save();

        return res.json({
          insights: [welcomeInsight],
          message: "Welcome insight created for new user",
        });
      } catch (fallbackError) {
        console.log("Welcome insight creation failed:", fallbackError);
        return res.json({ insights: [] });
      }
    }

    return res.json({ insights });
  } catch (error) {
    console.log("Get insights error:", error);
    return res.status(500).json({ error: "Failed to retrieve insights" });
  }
});

export default router;
