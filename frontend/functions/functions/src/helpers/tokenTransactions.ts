/**
 * Helper functions for token transactions
 */

import axios from 'axios';
import { CHAINS, DEFAULT_RESULTS_PER_PAGE } from '../config/chains';
import { TokenTransactionApiResponse, TokenTransaction, DepositTransaction } from '../interfaces/transactions';
import * as admin from 'firebase-admin';

/**
 * Fetches ERC20 token transfer events from blockchain explorer API
 * 
 * @param chainId Chain ID to query
 * @param contractAddress ERC20 token contract address (optional)
 * @param walletAddress Valut contract address to filter transactions
 * @param startBlock Starting block number for the query
 * @param endBlock Ending block number for the query
 * @returns API response with token transactions
 */
export async function fetchTokenTransactions(
  chainId: string,
  walletAddress: string,
  startBlock: number,
  endBlock: number,
  contractAddress?: string
): Promise<TokenTransactionApiResponse> {
  const chainConfig = CHAINS[chainId];
  
  if (!chainConfig) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }

  const url = `${chainConfig.scanApiUrl}`;
  
  try {
    const response = await axios.get<TokenTransactionApiResponse>(url, {
      params: {
        module: 'account',
        action: 'tokentx',
        address: walletAddress,
        contractaddress: contractAddress,
        startblock: startBlock,
        endblock: endBlock,
        page: 1,
        offset: DEFAULT_RESULTS_PER_PAGE,
        sort: 'asc',
        apikey: chainConfig.scanApiKey,
        chainid: chainId
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching token transactions for chain ${chainId}:`, error);
    throw error;
  }
}

/**
 * Converts raw token transaction data to DepositTransaction format
 * 
 * @param transaction Token transaction from API
 * @param chainId Chain ID where the transaction occurred
 * @returns Formatted deposit transaction
 */
export function formatDepositTransaction(
  transaction: TokenTransaction,
  chainId: string
): DepositTransaction {
  // Format the token value based on decimals
  const tokenDecimal = parseInt(transaction.tokenDecimal);
  const value = BigInt(transaction.value);
  const divisor = BigInt(10) ** BigInt(tokenDecimal);
  const valueFormatted = Number(value) / Number(divisor);

  return {
    blockNumber: parseInt(transaction.blockNumber),
    chainId,
    timeStamp: parseInt(transaction.timeStamp),
    hash: transaction.hash,
    from: transaction.from.toLowerCase(),
    contractAddress: transaction.contractAddress.toLowerCase(),
    to: transaction.to.toLowerCase(),
    value: transaction.value,
    valueFormatted,
    tokenName: transaction.tokenName,
    tokenSymbol: transaction.tokenSymbol,
    tokenDecimal,
    processed: false,
    createdAt: admin.firestore.Timestamp.now()
  };
}

/**
 * Gets the last processed block number for a specific chain
 * 
 * @param chainId Chain ID to check
 * @returns Last processed block number or 0 if none found
 */
export async function getLastProcessedBlock(
  chainId: string
): Promise<number> {
  try {
    const doc = await admin.firestore()
      .collection('last_processed_blocks')
      .doc(chainId)
      .get();
    
    if (doc.exists) {
      const data = doc.data();
      return data?.blockNumber || 0;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error getting last processed block for chain ${chainId}:`, error);
    return 0;
  }
}

/**
 * Updates the last processed block number for a specific chain
 * 
 * @param chainId Chain ID to update
 * @param blockNumber New last processed block number
 */
export async function updateLastProcessedBlock(
  chainId: string,
  blockNumber: number
): Promise<void> {
  try {
    await admin.firestore()
      .collection('last_processed_blocks')
      .doc(chainId)
      .set({
        chainId,
        blockNumber,
        updatedAt: admin.firestore.Timestamp.now()
      });
  } catch (error) {
    console.error(`Error updating last processed block for chain ${chainId}:`, error);
    throw error;
  }
}
