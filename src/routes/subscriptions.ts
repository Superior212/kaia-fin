import express from "express";
import { subscriptionService } from "../services/subscriptionService";
import { logger } from "../utils/logger";

const router = express.Router();

/**
 * GET /api/subscriptions/categories
 * Get all available subscription categories
 */
router.get("/categories", async (req, res) => {
  try {
    const categories = await subscriptionService.getCategories();
    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
});

/**
 * GET /api/subscriptions/services/:category
 * Get services under a specific category
 */
router.get("/services/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const services = await subscriptionService.getServices(category);
    return res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    logger.error("Error fetching services:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch services",
    });
  }
});

/**
 * GET /api/subscriptions/plans/:serviceID
 * Get plans for a specific service
 */
router.get("/plans/:serviceID", async (req, res) => {
  try {
    const { serviceID } = req.params;
    const plans = await subscriptionService.getPlans(serviceID);
    return res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    logger.error("Error fetching plans:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch plans",
    });
  }
});

/**
 * GET /api/subscriptions/fields/:serviceID
 * Get required fields for a specific service
 */
router.get("/fields/:serviceID", async (req, res) => {
  try {
    const { serviceID } = req.params;
    const fields = await subscriptionService.getFields(serviceID);
    return res.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    logger.error("Error fetching fields:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch fields",
    });
  }
});

/**
 * POST /api/subscriptions/pay
 * Process subscription payment with tokens
 */
router.post("/pay", async (req, res) => {
  try {
    const {
      tokenAmount,
      tokenType,
      serviceID,
      plan,
      phone,
      email,
      customerID,
    } = req.body;

    // Validate required fields
    if (!tokenAmount || !tokenType || !serviceID || !phone) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: tokenAmount, tokenType, serviceID, phone",
      });
    }

    // Validate token type
    const validTokenTypes = ["KAIA", "USDT", "USDC"];
    if (!validTokenTypes.includes(tokenType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid token type. Must be KAIA, USDT, or USDC",
      });
    }

    // Generate unique request ID
    const requestID =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Process payment with tokens
    const payment = await subscriptionService.processSubscriptionWithTokens(
      tokenAmount,
      tokenType,
      {
        serviceID,
        plan,
        phone,
        email,
        customerID,
        requestID,
      }
    );

    return res.json({
      success: true,
      data: payment,
      message: "Payment processed successfully",
    });
  } catch (error) {
    logger.error("Error processing subscription payment:", error);
    return res.status(500).json({
      success: false,
      error: "Payment processing failed",
    });
  }
});

/**
 * POST /api/subscriptions/verify
 * Verify payment status
 */
router.post("/verify", async (req, res) => {
  try {
    const { requestID } = req.body;

    if (!requestID) {
      return res.status(400).json({
        success: false,
        error: "Missing requestID",
      });
    }

    const verification = await subscriptionService.verifyPayment(requestID);
    return res.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    logger.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      error: "Payment verification failed",
    });
  }
});

/**
 * GET /api/subscriptions/balance
 * Get GSUBZ account balance
 */
router.get("/balance", async (req, res) => {
  try {
    const balance = await subscriptionService.getBalance();
    return res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    logger.error("Error fetching balance:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch balance",
    });
  }
});

export default router;
