"use client";
export const dynamic = 'force-dynamic';

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, Scan, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserBalance, useUpiPayment } from "@/hooks";

// Component that uses searchParams needs to be separate
function SendMoneyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    inrBalance, 
    defaultAsset, 
    USDT_TO_INR_RATE 
  } = useUserBalance();
  const { processPayment, parseQrCode, isProcessing, error, setError } = useUpiPayment();
  
  // Get initial values from search params if available
  const initialRecipientId = searchParams.get("upi") || "";
  const initialAmount = searchParams.get("amount") || "";
  
  const [recipientId, setRecipientId] = useState(initialRecipientId);
  const [amount, setAmount] = useState(initialAmount);
  const [description, setDescription] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start QR code scanner
  const startScanner = async () => {
    setIsScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Set up scanning interval
        const scanInterval = setInterval(() => {
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext('2d');
            
            if (context && video.videoWidth > 0) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
                            // Here you would normally use a QR code library like jsQR
              // For now, we'll just simulate a QR code detection after 3 seconds
              setTimeout(() => {
                stopScanner();
                handleQrCodeScan("upi://pay?pa=spapinwar@okhdfcbank&pn=Example%20Merchant&am=30.00");
              }, 3000);
            }
          }
        }, 500);
        
        // Ensure the interval is cleaned up
        return () => clearInterval(scanInterval); 
      }
    } catch (err) { 
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please enable camera permissions or enter UPI ID manually.");
      setIsScanning(false);
    }
  };
  
  // Stop QR code scanner
  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };
  
  // Handle QR code scan
  const handleQrCodeScan = (data: string) => {
    try {
      const parsedData = parseQrCode(data);
      if (parsedData) {
        setRecipientId(parsedData.recipientId);
        if (parsedData.amount) setAmount(parsedData.amount.toString());
        if (parsedData.description) setDescription(parsedData.description);
      } else {
        setError("Invalid QR code. Please try again or enter details manually.");
      }
    } catch (err) {
      console.error("Error handling QR code:", err);
      setError("Invalid QR code. Please try again or enter details manually.");
    }
  };
  
  // Handle payment submission
  const handlePaymentSubmit = async () => {
    // Call the hook function
    const result = await processPayment({
      recipientId,
      amount: parseFloat(amount),
      description
    });
    
    if (result.success) {
      // Redirect to success page
      router.push(
        `/transaction-success?id=${result.transactionId}&amount=${amount}&recipient=${encodeURIComponent(recipientId)}`
      );
    }
    // Error is already handled by the hook
  };

  return (
    <div className="relative p-6">
      <header className="flex items-center mb-6">
        <Link href="/" className="text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-4">Send Money</h1>
      </header>
      
      {isScanning ? (
        <div className="relative mb-6">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-blue-500">
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white rounded-lg opacity-60"></div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="mt-4 flex justify-center">
            <Button onClick={stopScanner} variant="destructive">
              <X className="mr-2" size={18} />
              Stop Scan
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="upi">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upi">Enter UPI ID</TabsTrigger>
              <TabsTrigger value="scan" onClick={startScanner}>
                <Scan className="mr-2" size={16} />
                Scan QR
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upi">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upi-id">Recipient UPI ID</Label>
                    <Input 
                      id="upi-id" 
                      placeholder="e.g., user@bank"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (INR)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="₹0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input 
                      id="description" 
                      placeholder="e.g., Dinner payment"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="scan">
              {/* Scanner UI is handled above outside the tabs */}
              <div className="text-center text-gray-500 py-8">
                Click &quot;Scan QR&quot; tab to start scanning.
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <Card className="bg-gray-50">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Balance</span>
                <span className="font-medium text-sm">
                  ₹{inrBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Default Asset</span>
                <span className="font-medium text-sm bg-blue-50 px-2 py-1 rounded">
                  {defaultAsset?.toUpperCase() || 'USDT'}
                </span>
              </div>
              {amount && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transfer Fee (1%)</span>
                    <span className="font-medium text-sm text-gray-600">
                      ₹{((parseFloat(amount) || 0) * 0.01).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">USDT Equivalent</span>
                    <span className="font-medium text-sm text-gray-600">
                      USDT {((parseFloat(amount) || 0) / USDT_TO_INR_RATE).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount (with fee)</span>
                    <span className="font-medium text-sm text-blue-600">
                      ₹{((parseFloat(amount) || 0) * 1.01).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Button 
            onClick={handlePaymentSubmit} 
            disabled={isProcessing || !recipientId || !amount} 
            className="w-full py-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Send className="mr-2" size={18} />
                Send Money
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SendMoney() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendMoneyContent />
    </Suspense>
  );
}
