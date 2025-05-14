"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Share2, Download, ArrowLeft, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTransactionDetails } from "@/hooks"

// Component that uses searchParams needs to be separate
function TransactionSuccessContent() {
  const searchParams = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Get transaction ID from query params
  const transactionId = searchParams.get("id");
  
  // Fallback values in case we can't load from Firebase
  const fallbackAmount = searchParams.get("amount") || "499.00";
  const fallbackRecipient = searchParams.get("recipient") || "shop@upi";
  
  // Use our hook to get transaction details
  const { transaction, loading, error } = useTransactionDetails(transactionId);

  useEffect(() => {
    // Hide confetti effect after 3 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => {
      clearTimeout(confettiTimer);
    };
  }, [])

  return (
    <div className="relative p-6">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  backgroundColor: ['#ff0', '#f0f', '#0ff', '#0f0'][Math.floor(Math.random() * 4)],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <header className="flex items-center mb-8">
        <Link href="/" className="text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-4">Payment Successful</h1>
      </header>

      {loading ? (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-500">Loading transaction details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-5 rounded-md my-8 text-center">
          <p>{error}</p>
          <p className="mt-2 text-sm">Please go back and try again</p>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">
            {transaction && transaction.formattedAmount ? 
              transaction.formattedAmount.replace('-', '') : 
              `₹${fallbackAmount}`}
          </h2>
          <p className="text-gray-500 flex items-center mt-1">
            <Clock size={14} className="mr-1" />
            {transaction?.formattedDate || new Intl.DateTimeFormat('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(new Date())}
          </p>
        </div>
      )}

      {!loading && !error && (
        <Card className="mb-6">
          <div className="p-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment to</span>
              <span className="font-medium">
                {transaction ? transaction.recipientId : fallbackRecipient}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-medium">
                {transaction ? transaction.id : transactionId || "UPID" + Math.random().toString().substring(2, 10)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Payment method</span>
              <span className="font-medium">UPI</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-medium">
                {transaction ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : "Completed"}
              </span>
            </div>
            
            {transaction && transaction.description && (
              <div className="flex justify-between">
                <span className="text-gray-500">Description</span>
                <span className="font-medium">{transaction.description}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="flex-1 py-6">
              <Share2 size={18} className="mr-2" />
              Share
            </Button>
            <Button variant="outline" className="flex-1 py-6">
              <Download size={18} className="mr-2" />
              Download
            </Button>
          </div>

          <Link href="/" className="block w-full">
            <Button className="w-full py-6 bg-gray-800 hover:bg-gray-700">
              Back to Home
            </Button>
          </Link>
        </>
      )}

      <style jsx global>{`
        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 100;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 20px;
          opacity: 0.7;
          animation: fall linear forwards;
        }
        
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(1000px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default function TransactionSuccess() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <span className="ml-2">Loading...</span>
    </div>}>
      <TransactionSuccessContent />
    </Suspense>
  );
}