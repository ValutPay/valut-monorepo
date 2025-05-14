"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import QrScanner from "@/components/qr-scanner"

export default function ScanUPI() {
  const [scanMode, setScanMode] = useState(true)
  const [upiId, setUpiId] = useState("")
  const [amount, setAmount] = useState("")

  const handleQrSuccess = () => {
    // In a real app, we would parse the QR data to extract the UPI ID
    // For demo purposes, we'll just use a hardcoded UPI ID
    setUpiId("shop@upi")
    setScanMode(false)
  }

  const handleManualEntry = () => {
    setScanMode(false)
  }

  return (
    <div>
      {scanMode ? (
        <>
          <header className="p-4 flex items-center">
            <Link href="/" className="text-gray-700">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold ml-4">Scan UPI QR</h1>
          </header>

          <div className="p-4">
            <QrScanner onScan={handleQrSuccess} />

            <div className="mt-6 text-center">
              <p className="text-gray-500 mb-4">Scan any UPI QR code to pay</p>
              <Button variant="outline" onClick={handleManualEntry}>
                Enter UPI ID manually
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <header className="p-4 flex items-center">
            <button onClick={() => setScanMode(true)} className="text-gray-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold ml-4">Send UPI</h1>
          </header>

          <div className="flex flex-col items-center p-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">👨‍🦲</span>
            </div>

            <div className="text-center mb-8">
              <p className="text-lg">{upiId}</p>
            </div>

            <div className="w-full mb-8">
              <p className="text-center text-gray-500 mb-2">Enter amount</p>
              <div className="flex items-center justify-center text-4xl">
                <span className="mr-2">₹</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-4xl border-none text-center w-32 p-0 focus-visible:ring-0"
                  placeholder="0"
                />
              </div>
            </div>

            <Link href={amount ? "/transaction-success" : "#"} className="w-full">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={!amount || Number.parseFloat(amount) <= 0}
              >
                Send
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
} 