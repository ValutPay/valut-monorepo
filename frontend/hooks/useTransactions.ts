"use client";

import { useState } from "react";
import { useCollection } from "./useFirestore";
import { orderBy, limit, where, query } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  amountInUsdt?: number;
  currency: string;
  recipientId: string;
  recipientName: string;
  description: string;
  type: 'inflow' | 'outflow';
  category: string;
  icon: string;
  date: Date | { seconds: number; nanoseconds: number };
  status: 'completed' | 'pending' | 'failed';
  formattedAmount?: string;
  formattedDate?: string;
}

export function useTransactions(initialLimit: number = 5) {
  const { user } = useAuth();
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [limitCount, setLimit] = useState<number>(initialLimit);
  const [sortDirection, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Create query constraints
  const queryConstraints = [
    where("userId", "==", user?.uid || "no-user"),
    orderBy("date", sortDirection),
    limit(limitCount)
  ];
  
  // Add type filter if not showing all
  if (transactionFilter !== 'all') {
    queryConstraints.push(where("type", "==", transactionFilter));
  }
  
  const { data, loading, error } = useCollection<Transaction>("transactions", queryConstraints);

  // Format date for display
  const formattedTransactions = data.map(transaction => {
    let dateObj: Date;
    
    if (transaction.date instanceof Date) {
      dateObj = transaction.date;
    } else {
      // Handle Firestore Timestamp
      dateObj = new Date((transaction.date as any).seconds * 1000);
    }
    
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
    
    return {
      ...transaction,
      formattedDate,
      formattedAmount: `${transaction.type === 'outflow' ? '-' : '+'}₹${Math.abs(transaction.amount).toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`
    };
  });

  return {
    transactions: formattedTransactions,
    isLoading: loading,
    error,
    transactionFilter,
    setTransactionFilter,
    setLimit,
    setSortOrder
  };
}
