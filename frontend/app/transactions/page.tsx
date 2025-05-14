"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/hooks";

function TransactionsContent() {
  // States for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit] = useState(20);

  // Get transactions with the current filters
  const { 
    transactions, 
    isLoading, 
    error,
    setTransactionFilter, 
    setLimit: setTransactionLimit,
    setSortOrder: setTransactionSortOrder
  } = useTransactions(limit);

  // Update filters in the hook
  const handleTypeChange = (value: string) => {
    const type = value as 'all' | 'inflow' | 'outflow';
    setTypeFilter(type);
    setTransactionFilter(type);
  };

  const handleSortChange = (value: string) => {
    const order = value as 'asc' | 'desc';
    setSortOrder(order);
    setTransactionSortOrder(order);
  };

  // Filter transactions by search term (client-side filtering)
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      transaction.description.toLowerCase().includes(term) ||
      transaction.recipientId.toLowerCase().includes(term) ||
      transaction.recipientName.toLowerCase().includes(term) ||
      transaction.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/" className="text-gray-700 mr-2">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">Transaction History</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Download size={20} className="text-gray-600" />
        </Button>
      </header>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="inflow">Income</SelectItem>
              <SelectItem value="outflow">Expenses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-gray-500">Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading transactions: {error.message}</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No transactions found</p>
          {searchTerm && (
            <Button 
              variant="link" 
              onClick={() => setSearchTerm("")}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTransactions.map((transaction) => {
            // Determine icon and background color based on transaction category
            const iconMap: Record<string, { icon: string, bgColor: string, textColor: string }> = {
              'transfer': { icon: '💰', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
              'shopping': { icon: '🛒', bgColor: 'bg-green-100', textColor: 'text-green-600' },
              'recharge': { icon: '📱', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
              'food': { icon: '🍔', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
              'travel': { icon: '✈️', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
              'entertainment': { icon: '🎬', bgColor: 'bg-pink-100', textColor: 'text-pink-600' },
              'deposit': { icon: '💵', bgColor: 'bg-green-100', textColor: 'text-green-600' },
            };
            
            const { icon, bgColor, textColor } = 
              iconMap[transaction.category] || 
              { icon: '💵', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };

            return (
              <Link href={`/transaction-success?id=${transaction.id}`} key={transaction.id} >
                <Card className="p-5 border-gray-200 hover:shadow-md transition-shadow duration-200 hover:border-blue-200 mt-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 flex-shrink-1 max-w-[70%]">
                      <div className={`w-12 h-12 flex-shrink-0 ${bgColor} rounded-full flex items-center justify-center shadow-sm`}>
                        <span className={`${textColor} text-lg`}>{icon}</span>
                      </div>
                      <div className="overflow-hidden space-y-1">
                        <p className="font-medium truncate text-base">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.formattedDate}</p>
                        <p className="text-xs text-blue-600 truncate">{transaction.recipientId}</p>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : transaction.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-red-100 text-red-700'}`}>
                            {transaction.status === 'completed' 
                              ? 'Completed' 
                              : transaction.status === 'pending' 
                                ? 'Pending' 
                                : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 min-w-[90px] text-right">
                      <p className={`font-medium whitespace-nowrap text-base ${transaction.type === 'inflow' ? 'text-green-600' : 'text-gray-900'}`}>
                        {transaction.formattedAmount}
                      </p>
                      {transaction.currency === 'USDT' && (
                        <p className="text-xs text-gray-500 mt-1">
                          USDT {transaction.amountInUsdt?.toFixed(2) || '0.00'}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}

          {filteredTransactions.length >= limit && (
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => {
                const newLimit = limit + 10;
                setLimit(newLimit);
                setTransactionLimit(newLimit);
              }}
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-gray-500">Loading transactions...</p>
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  );
}
