/**
 * Valut ERC20 Transfer Events Monitoring Functions
 * 
 * This module contains Firebase Functions for monitoring ERC20 transfer events
 * on different blockchain networks and storing deposit transactions in Firestore.
 */

import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { processAllDeposits, processChainDeposits } from './services/depositService';
import { CHAINS } from './config/chains';
import { ScheduledEvent } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Set global region asia-south1
setGlobalOptions({
  region: 'asia-south1'
});

/**
 * Scheduled function that runs every 15 minutes to check for new ERC20 deposits 
 * across all configured chains
 */
export const checkERC20Deposits = onSchedule({
  schedule: 'every 15 minutes',
  timeZone: 'Asia/Kolkata',
  retryCount: 3,
}, async (event: ScheduledEvent) => {
  try {
    logger.info('Starting scheduled ERC20 deposit check', { scheduledTime: event.scheduleTime });
    
    // Process deposits for all configured chains
    const results = await processAllDeposits();
    
    logger.info('ERC20 deposit check completed', { results });
  } catch (error: unknown) {
    logger.error('Error in scheduled ERC20 deposit check:', error);
    throw error;
  }
});

/**
 * HTTP endpoint to manually trigger deposit processing for a specific chain
 * or all chains if no chainId is provided
 */
export const manualCheckDeposits = onRequest(async (request, response) => {
  try {
    const { chainId } = request.query;
    
    if (chainId && typeof chainId === 'string') {
      // Process deposits for a specific chain
      if (!CHAINS[chainId]) {
        response.status(400).json({ error: `Chain ID ${chainId} is not supported` });
        return;
      }
      
      logger.info(`Manually checking deposits for chain ${chainId}`);
      const count = await processChainDeposits(chainId);
      
      response.status(200).json({
        success: true,
        chainId,
        newDeposits: count
      });
      return;
    } else {
      // Process deposits for all configured chains
      logger.info('Manually checking deposits for all chains');
      const results = await processAllDeposits();
      
      response.status(200).json({
        success: true,
        results
      });
      return;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in manual deposit check:', error);
    response.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
