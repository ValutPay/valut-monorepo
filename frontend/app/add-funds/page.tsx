"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

// Create a loading component for the dynamic import
function LoadingFallback() {
  return (
    <div className="p-4">
      <header className="flex items-center mb-6">
        <Link href="/" className="text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-4">Add Funds</h1>
      </header>
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2">Loading wallet...</span>
      </div>
    </div>
  );
}

// Client-only component with all the wagmi hooks
const AddFundsContent = dynamic(
  () => import('@/components/add-funds-content').then((mod) => mod.AddFundsContent),
  {
    ssr: false,
    loading: () => <LoadingFallback />,
  }
);

// Default export wrapper
export default function AddFunds() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddFundsContent />
    </Suspense>
  );
}