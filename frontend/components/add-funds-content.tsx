"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function AddFundsContent() {
  
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);
  type EthAddress = `0x${string}`;
  const [recipient, setRecipient] = useState<EthAddress>("0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as EthAddress); // Valut wallet address
  
  

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
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>Connect your Web3 wallet on Sepolia testnet to add funds to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

        </CardContent>
        <CardFooter>
          
        </CardFooter>
      </Card>

    </div>
  )
}
