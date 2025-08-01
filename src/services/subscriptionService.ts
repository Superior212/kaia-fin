import axios from "axios";
import { logger } from "../utils/logger";

export interface GSUBZService {
  serviceID: string;
  displayName: string;
  category: string;
}

export interface GSUBZPlan {
  displayName: string;
  value: string;
  price: string;
}

export interface SubscriptionPayment {
  serviceID: string;
  plan?: string;
  amount: number;
  phone: string;
  email?: string;
  customerID?: string;
  requestID: string;
}

export interface PaymentResponse {
  code: string;
  status: string;
  description: string;
  content: {
    transactionID: string;
    requestID: string;
    amount: number;
    phone: string;
    serviceID: string;
    email?: string;
    customerID?: string;
    plan?: string;
    image?: string;
    convinience_fee: number;
    productType: string;
    serviceName: string;
    date: string;
  };
}

class SubscriptionService {
  private baseURL = "https://gsubz.com/api";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GSUBZ_API_KEY || "";
    if (!this.apiKey) {
      logger.warn("GSUBZ API key not configured");
    }
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<GSUBZService[]> {
    try {
      const response = await axios.get(`${this.baseURL}/category`);
      return response.data;
    } catch (error) {
      logger.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  /**
   * Get services under a category
   */
  async getServices(category: string): Promise<GSUBZService[]> {
    try {
      // Map categories to their available services
      const categoryServices: { [key: string]: GSUBZService[] } = {
        artime: [
          { serviceID: "mtn", displayName: "MTN Airtime", category: "artime" },
          {
            serviceID: "airtel",
            displayName: "Airtel Airtime",
            category: "artime",
          },
          { serviceID: "glo", displayName: "Glo Airtime", category: "artime" },
          {
            serviceID: "9mobile",
            displayName: "9mobile Airtime",
            category: "artime",
          },
        ],
        tv: [
          { serviceID: "gotv", displayName: "GOtv", category: "tv" },
          { serviceID: "dstv", displayName: "DStv", category: "tv" },
          { serviceID: "startimes", displayName: "StarTimes", category: "tv" },
        ],
        data: [
          { serviceID: "mtn_data", displayName: "MTN Data", category: "data" },
          {
            serviceID: "airtel_data",
            displayName: "Airtel Data",
            category: "data",
          },
          { serviceID: "glo_data", displayName: "Glo Data", category: "data" },
          {
            serviceID: "9mobile_data",
            displayName: "9mobile Data",
            category: "data",
          },
        ],
        electricity: [
          {
            serviceID: "ikeja_electric",
            displayName: "Ikeja Electric",
            category: "electricity",
          },
          {
            serviceID: "eko_electric",
            displayName: "Eko Electricity",
            category: "electricity",
          },
          {
            serviceID: "kano_electric",
            displayName: "Kano Electricity",
            category: "electricity",
          },
        ],
        education: [
          {
            serviceID: "waec",
            displayName: "WAEC Result Checker",
            category: "education",
          },
          {
            serviceID: "neco",
            displayName: "NECO Result Checker",
            category: "education",
          },
        ],
        transfer: [
          {
            serviceID: "bank_transfer",
            displayName: "Bank Transfer",
            category: "transfer",
          },
        ],
      };

      const services = categoryServices[category] || [];
      return services;
    } catch (error) {
      logger.error("Error fetching services:", error);
      throw new Error("Failed to fetch services");
    }
  }

  /**
   * Get plans for a specific service
   */
  async getPlans(serviceID: string): Promise<{
    service: string;
    PlanName: string;
    fixedPrice: boolean;
    plans: GSUBZPlan[];
  }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/plans?service=${serviceID}`
      );
      return response.data;
    } catch (error) {
      logger.error("Error fetching plans:", error);
      throw new Error("Failed to fetch plans");
    }
  }

  /**
   * Get fields required for a service
   */
  async getFields(serviceID: string): Promise<{
    service: string;
    field: Array<{
      displayName: string;
      name: string;
      type: string;
      description: string;
      regExp: string;
      required: boolean;
    }>;
  }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/fields?service=${serviceID}`
      );
      return response.data;
    } catch (error) {
      logger.error("Error fetching fields:", error);
      throw new Error("Failed to fetch fields");
    }
  }

  /**
   * Make a subscription payment
   */
  async makePayment(payment: SubscriptionPayment): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/pay`, payment, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      logger.info("Payment processed:", response.data);
      return response.data;
    } catch (error) {
      logger.error("Error processing payment:", error);
      throw new Error("Payment processing failed");
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(requestID: string): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/verify`,
        { requestID },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error("Error verifying payment:", error);
      throw new Error("Payment verification failed");
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ balance: string }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/balance`,
        { api: this.apiKey },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.content;
    } catch (error) {
      logger.error("Error fetching balance:", error);
      throw new Error("Failed to fetch balance");
    }
  }

  /**
   * Convert token amount to fiat (simplified - in production, use real exchange rates)
   */
  convertTokenToFiat(
    tokenAmount: number,
    tokenType: "KAIA" | "USDT" | "USDC"
  ): number {
    // Simplified conversion - in production, use real exchange rates
    const rates = {
      KAIA: 0.1, // 1 KAIA = $0.1 (example rate)
      USDT: 1.0, // 1 USDT = $1.0
      USDC: 1.0, // 1 USDC = $1.0
    };

    return tokenAmount * rates[tokenType];
  }

  /**
   * Process subscription with token payment
   */
  async processSubscriptionWithTokens(
    tokenAmount: number,
    tokenType: "KAIA" | "USDT" | "USDC",
    payment: Omit<SubscriptionPayment, "amount">
  ): Promise<PaymentResponse> {
    // Convert tokens to fiat
    const fiatAmount = this.convertTokenToFiat(tokenAmount, tokenType);

    // Create payment with fiat amount
    const subscriptionPayment: SubscriptionPayment = {
      ...payment,
      amount: fiatAmount,
    };

    // Process payment via GSUBZ
    return await this.makePayment(subscriptionPayment);
  }
}

export const subscriptionService = new SubscriptionService();
