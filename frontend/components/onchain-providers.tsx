"use client"

import { ReactNode } from 'react'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'viem/chains'

/**
 * OnchainKit providers wrapper component for Base Mainnet
 */
export function OnchainProviders({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base} // Base Mainnet
    >
      {children}
    </OnchainKitProvider>
  )
}
