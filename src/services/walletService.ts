import { createPublicClient, http, parseAbiItem } from "viem";
import { Transaction, ITransaction } from "../models/Transaction";

// Define Kaia Sepolia chain config inline
const kaiaSepolia = {
  id: 1001,
  name: "Kaia Sepolia",
  network: "kaia-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Kaia",
    symbol: "KAIA",
  },
  rpcUrls: {
    public: { http: ["https://public-en-kairos.node.kaia.io"] },
    default: { http: ["https://public-en-kairos.node.kaia.io"] },
  },
  blockExplorers: {
    default: {
      name: "Kaia Sepolia Explorer",
      url: "https://kairos.kaiascan.io/",
    },
  },
  testnet: true,
} as const;

export interface WalletBalance {
  token: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  tokenSymbol: string;
  tokenDecimals: number;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  timestamp: Date;
  status: "pending" | "confirmed" | "failed";
}

export class WalletService {
  private static instance: WalletService;
  private client: any;

  private constructor() {
    this.client = createPublicClient({
      chain: kaiaSepolia,
      transport: http(
        process.env.KAIA_RPC_URL || "https://public-en-kairos.node.kaia.io"
      ),
    });
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async getWalletBalance(walletAddress: string): Promise<WalletBalance[]> {
    try {
      // Get native token balance
      const nativeBalance = await this.client.getBalance({
        address: walletAddress as `0x${string}`,
      });

      const balances: WalletBalance[] = [
        {
          token: "0x0000000000000000000000000000000000000000", // Native token
          symbol: "KAIA",
          balance: nativeBalance.toString(),
          decimals: 18,
        },
      ];

      // TODO: Add ERC-20 token balance fetching
      // This would require contract calls to token contracts

      return balances;
    } catch (error) {
      console.log("Failed to get wallet balance:", error);
      throw new Error("Failed to fetch wallet balance");
    }
  }

  async getTransactionHistory(
    walletAddress: string,
    limit: number = 50
  ): Promise<ITransaction[]> {
    try {
      // First check if we have cached transactions
      const cachedTransactions = await Transaction.find({
        walletAddress: walletAddress.toLowerCase(),
      })
        .sort({ timestamp: -1 })
        .limit(limit);

      if (cachedTransactions.length > 0) {
        return cachedTransactions;
      }

      // If no cached data, fetch from blockchain
      const transactions = await this.fetchTransactionsFromBlockchain(
        walletAddress,
        limit
      );

      // Cache the transactions
      if (transactions.length > 0) {
        await Transaction.insertMany(transactions);
      }

      return transactions;
    } catch (error) {
      console.log("Failed to get transaction history:", error);
      throw new Error("Failed to fetch transaction history");
    }
  }

  async syncWalletTransactions(walletAddress: string): Promise<void> {
    try {
      console.log(`Syncing transactions for wallet: ${walletAddress}`);

      // Get the latest block number
      const latestBlock = await this.client.getBlockNumber();

      // Get the last synced block for this wallet
      const lastTransaction = await Transaction.findOne({
        walletAddress: walletAddress.toLowerCase(),
      }).sort({ blockNumber: -1 });

      // Ensure block numbers are bigints
      const fromBlock = lastTransaction
        ? BigInt(lastTransaction.blockNumber + 1)
        : latestBlock - BigInt(1000);

      // Fetch new transactions
      const newTransactions = await this.fetchTransactionsFromBlockchain(
        walletAddress,
        1000,
        fromBlock,
        latestBlock
      );

      if (newTransactions.length > 0) {
        await Transaction.insertMany(newTransactions);
        console.log(
          `Synced ${newTransactions.length} new transactions for ${walletAddress}`
        );
      }
    } catch (error) {
      console.log("Failed to sync wallet transactions:", error);
      throw new Error("Failed to sync transactions");
    }
  }

  private async fetchTransactionsFromBlockchain(
    walletAddress: string,
    limit: number = 50,
    fromBlock?: bigint,
    toBlock?: bigint
  ): Promise<ITransaction[]> {
    try {
      // This is a simplified implementation
      // In production, you'd want to use a more robust method
      // like using a blockchain indexer or multiple RPC calls

      const transactions: ITransaction[] = [];

      // For now, return empty array - implement actual blockchain fetching
      // This would involve:
      // 1. Getting transaction receipts
      // 2. Parsing transaction data
      // 3. Categorizing transactions
      // 4. Handling different token types

      return transactions;
    } catch (error) {
      console.log("Failed to fetch transactions from blockchain:", error);
      throw new Error("Failed to fetch blockchain transactions");
    }
  }

  async categorizeTransaction(transaction: ITransaction): Promise<string> {
    // Simple categorization logic
    const { to, value, tokenSymbol } = transaction;

    // DeFi protocols (simplified)
    const defiProtocols = [
      "dragonswap",
      "kaiaswap",
      "kaia-lending",
      "uniswap",
      "sushiswap",
    ];

    // Check if transaction is to a known DeFi protocol
    if (defiProtocols.some((protocol) => to.toLowerCase().includes(protocol))) {
      return "defi";
    }

    // Check for common patterns
    if (tokenSymbol === "USDT" || tokenSymbol === "USDC") {
      return "stablecoin";
    }

    if (tokenSymbol === "KAIA") {
      return "native";
    }

    // Default categorization
    return "transfer";
  }

  async getTransactionInsights(walletAddress: string): Promise<any> {
    try {
      const transactions = await this.getTransactionHistory(walletAddress, 100);

      const insights = {
        totalTransactions: transactions.length,
        totalVolume: 0,
        averageTransactionValue: 0,
        mostUsedToken: "",
        spendingPattern: "stable",
        savingsRate: 0,
        categories: {} as Record<string, number>,
      };

      if (transactions.length === 0) {
        return insights;
      }

      // Calculate insights
      let totalVolume = 0;
      const tokenCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      for (const tx of transactions) {
        const value = parseFloat(tx.value);
        totalVolume += value;

        // Count tokens
        tokenCounts[tx.tokenSymbol] = (tokenCounts[tx.tokenSymbol] || 0) + 1;

        // Count categories
        const category = await this.categorizeTransaction(tx);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }

      insights.totalVolume = totalVolume;
      insights.averageTransactionValue = totalVolume / transactions.length;
      insights.mostUsedToken = Object.keys(tokenCounts).reduce((a, b) =>
        tokenCounts[a] > tokenCounts[b] ? a : b
      );
      insights.categories = categoryCounts;

      return insights;
    } catch (error) {
      console.log("Failed to get transaction insights:", error);
      throw new Error("Failed to analyze transaction insights");
    }
  }
}

export const walletService = WalletService.getInstance();
