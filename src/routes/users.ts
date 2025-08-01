import { Router } from "express";
import { User } from "../models/User";


const router = Router();

// Get user by wallet address
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    }).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
     console.log("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get user",
    });
  }
});

// Create or update user
router.post("/", async (req, res) => {
  try {
    const { walletAddress, username, email, preferences } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    const userData = {
      walletAddress: walletAddress.toLowerCase(),
      ...(username && { username }),
      ...(email && { email }),
      ...(preferences && { preferences }),
    };

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      userData,
      { upsert: true, new: true }
    ).select("-__v");

    return res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
     console.log("Create/update user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create/update user",
    });
  }
});

// Update user preferences
router.patch("/:walletAddress/preferences", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: "Preferences are required",
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { preferences },
      { new: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
     console.log("Update user preferences error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update user preferences",
    });
  }
});

// Delete user
router.delete("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOneAndDelete({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
     console.log("Delete user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
});

export default router;
