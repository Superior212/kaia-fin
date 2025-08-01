import { Router } from "express";
import { Insight } from "../models/Insight";

const router = Router();

// Get all insights for a wallet
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { type, priority, isRead, limit = 20, offset = 0 } = req.query;

    const filter: any = {
      walletAddress: walletAddress.toLowerCase(),
    };

    if (type) {
      filter.type = type;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    const insights = await Insight.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .select("-__v");

    const total = await Insight.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        insights,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: total > parseInt(offset as string) + insights.length,
        },
      },
    });
  } catch (error) {
     console.log("Get insights error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get insights",
    });
  }
});

// Get insight by ID
router.get("/insight/:insightId", async (req, res) => {
  try {
    const { insightId } = req.params;

    const insight = await Insight.findById(insightId).select("-__v");

    if (!insight) {
      return res.status(404).json({
        success: false,
        error: "Insight not found",
      });
    }

    return res.json({
      success: true,
      data: {
        insight,
      },
    });
  } catch (error) {
     console.log("Get insight by ID error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get insight",
    });
  }
});

// Mark insight as read
router.patch("/:insightId/read", async (req, res) => {
  try {
    const { insightId } = req.params;

    const insight = await Insight.findByIdAndUpdate(
      insightId,
      { isRead: true },
      { new: true }
    ).select("-__v");

    if (!insight) {
      return res.status(404).json({
        success: false,
        error: "Insight not found",
      });
    }

    return res.json({
      success: true,
      data: {
        insight,
      },
    });
  } catch (error) {
     console.log("Mark insight as read error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to mark insight as read",
    });
  }
});

// Mark multiple insights as read
router.patch("/:walletAddress/read-multiple", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { insightIds } = req.body;

    if (!insightIds || !Array.isArray(insightIds)) {
      return res.status(400).json({
        success: false,
        error: "Insight IDs array is required",
      });
    }

    await Insight.updateMany(
      {
        _id: { $in: insightIds },
        walletAddress: walletAddress.toLowerCase(),
      },
      { isRead: true }
    );

    return res.json({
      success: true,
      message: `${insightIds.length} insights marked as read`,
    });
  } catch (error) {
     console.log("Mark multiple insights as read error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to mark insights as read",
    });
  }
});

// Delete insight
router.delete("/:insightId", async (req, res) => {
  try {
    const { insightId } = req.params;

    const insight = await Insight.findByIdAndDelete(insightId);

    if (!insight) {
      return res.status(404).json({
        success: false,
        error: "Insight not found",
      });
    }

    return res.json({
      success: true,
      message: "Insight deleted successfully",
    });
  } catch (error) {
     console.log("Delete insight error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete insight",
    });
  }
});

// Get insights summary
router.get("/:walletAddress/summary", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const [
      totalInsights,
      unreadInsights,
      highPriorityInsights,
      actionableInsights,
      insightsByType,
    ] = await Promise.all([
      Insight.countDocuments({ walletAddress: walletAddress.toLowerCase() }),
      Insight.countDocuments({
        walletAddress: walletAddress.toLowerCase(),
        isRead: false,
      }),
      Insight.countDocuments({
        walletAddress: walletAddress.toLowerCase(),
        priority: "high",
      }),
      Insight.countDocuments({
        walletAddress: walletAddress.toLowerCase(),
        isActionable: true,
      }),
      Insight.aggregate([
        { $match: { walletAddress: walletAddress.toLowerCase() } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

    const summary = {
      total: totalInsights,
      unread: unreadInsights,
      highPriority: highPriorityInsights,
      actionable: actionableInsights,
      byType: insightsByType.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    return res.json({
      success: true,
      data: {
        summary,
      },
    });
  } catch (error) {
     console.log("Get insights summary error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get insights summary",
    });
  }
});

export default router;
