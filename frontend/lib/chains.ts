/**
 * Frontend configuration for supported chains and their respective settings
 */

export interface ChainConfig {
  name: string;
  valutContractAddress: string;
  erc20Tokens: {
    [tokenAddress: string]: {
      name: string;
      symbol: string;
      decimals: number;
    }
  };
  explorerUrl: string;
}

export const CHAINS: { [chainId: string]: ChainConfig } = {
  // Base chain (chainId: 8453)
  "8453": {
    name: "Base",
    valutContractAddress: "0xcdC71521aB58A3F67A9894d7083Cd3AA523c5072", 
    erc20Tokens: {
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6
      }
    },
    explorerUrl: "https://basescan.org"
  },
  // For testing purposes - Base Sepolia Testnet
  "84532": {
    name: "Base Sepolia",
    valutContractAddress: "0xTestContractAddressForBaseSepolia", // Replace with actual testnet contract address
    erc20Tokens: {
      "0xTestUSDCAddressForBaseSepolia": {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6
      }
    },
    explorerUrl: "https://sepolia.basescan.org"
  }
};

// Helper functions
export function getChainById(chainId: string): ChainConfig | undefined {
  return CHAINS[chainId];
}

export function getTokenByAddress(chainId: string, tokenAddress: string) {
  const chain = CHAINS[chainId];
  return chain?.erc20Tokens[tokenAddress];
}
