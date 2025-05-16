"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, PowerOff, CheckCircle2, RefreshCcw, WalletIcon, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { CHAINS } from "@/functions/functions/src/config/chains"
import { useAuth } from "@/contexts/auth-context"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { OnchainProviders } from "@/components/onchain-providers"

// Import custom hooks
import { useWalletVerification } from "@/hooks/useWalletVerification"
import { useDeposit } from "@/hooks/useDeposit"
import { useOnchainWallet } from "@/hooks/useOnchainWallet"

export function AddFundsContent() {
  // State for step navigation
  const [selectedChain, setSelectedChain] = useState("8453"); // Default to Base chain
  const [step, setStep] = useState(1); // Track the current step: 1=SelectChain, 2=ConnectWallet, 3=VerifyWallet, 4=Transfer
  const [walletType, setWalletType] = useState<"rainbow" | "onchain">("rainbow"); // Default to RainbowKit
  
  // Custom hooks
  const { toast } = useToast();
  const { user } = useAuth();
  
  // RainbowKit/wagmi hooks
  const { address, isConnected } = useAccount();
  const { error, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  // OnchainKit hooks
  const {
    address: onchainAddress,
    isConnected: isOnchainConnected,
    disconnectWallet: disconnectOnchainWallet
  } = useOnchainWallet();
  
  // Wallet verification hook
  const {
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
    loading,
    success,
    transaction,
    contractAddress,
    usdcTokenAddress,
    transferTokens
  } = useDeposit(selectedChain);
  
  // Handle continue to next step
  const handleContinue = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };
  
  // Get active wallet address based on selected wallet type
  const getActiveWalletAddress = () => {
    return walletType === "rainbow" ? address : onchainAddress;
  };
  
  // Disconnect active wallet based on type
  const disconnectActiveWallet = () => {
    if (walletType === "rainbow") {
      disconnect();
    } else {
      disconnectOnchainWallet();
    }
    
    toast({
      title: "Wallet Disconnected",
      description: "You can reconnect with a different wallet."
    });
  };
  
  // Handle verification
  const handleVerify = async () => {
    const activeAddress = getActiveWalletAddress();
    if (activeAddress) {
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

  // If still processing the transaction (show loading animation)
  if (isPending || loading) {
    return (
      <div className="p-4">
        <header className="flex items-center mb-6">
          <Link href="/" className="text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold ml-4">Processing Transaction</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Processing Your Transaction</CardTitle>
            <CardDescription>Please wait while we process your transaction</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCcw size={24} className="text-primary animate-spin" />
                </div>
                <div className="h-24 w-24 rounded-full border-4 border-t-primary border-r-primary border-b-gray-200 border-l-gray-200 animate-spin"></div>
              </div>
              
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium">Transferring {amount} USDC</p>
                <p className="text-sm text-gray-500">This might take a few moments</p>
              </div>
              
              <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5 mt-4">
                <div className="bg-primary h-2.5 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user completed the transfer successfully
  if (success && transaction) {
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
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-green-600" />
            </div>
            
            <div className="text-green-500 text-xl font-semibold mb-4">
              {amount} USDC has been transferred to Valut
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono font-medium">{transaction.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">Completed</span>
              </div>
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
                <p className="text-sm text-gray-500">Choose a wallet type to connect</p>
                
                <Tabs defaultValue={walletType} onValueChange={(value) => {
                  setWalletType(value as "rainbow" | "onchain");
                }}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="rainbow" className="flex items-center gap-2">
                      <WalletIcon className="h-4 w-4" />
                      Onchain Wallet
                    </TabsTrigger>
                    <TabsTrigger value="onchain" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Smart Wallet
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="rainbow" className="space-y-4 pt-4">
                    {/* Rainbow Kit Connect Button - Opens modal for wallet selection */}
                    <div className="flex justify-center">
                      {isConnectPending && <p className="text-sm text-blue-500 mb-2">Connecting...</p>}
                      <ConnectButton showBalance={false} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="onchain" className="space-y-4 pt-4">
                    {/* OnchainKit Wallet Connect Button */}
                    <div className="flex justify-center">
                      <OnchainProviders>
                        {/* OnchainKit wallet with proper modal for wallet selection */}
                        <ConnectWallet
                          onConnect={() => {
                            toast({
                              title: "Smart Wallet Connected",
                              description: "Your smart wallet is connected successfully."
                            });
                            
                            // Auto-continue to next step when connected
                            setTimeout(() => {
                              handleContinue();
                            }, 500);
                          }}
                          text="Connect Smart Wallet"
                          className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Smart Wallet Connected</span>
                          </div>
                        </ConnectWallet>
                      </OnchainProviders>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Display connected wallet info for either RainbowKit or OnchainKit */}
                {(isConnected || isOnchainConnected) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        {walletType === "rainbow" ? (
                          <span>Connected: {address?.substring(0, 6)}...{address?.substring(address?.length - 4)}</span>
                        ) : (
                          <span>Connected: {onchainAddress?.substring(0, 6)}...{onchainAddress?.substring(onchainAddress?.length - 4)}</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={disconnectActiveWallet}
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
                      <p className="mb-2">If the process doesn&apos;t continue automatically, click the button below:</p>
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
                disabled={isPending || loading || !amount || Number(amount) <= 0 || !usdcTokenAddress}
                className="w-full mt-4"
              >
                {(isPending || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Initializing Transfer..." : loading ? "Processing Transaction..." : "Transfer USDC to Valut"}
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
