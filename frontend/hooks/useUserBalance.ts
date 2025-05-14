"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "./useAuth";
import { useUserData } from "./useFirestore";

interface UserBalance {
  usdtBalance: number;
  dailyLimit: number;
  spendableToday: number;
  defaultAsset?: string;
  fees?: {
    transfer: number;
    exchange: number;
  };
}

// USDT to INR conversion rate (can be made dynamic later with an API)
const USDT_TO_INR_RATE = 83.5;

export function useUserBalance() {
  const { user } = useAuth();
  const { data, loading, error } = useUserData<UserBalance>("userBalances");
  const [showRupees, setShowRupees] = useState(true);
  const [todaysSpending, setTodaysSpending] = useState(0);
  const [calculating, setCalculating] = useState(true);
  const [defaultAssetState, setDefaultAssetState] = useState<string>("usdt");

  // Calculate INR balance from USDT
  const usdtBalance = data?.usdtBalance || 0;
  const inrBalance = usdtBalance * USDT_TO_INR_RATE;
  const dailyLimit = data?.dailyLimit || 2000;
  
  // Get default asset and fees from data
  const transferFee = data?.fees?.transfer || 0.1; // 0.1% transfer fee
  const exchangeFee = data?.fees?.exchange || 0.5; // 0.5% exchange fee
  
  // Set default asset from Firebase data if available
  useEffect(() => {
    if (data?.defaultAsset) {
      setDefaultAssetState(data.defaultAsset);
    }
  }, [data?.defaultAsset]);
  
  // Calculate today's remaining spending limit
  useEffect(() => {
    if (!user?.uid) {
      setCalculating(false);
      return;
    }
    
    const calculateTodaysSpending = async () => {
      try {
        // Get today's start timestamp (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = Timestamp.fromDate(today);
        
        // Query for today's outflow transactions
        const transactionsRef = collection(db, "transactions");
        const todaysTransactionsQuery = query(
          transactionsRef,
          where("userId", "==", user.uid),
          where("type", "==", "outflow"),
          where("date", ">=", todayTimestamp)
        );
        
        const querySnapshot = await getDocs(todaysTransactionsQuery);
        
        // Sum up today's spending
        let totalSpent = 0;
        querySnapshot.forEach((doc) => {
          const transaction = doc.data();
          if (transaction.amount) {
            totalSpent += transaction.amount;
          }
        });
        
        setTodaysSpending(totalSpent);
        setCalculating(false);
      } catch (err) {
        console.error("Error calculating today's spending:", err);
        setCalculating(false);
      }
    };
    
    calculateTodaysSpending();
  }, [user?.uid]);
  
  // Calculate spendable amount
  const spendableToday = Math.max(0, dailyLimit - todaysSpending);

  // Function to update default asset in Firebase
  const setDefaultAsset = async (asset: string) => {
    if (!user?.uid) return;
    
    try {
      const userBalanceRef = doc(db, "userBalances", user.uid);
      await updateDoc(userBalanceRef, {
        defaultAsset: asset
      });
      setDefaultAssetState(asset);
    } catch (err) {
      console.error("Error updating default asset:", err);
    }
  };

  // Calculate fee amount for a given transaction
  const calculateFee = (amount: number, feeType: 'transfer' | 'exchange' = 'transfer') => {
    const feePercentage = feeType === 'transfer' ? transferFee : exchangeFee;
    return amount * (feePercentage / 100);
  };

  // Default values in case data is not yet loaded
  const balance = {
    usdtBalance,
    inrBalance,
    dailyLimit,
    spendableToday,
    showRupees,
    setShowRupees,
    defaultAsset: defaultAssetState,
    setDefaultAsset,
    transferFee,
    exchangeFee,
    calculateFee,
    formattedBalance: showRupees 
      ? `₹${inrBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : `USDT ${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    formattedUsdtBalance: `USDT ${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    formattedDailyLimit: `₹${dailyLimit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    formattedSpendableToday: `₹${spendableToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    spendablePercentage: Math.min(100, Math.round((spendableToday / (dailyLimit || 1)) * 100)),
    isLoading: loading || calculating,
    error,
    todaysSpending,
    USDT_TO_INR_RATE
  };

  return balance;
}
