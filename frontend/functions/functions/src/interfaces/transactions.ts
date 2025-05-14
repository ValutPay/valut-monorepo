/**
 * Interfaces for ERC20 token transfer transactions and related data
 */

// API response from token transaction query
export interface TokenTransactionApiResponse {
  status: string;
  message: string;
  result: TokenTransaction[];
}

// Single token transaction data
export interface TokenTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

// Processed deposit transaction for storage in Firestore
export interface DepositTransaction {
  blockNumber: number;
  chainId: string;
  timeStamp: number; // Unix timestamp
  hash: string;
  from: string;
  contractAddress: string;
  to: string; // Should match the valut contract address
  value: string;
  valueFormatted: number; // Value formatted according to token decimals
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: number;
  processed: boolean; // Whether this transaction has been processed by the system
  createdAt: FirebaseFirestore.Timestamp;
}

// Last processed block number for each chain
export interface LastProcessedBlock {
  chainId: string;
  blockNumber: number;
  updatedAt: FirebaseFirestore.Timestamp;
}
