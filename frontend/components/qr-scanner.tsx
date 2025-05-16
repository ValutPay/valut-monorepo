"use client"

import { useState, useEffect } from "react"
import { QrCode, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QrScannerProps {
  onScan: (data: string) => void
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [hasCamera, setHasCamera] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // Check if camera is available
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => setHasCamera(true))
        .catch(() => setHasCamera(false))
    }
  }, [])

  const startScanning = () => {
    setIsScanning(true)
    // In a real implementation, we would start the camera and QR scanning here
    // For demo purposes, we'll simulate a successful scan after 3 seconds
    setTimeout(() => {
      onScan("upi://pay?pa=shop@upi&pn=Shop&am=0&cu=INR")
    }, 3000)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
        {isScanning ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-green-500 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-gray-500 bg-white/80 px-2 py-1 rounded">Scanning...</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <QrCode size={64} className="text-gray-400" />
            <p className="absolute bottom-4 text-sm text-gray-500">Position QR code in frame</p>
          </div>
        )}
      </div>

      {!isScanning && (
        <Button onClick={startScanning} disabled={!hasCamera} className="flex items-center gap-2">
          <Camera size={18} />
          {hasCamera ? "Start Scanning" : "Camera not available"}
        </Button>
      )}
    </div>
  )
} 