"use client"

import { ReactNode } from 'react'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'viem/chains'

/**
 * OnchainKit providers wrapper component for Base Mainnet with Wallet Modal configuration
 */
export function OnchainProviders({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base} // Base Mainnet
      config={{
        appearance: {
          name: 'ValutPay',
          mode: 'auto',
          theme: 'default',
        },
        wallet: { 
          display: 'modal',
          termsUrl: 'https://www.valutpay.com/terms', 
          privacyUrl: 'https://www.valutpay.com/privacy',
          supportedWallets: {
            rabby: true,
            trust: true,
            frame: true
          }
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  )
}
