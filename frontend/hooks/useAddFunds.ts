"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "./useAuth";
import { useUserBalance } from "./useUserBalance";

export function useAddFunds() {
  const router = useRouter();
  const { user } = useAuth();
  const { usdtBalance, USDT_TO_INR_RATE } = useUserBalance();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  
  const addFunds = async (amountUsdt: number) => {
    if (!amountUsdt || amountUsdt <= 0) {
      setError("Please enter a valid amount");
      return { success: false, error: "Please enter a valid amount" };
    }
    
    // Convert USDT to INR for display purposes
    const amountInr = amountUsdt * USDT_TO_INR_RATE;
    
    setIsProcessing(true);
    setError("");
    
    try {
      // 1. Add transaction record to Firestore
      const transactionRef = await addDoc(collection(db, "transactions"), {
        userId: user?.uid,
        amount: amountInr,
        amountInUsdt: amountUsdt,
        currency: "USDT",
        recipientId: "DEPOSIT",
        recipientName: "Web3 Wallet Deposit",
        description: "Added USDT from connected wallet",
        type: "inflow",
        category: "deposit",
        date: serverTimestamp(),
        status: "completed",
        icon: "💵"
      });
      
      // 2. Update user's balance
      const userBalanceRef = doc(db, "userBalances", user?.uid as string);
      await updateDoc(userBalanceRef, {
        usdtBalance: usdtBalance + amountUsdt
      });
      
      // Success - return transaction ID
      return { 
        success: true, 
        transactionId: transactionRef.id,
        amount: amountInr,
        amountInUsdt: amountUsdt
      };
    } catch (err: any) {
      console.error("Error adding funds:", err);
      setError(err.message || "Failed to add funds. Please try again.");
      return { success: false, error: err.message || "Failed to add funds" };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    addFunds,
    isProcessing,
    error,
    setError
  };
}
