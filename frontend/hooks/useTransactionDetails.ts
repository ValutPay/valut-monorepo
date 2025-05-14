"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export interface TransactionDetails {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  recipientId: string;
  recipientName: string;
  description: string;
  type: 'inflow' | 'outflow';
  category: string;
  date: { seconds: number; nanoseconds: number };
  status: 'completed' | 'pending' | 'failed';
  formattedAmount?: string;
  formattedDate?: string;
}

export function useTransactionDetails(transactionId: string | null | undefined) {
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        setLoading(false);
        return;
      }
      
      try {
        const transactionDoc = await getDoc(doc(db, "transactions", transactionId));
        
        if (transactionDoc.exists()) {
          const data = { id: transactionDoc.id, ...transactionDoc.data() } as TransactionDetails;
          
          // Format date for display
          if (data.date) {
            const dateObj = new Date(data.date.seconds * 1000);
            data.formattedDate = new Intl.DateTimeFormat('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(dateObj);
          }
          
          // Format amount with proper currency symbol
          if (data.amount) {
            const currencySymbol = data.currency === 'INR' ? '₹' : 
                                   data.currency === 'USDT' ? 'USDT ' : 
                                   '$';
            
            const formattedAmount = `${currencySymbol}${data.amount.toLocaleString(
              data.currency === 'INR' ? 'en-IN' : 'en-US', 
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`;
            
            data.formattedAmount = data.type === 'outflow' ? `-${formattedAmount}` : formattedAmount;
          }
          
          setTransaction(data);
        } else {
          setError("Transaction not found");
        }
      } catch (err: any) {
        console.error("Error fetching transaction:", err);
        setError(err.message || "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransaction();
  }, [transactionId]);

  return {
    transaction,
    loading,
    error
  };
}
