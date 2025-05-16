import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { Web3Provider } from "@/providers/web3-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Valut App",
  description: "Your crypto wallet and UPI payment solution",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex justify-center min-h-screen bg-gray-100 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl">
            <AuthProvider>
              <Web3Provider>
                {children}
                <Toaster />
              </Web3Provider>
            </AuthProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
