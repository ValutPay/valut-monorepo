/**
 * Service for handling deposit transactions processing
 */

import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { CHAINS } from '../config/chains';
import { 
  fetchTokenTransactions, 
  formatDepositTransaction, 
  getLastProcessedBlock, 
  updateLastProcessedBlock 
} from '../helpers/tokenTransactions';
import { DepositTransaction } from '../interfaces/transactions';

/**
 * Process ERC20 deposit transactions for a specific chain
 * 
 * @param chainId Chain ID to process transactions for
 * @param currentBlockNumber Current block number to use as endpoint (optional)
 * @returns Count of new deposits processed
 */
export async function processChainDeposits(
  chainId: string,
  currentBlockNumber?: number
): Promise<number> {
  try {
    const chainConfig = CHAINS[chainId];
    
    if (!chainConfig) {
      throw new Error(`Chain ID ${chainId} is not supported`);
    }
    
    // Get the last processed block or start from 0
    const startBlock = await getLastProcessedBlock(chainId);
    
    // If currentBlockNumber is not provided, we can fetch it from the network
    // For this example, we'll just use a high number to get recent transactions
    const endBlock = currentBlockNumber || 999999999;
    
    logger.info(`Processing deposits for chain ${chainId} from block ${startBlock} to ${endBlock}`);
    
    // Fetch token transfer events
    const response = await fetchTokenTransactions(
      chainId,
      chainConfig.valutContractAddress,
      startBlock,
      endBlock
    );
    
    if (response.status !== '1') {
      logger.error(`API Error: ${response.message}`, { chainId });
      return 0;
    }
    
    // No transactions found
    if (!response.result || response.result.length === 0) {
      logger.info(`No new deposits found for chain ${chainId}`);
      // Still update the last processed block to avoid querying the same range again
      if (endBlock > startBlock) {
        await updateLastProcessedBlock(chainId, endBlock);
      }
      return 0;
    }
    
    const db = admin.firestore();
    const batch = db.batch();
    const depositCollection = db.collection('deposit_transactions');
    
    let maxBlockNumber = startBlock;
    let newDepositsCount = 0;
    
    // Filter transactions that are receiving tokens at our contract address
    const deposits = response.result.filter(tx => 
      tx.to.toLowerCase() === chainConfig.valutContractAddress.toLowerCase()
    );
    
    // Process each deposit transaction
    for (const tx of deposits) {
      const blockNumber = parseInt(tx.blockNumber);
      
      // Track the highest block number to update our last processed block
      if (blockNumber > maxBlockNumber) {
        maxBlockNumber = blockNumber;
      }
      
      // Format transaction for storage
      const deposit: DepositTransaction = formatDepositTransaction(tx, chainId);
      
      // Check if this transaction already exists
      const existingDoc = await depositCollection
        .where('chainId', '==', chainId)
        .where('hash', '==', deposit.hash)
        .limit(1)
        .get();
      
      // Only add new transactions
      if (existingDoc.empty) {
        batch.set(depositCollection.doc(), deposit);
        newDepositsCount++;
      }
    }
    
    // Commit all new deposits to Firestore
    if (newDepositsCount > 0) {
      await batch.commit();
      logger.info(`Added ${newDepositsCount} new deposits for chain ${chainId}`);
    }
    
    // Update the last processed block number
    await updateLastProcessedBlock(chainId, maxBlockNumber);
    
    return newDepositsCount;
  } catch (error) {
    logger.error(`Error processing deposits for chain ${chainId}:`, error);
    throw error;
  }
}

/**
 * Process deposits for all configured chains
 * 
 * @returns Object with count of deposits processed per chain
 */
export async function processAllDeposits(): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  
  for (const chainId of Object.keys(CHAINS)) {
    try {
      results[chainId] = await processChainDeposits(chainId);
    } catch (error) {
      logger.error(`Failed to process chain ${chainId}:`, error);
      results[chainId] = 0;
    }
  }
  
  return results;
}
