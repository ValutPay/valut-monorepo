/**
 * Configuration for supported chains and their respective settings
 */

export interface ChainConfig {
  name: string;
  scanApiUrl: string;
  scanApiKey: string; // In production, use environment variables for all API keys
  valutContractAddress: string;
  erc20Tokens: {
    [tokenAddress: string]: {
      name: string;
      symbol: string;
      decimals: number;
    }
  };
}

export const CHAINS: { [chainId: string]: ChainConfig } = {
  // Base chain (chainId: 8453)
  "8453": {
    name: "Base",
    scanApiUrl: "https://api.etherscan.io/v2/api",
    scanApiKey: process.env.ETHERSCAN_API_KEY || "", // Replace with your BaseScan API key from environment variables
    valutContractAddress: "0xcdC71521aB58A3F67A9894d7083Cd3AA523c5072", // Replace with actual Valut contract address on Base
    erc20Tokens: {
      // Example tokens on Base - replace with actual tokens you want to track
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6
      }
    }
  },
  // Add more chains as needed following the same pattern
};

// Default number of blocks to query in a single request
export const DEFAULT_BLOCK_RANGE = 5000;

// Default number of results per page
export const DEFAULT_RESULTS_PER_PAGE = 100;
