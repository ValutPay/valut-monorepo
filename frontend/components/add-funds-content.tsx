"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, PowerOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { CHAINS } from "@/functions/functions/src/config/chains"
import { useAuth } from "@/contexts/auth-context"
import { ConnectButton } from '@rainbow-me/rainbowkit'

// Import custom hooks
import { useWalletVerification } from "@/hooks/useWalletVerification"
import { useDeposit } from "@/hooks/useDeposit"

export function AddFundsContent() {
  // State for step navigation
  const [selectedChain, setSelectedChain] = useState("8453"); // Default to Base chain
  const [step, setStep] = useState(1); // Track the current step: 1=SelectChain, 2=ConnectWallet, 3=VerifyWallet, 4=Transfer
  
  // Custom hooks
  const { toast } = useToast();
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { connectors, error, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Wallet verification hook
  const {
    isVerifying,
    isWalletVerified,
    signature,
    isSigningPending,
    verifyWallet,
    confirmVerification
  } = useWalletVerification(selectedChain);
  
  // Deposit hook
  const {
    amount,
    setAmount,
    isPending,
    success,
    contractAddress,
    usdcTokenAddress,
    tokenInfo,
    transferTokens
  } = useDeposit(selectedChain);
  
  // Handle continue to next step
  const handleContinue = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };
  
  // Handle verification
  const handleVerify = async () => {
    if (address) {
      await verifyWallet();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet and ensure you're logged in."
      });
    }
  };
  
  // Handle transfer
  const handleTransfer = async () => {
    if (!isWalletVerified) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please verify your wallet first."
      });
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount."
      });
      return;
    }
    
    await transferTokens();
  };

  // If user completed the transfer successfully
  if (success) {
    return (
      <div className="p-4">
        <header className="flex items-center mb-6">
          <Link href="/" className="text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold ml-4">Add Funds</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Successful!</CardTitle>
            <CardDescription>Your funds have been deposited.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="text-green-500 text-xl font-semibold mb-4">
              {amount} USDC has been transferred to Valut
            </div>
            <p className="text-gray-500 mb-4">You can now use these funds in your Valut account.</p>
            <p className="text-gray-500 mb-4">Please note that it may take 5-10 minutes for the funds to reflect in your account.</p>
          </CardContent>
          <div className="flex justify-center p-6 pt-0">
            <Button asChild>
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <header className="flex items-center mb-6">
        <Link href="/" className="text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-4">Add Funds</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>
            {step === 1 && "Select a blockchain network to deposit funds"}
            {step === 2 && "Connect your wallet to continue"}
            {step === 3 && "Verify your wallet ownership"}
            {step === 4 && "Enter the amount and complete your deposit"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Select Chain */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Select Blockchain</h3>
              <div className="space-y-2">
                <Label htmlFor="chain-select">Network</Label>
                <select 
                  id="chain-select"
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="8453">Base Mainnet</option>
                </select>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleContinue} 
                  className="w-full">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Connect Wallet */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Connect your wallet to continue</p>
                
                {/* Rainbow Kit Connect Button - Opens modal for wallet selection */}
                <div className="flex justify-center">
                  {isConnectPending && <p className="text-sm text-blue-500 mb-2">Connecting...</p>}
                  <ConnectButton showBalance={false} />
                </div>
                
                {isConnected && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Connected: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          disconnect();
                          toast({
                            title: "Wallet Disconnected",
                            description: "You can reconnect with a different wallet."
                          });
                        }}
                      >
                        <PowerOff className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleContinue} 
                      className="w-full">
                      Continue
                    </Button>
                  </div>
                )}
                
                {error && <p className="text-red-500 text-sm">{error.message}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Verify Wallet */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Verify Your Wallet</h3>
              <p className="text-sm text-gray-600 mb-4">
                To verify your wallet ownership, you need to sign a message. This helps us ensure the security of your funds.
              </p>
              
              {!isWalletVerified ? (
                <div className="space-y-4">
                  <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200">
                    Message to sign: <br/>
                    <code className="block mt-1 text-xs bg-white p-2 rounded">
                      I am verifying my wallet {address} for Valut on chain {selectedChain} with uid {user?.uid}
                    </code>
                  </p>
                  
                  {signature ? (
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm">
                      <p className="font-medium mb-2">✓ Message signed successfully!</p>
                      <p className="mb-2">If the process doesn't continue automatically, click the button below:</p>
                      <Button 
                        onClick={confirmVerification} 
                        className="w-full"
                        variant="outline"
                      >
                        Confirm Verification Manually
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleVerify} 
                      disabled={isSigningPending || !isConnected || !user}
                      className="w-full"
                    >
                      {isSigningPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSigningPending ? "Verifying..." : "Sign Message to Verify"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm bg-green-50 p-3 rounded-md border border-green-200">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Wallet verified successfully</span>
                  </div>
                  <Button 
                    onClick={handleContinue} 
                    className="w-full">
                    Continue
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Enter Amount and Transfer */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Enter Amount and Transfer</h3>
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span>Network:</span>
                  <span className="font-medium">{CHAINS[selectedChain].name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Contract Address:</span>
                  <span className="font-mono text-xs">{contractAddress.substring(0, 6)}...{contractAddress.substring(contractAddress.length - 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token:</span>
                  <span className="font-medium">USDC</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleTransfer} 
                disabled={isPending || !amount || Number(amount) <= 0 || !usdcTokenAddress}
                className="w-full mt-4"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Transferring..." : "Transfer USDC to Valut"}
              </Button>
              
              <p className="text-xs text-gray-500 mt-2">
                You are transferring USDC to the Valut contract on {CHAINS[selectedChain].name}.
                Make sure you have sufficient USDC in your wallet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
