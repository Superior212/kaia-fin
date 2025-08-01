import { Router } from "express";
import { walletService } from "../services/walletService";
import { Transaction } from "../models/Transaction";


const router = Router();

// Get wallet balance
router.get("/balance/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    const balances = await walletService.getWalletBalance(walletAddress);

    return res.json({
      success: true,
      data: {
        walletAddress,
        balances,
      },
    });
  } catch (error) {
     console.log("Get wallet balance error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get wallet balance",
    });
  }
});

// Get transaction history
router.get("/transactions/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    const transactions = await Transaction.find({
      walletAddress: walletAddress.toLowerCase(),
    })
      .sort({ timestamp: -1 })
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .select("-__v");

    const total = await Transaction.countDocuments({
      walletAddress: walletAddress.toLowerCase(),
    });

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: total > parseInt(offset as string) + transactions.length,
        },
      },
    });
  } catch (error) {
     console.log("Get transaction history error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get transaction history",
    });
  }
});

// Sync wallet transactions
router.post("/sync/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    await walletService.syncWalletTransactions(walletAddress);

    return res.json({
      success: true,
      message: "Wallet transactions synced successfully",
    });
  } catch (error) {
     console.log("Sync wallet transactions error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to sync wallet transactions",
    });
  }
});

// Get transaction insights
router.get("/insights/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    const insights = await walletService.getTransactionInsights(walletAddress);

    return res.json({
      success: true,
      data: {
        walletAddress,
        insights,
      },
    });
  } catch (error) {
     console.log("Get transaction insights error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get transaction insights",
    });
  }
});

// Get transaction statistics
router.get("/stats/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { period = "30d" } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const transactions = await Transaction.find({
      walletAddress: walletAddress.toLowerCase(),
      timestamp: { $gte: startDate },
    }).sort({ timestamp: -1 });

    // Calculate statistics
    const stats = {
      totalTransactions: transactions.length,
      totalVolume: 0,
      averageTransactionValue: 0,
      mostActiveDay: "",
      tokenDistribution: {} as Record<string, number>,
      categoryDistribution: {} as Record<string, number>,
    };

    if (transactions.length > 0) {
      let totalVolume = 0;
      const tokenCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      const dayCounts: Record<string, number> = {};

      for (const tx of transactions) {
        const value = parseFloat(tx.value);
        totalVolume += value;

        // Count tokens
        tokenCounts[tx.tokenSymbol] = (tokenCounts[tx.tokenSymbol] || 0) + 1;

        // Count categories
        const category = await walletService.categorizeTransaction(tx);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        // Count by day
        const day = new Date(tx.timestamp).toDateString();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }

      stats.totalVolume = totalVolume;
      stats.averageTransactionValue = totalVolume / transactions.length;
      stats.tokenDistribution = tokenCounts;
      stats.categoryDistribution = categoryCounts;
      stats.mostActiveDay = Object.keys(dayCounts).reduce((a, b) =>
        dayCounts[a] > dayCounts[b] ? a : b
      );
    }

    return res.json({
      success: true,
      data: {
        walletAddress,
        period,
        stats,
      },
    });
  } catch (error) {
     console.log("Get transaction stats error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get transaction statistics",
    });
  }
});

export default router;
