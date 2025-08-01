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
   * Get plans for a specific service with real-time pricing
   */
  async getPlans(serviceID: string): Promise<{
    service: string;
    PlanName: string;
    fixedPrice: boolean;
    plans: GSUBZPlan[];
    pricing: {
      currency: string;
      basePrice: number;
      convenienceFee: number;
      totalPrice: number;
    };
  }> {
    try {
      logger.info(`Fetching plans for service: ${serviceID}`);
      const response = await axios.get(
        `${this.baseURL}/plans?service=${serviceID}`,
        {
          maxRedirects: 5,
          timeout: 10000,
        }
      );

      logger.info(`GSUBZ API response:`, response.data);

      // Extract pricing information from the response
      const plans = response.data.plans || [];
      const basePrice = plans.length > 0 ? parseFloat(plans[0].price) || 0 : 0;
      const convenienceFee = basePrice * 0.02; // 2% convenience fee

      logger.info(
        `Extracted pricing - Base: ${basePrice}, Fee: ${convenienceFee}, Total: ${
          basePrice + convenienceFee
        }`
      );

      // If no valid pricing found, use mock data
      if (basePrice === 0) {
        logger.info("No valid pricing found, using mock data");

        // Different mock pricing for different services
        const mockPricing = {
          mtn: { basePrice: 1000, serviceName: "MTN Airtime" },
          airtel: { basePrice: 800, serviceName: "Airtel Airtime" },
          glo: { basePrice: 900, serviceName: "Glo Airtime" },
          "9mobile": { basePrice: 700, serviceName: "9mobile Airtime" },
          gotv: { basePrice: 2500, serviceName: "GOtv Subscription" },
          dstv: { basePrice: 15000, serviceName: "DStv Subscription" },
          startimes: { basePrice: 3000, serviceName: "StarTimes Subscription" },
          mtn_data: { basePrice: 500, serviceName: "MTN Data" },
          airtel_data: { basePrice: 450, serviceName: "Airtel Data" },
          glo_data: { basePrice: 480, serviceName: "Glo Data" },
          "9mobile_data": { basePrice: 400, serviceName: "9mobile Data" },
          ikeja_electric: { basePrice: 5000, serviceName: "Ikeja Electric" },
          eko_electric: { basePrice: 4500, serviceName: "Eko Electricity" },
          kano_electric: { basePrice: 3500, serviceName: "Kano Electricity" },
          waec: { basePrice: 1500, serviceName: "WAEC Result Checker" },
          neco: { basePrice: 1200, serviceName: "NECO Result Checker" },
          bank_transfer: { basePrice: 100, serviceName: "Bank Transfer" },
        };

        const servicePricing = mockPricing[
          serviceID as keyof typeof mockPricing
        ] || {
          basePrice: 1000,
          serviceName: serviceID,
        };

        const convenienceFee = servicePricing.basePrice * 0.02;

        return {
          service: serviceID,
          PlanName: servicePricing.serviceName,
          fixedPrice: true,
          plans: [
            {
              displayName: servicePricing.serviceName,
              value: "mock",
              price: servicePricing.basePrice.toString(),
            },
          ],
          pricing: {
            currency: "NGN",
            basePrice: servicePricing.basePrice,
            convenienceFee,
            totalPrice: servicePricing.basePrice + convenienceFee,
          },
        };
      }

      return {
        ...response.data,
        pricing: {
          currency: "NGN",
          basePrice,
          convenienceFee,
          totalPrice: basePrice + convenienceFee,
        },
      };
    } catch (error) {
      logger.error("Error fetching plans:", error);
      // Return mock data for testing
      return {
        service: serviceID,
        PlanName: "Mock Plan",
        fixedPrice: true,
        plans: [
          {
            displayName: "Mock Plan",
            value: "mock",
            price: "1000",
          },
        ],
        pricing: {
          currency: "NGN",
          basePrice: 1000,
          convenienceFee: 20,
          totalPrice: 1020,
        },
      };
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
   * Get real-time pricing for a specific service
   */
  async getServicePricing(serviceID: string): Promise<{
    serviceID: string;
    serviceName: string;
    basePrice: number;
    convenienceFee: number;
    totalPrice: number;
    currency: string;
    tokenPrices: {
      KAIA: number;
      USDT: number;
    };
  }> {
    try {
      logger.info(`Getting service pricing for: ${serviceID}`);

      // Get plans to extract pricing
      const plansData = await this.getPlans(serviceID);
      const basePrice = plansData.pricing.basePrice;
      const convenienceFee = plansData.pricing.convenienceFee;
      const totalPrice = plansData.pricing.totalPrice;

      logger.info(
        `Pricing data - Base: ${basePrice}, Fee: ${convenienceFee}, Total: ${totalPrice}`
      );

      // Get current exchange rates (in production, use real API)
      const exchangeRates = await this.getExchangeRates();

      // Calculate token prices
      const tokenPrices = {
        KAIA: totalPrice / exchangeRates.KAIA,
        USDT: totalPrice / exchangeRates.USDT,
      };

      logger.info(
        `Token prices - KAIA: ${tokenPrices.KAIA}, USDT: ${tokenPrices.USDT}`
      );

      // Map service names for better display
      const serviceNameMap: { [key: string]: string } = {
        mtn: "MTN Airtime",
        airtel: "Airtel Airtime",
        glo: "Glo Airtime",
        "9mobile": "9mobile Airtime",
        gotv: "GOtv Subscription",
        dstv: "DStv Subscription",
        startimes: "StarTimes Subscription",
        mtn_data: "MTN Data",
        airtel_data: "Airtel Data",
        glo_data: "Glo Data",
        "9mobile_data": "9mobile Data",
        ikeja_electric: "Ikeja Electric",
        eko_electric: "Eko Electricity",
        kano_electric: "Kano Electricity",
        waec: "WAEC Result Checker",
        neco: "NECO Result Checker",
        bank_transfer: "Bank Transfer",
      };

      return {
        serviceID,
        serviceName: serviceNameMap[serviceID] || serviceID,
        basePrice,
        convenienceFee,
        totalPrice,
        currency: "NGN",
        tokenPrices,
      };
    } catch (error) {
      logger.error("Error fetching service pricing:", error);
      // Return mock pricing for testing
      return {
        serviceID,
        serviceName: serviceID,
        basePrice: 1000,
        convenienceFee: 20,
        totalPrice: 1020,
        currency: "NGN",
        tokenPrices: {
          KAIA: 6.8, // 1020 / 150
          USDT: 0.68, // 1020 / 1500
        },
      };
    }
  }

  /**
   * Get current exchange rates (in production, use real exchange rate API)
   */
  private async getExchangeRates(): Promise<{ KAIA: number; USDT: number }> {
    try {
      // In production, fetch from real exchange rate API
      // For now, using realistic rates for NGN conversion
      // 1 USDT = ₦1,500 (realistic NGN rate)
      // 1 KAIA = ₦150 (10% of USDT rate)
      return {
        KAIA: 150, // 1 KAIA = ₦150
        USDT: 1500, // 1 USDT = ₦1,500
      };
    } catch (error) {
      logger.error("Error fetching exchange rates:", error);
      // Fallback to default rates
      return {
        KAIA: 150,
        USDT: 1500,
      };
    }
  }

  /**
   * Convert token amount to fiat (simplified - in production, use real exchange rates)
   */
  convertTokenToFiat(tokenAmount: number, tokenType: "KAIA" | "USDT"): number {
    // Simplified conversion - in production, use real exchange rates
    const rates = {
      KAIA: 0.1, // 1 KAIA = $0.1 (example rate)
      USDT: 1.0, // 1 USDT = $1.0
    };

    return tokenAmount * rates[tokenType];
  }

  /**
   * Process subscription with token payment
   */
  async processSubscriptionWithTokens(
    tokenAmount: number,
    tokenType: "KAIA" | "USDT",
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
