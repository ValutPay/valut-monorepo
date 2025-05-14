"use client";
import { ChevronRight, LogOut, Home as HomeIcon, BarChart4, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useUserBalance } from "@/hooks"
import Link from "next/link"


export default function Home() {

  const { logout, user } = useAuth();
  
  // Get user balance data from Firebase
  const {
    formattedBalance,
    formattedUsdtBalance,
    formattedDailyLimit,
    formattedSpendableToday,
    spendablePercentage,
    showRupees,
    setShowRupees,
    isLoading: balanceLoading
  } = useUserBalance();
  
  // USDT to INR conversion rate from the hook
  const { USDT_TO_INR_RATE, usdtBalance } = useUserBalance();
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="relative p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Valut</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        {/* Balance Toggle */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <p className="text-gray-500 text-sm">Balance</p>
            <button 
              onClick={() => setShowRupees(!showRupees)} 
              className="text-xs px-2 py-1 bg-gray-200 rounded-full"
            >
              {showRupees ? "Show USD" : "Show INR"}
            </button>
          </div>
          {balanceLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading balance...</span>
            </div>
          ) : (
            <h1 className="text-3xl font-bold">{formattedBalance}</h1>
          )}
        </div>

        {/* Deposited USDT */}
        <div className="mb-6 bg-blue-50 p-3 rounded-xl">
          <p className="text-sm text-blue-800">Deposited USDT</p>
          {balanceLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <p className="text-xl font-bold">{formattedUsdtBalance}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/add-funds">
            <Button className="bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-6 w-full">Add funds</Button>
          </Link>
          <Link href="/send-money">
            <Button variant="outline" className="border-gray-300 rounded-xl py-6 w-full">
              Send Money / UPI
            </Button>
          </Link>
        </div>

        {/* Spendable Today */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Spendable today</p>
            {balanceLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
            ) : (
              <p className="text-sm font-medium">{formattedSpendableToday}</p>
            )}
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 transition-all duration-500" 
              style={{ width: `${spendablePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Daily Limit: {formattedDailyLimit}</p>
        </div>

        {/* Greeting */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Welcome Back, {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-sm text-gray-500">Here are your deposited assets and their balances.</p>
          <Link href="/assets" className="text-sm text-gray-500 flex items-center hover:text-blue-600">
            View all assets <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Assets */}
        <div className="space-y-4">
          {balanceLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-2 text-gray-500">Loading assets...</p>
            </div>
          ) : (
            <>
              {/* USDT Asset */}
              <Card className="p-4 border-gray-200 hover:shadow-sm transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-base">💵</span>
                    </div>
                    <div>
                      <p className="font-medium">Tether USD (USDT)</p>
                      <p className="text-xs text-gray-500">Sepolia Network</p>
                      <p className="text-xs text-blue-600 truncate">0x742d35C...8f44e</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formattedUsdtBalance}</p>
                    <p className="text-xs text-gray-500">₹{(USDT_TO_INR_RATE * usdtBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </Card>
              
              {/* Empty USDC Asset */}
              <Card className="p-4 border-gray-200 hover:shadow-sm transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-base">💰</span>
                    </div>
                    <div>
                      <p className="font-medium">USD Coin (USDC)</p>
                      <p className="text-xs text-gray-500">Sepolia Network</p>
                      <p className="text-xs text-blue-600 truncate">0x789...012</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">USDC 0.00</p>
                    <p className="text-xs text-gray-500">₹0.00</p>
                  </div>
                </div>
              </Card>
              
              {/* Empty DAI Asset */}
              <Card className="p-4 border-gray-200 hover:shadow-sm transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-base">🪙</span>
                    </div>
                    <div>
                      <p className="font-medium">Dai Stablecoin (DAI)</p>
                      <p className="text-xs text-gray-500">Sepolia Network</p>
                      <p className="text-xs text-blue-600 truncate">0x345...678</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">DAI 0.00</p>
                    <p className="text-xs text-gray-500">₹0.00</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around max-w-md mx-auto">
          <Link href="/" className="flex-1">
            <Button variant="ghost" className="w-full rounded-xl py-3 font-medium text-gray-500">
              <HomeIcon className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
          <Link href="/assets" className="flex-1">
            <Button variant="ghost" className="w-full rounded-xl py-3 font-medium text-gray-500">
              <BarChart4 className="mr-2 h-5 w-5" />
              Assets
            </Button>
          </Link>
          <Link href="/transactions" className="flex-1">
            <Button variant="ghost" className="w-full rounded-xl py-3 font-medium text-gray-500">
              <ChevronRight className="mr-2 h-5 w-5" />
              History
            </Button>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  )
}
