"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, addDoc, collection, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "./useAuth";
import { useUserBalance } from "./useUserBalance";

interface UpiPaymentData {
  recipientId: string;
  amount: number;
  description?: string;
}

export function useUpiPayment() {
  const router = useRouter();
  const { user } = useAuth();
  const { inrBalance, usdtBalance, spendableToday, USDT_TO_INR_RATE } = useUserBalance();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  
  // Function to parse QR code data
  const parseQrCode = (data: string) => {
    try {
      // Parse UPI URL format: upi://pay?pa=upiid&pn=name&am=amount
      const url = new URL(data);
      
      if (url.protocol === "upi:") {
        const params = new URLSearchParams(url.search);
        const pa = params.get("pa"); // Payee address (UPI ID)
        const am = params.get("am"); // Amount
        const pn = params.get("pn"); // Payee name
        
        return {
          recipientId: pa || "",
          amount: am ? parseFloat(am) : 0,
          description: pn ? `Payment to ${pn}` : ""
        };
      }
      return null;
    } catch (err) {
      console.error("Error parsing QR code:", err);
      return null;
    }
  };
  
  // Process payment
  const processPayment = async (paymentData: UpiPaymentData) => {
    const { recipientId, amount, description } = paymentData;
    
    // Reset state
    setError("");
    
    // Validate input
    if (!recipientId) {
      setError("Please enter a UPI ID");
      return { success: false, error: "Please enter a UPI ID" };
    }
    
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return { success: false, error: "Please enter a valid amount" };
    }
    
    // Convert INR amount to USDT for validation and storage
    const amountInUsdt = amount / USDT_TO_INR_RATE;
    
    if (amount > inrBalance) {
      setError("Insufficient balance");
      return { success: false, error: "Insufficient balance" };
    }
    
    setIsProcessing(true);
    
    try {
      // 1. Add transaction to Firestore
      const transactionRef = await addDoc(collection(db, "transactions"), {
        userId: user?.uid,
        amount: amount,             // Store original INR amount for display
        amountInUsdt: amountInUsdt, // Also store USDT equivalent
        currency: "INR",
        recipientId: recipientId,
        recipientName: recipientId.split("@")[0] || "Unknown",
        description: description || `Payment to ${recipientId}`,
        type: "outflow",
        category: "transfer",
        date: serverTimestamp(),
        status: "completed",
        icon: "💰"
      });
      
      // 2. Update user balance (only update USDT balance)
      const userBalanceRef = doc(db, "userBalances", user?.uid as string);
      await updateDoc(userBalanceRef, {
        usdtBalance: usdtBalance - amountInUsdt
        // No need to update spendableToday as it's calculated dynamically now
      });
      
      // Success - return transaction ID
      return { success: true, transactionId: transactionRef.id };
    } catch (err: any) {
      console.error("Error processing payment:", err);
      setError(err.message || "Failed to process payment. Please try again.");
      return { success: false, error: err.message || "Failed to process payment" };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    processPayment,
    parseQrCode,
    isProcessing,
    error,
    setError
  };
}
