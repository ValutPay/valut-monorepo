"use client"

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

type OnchainWalletState = {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
}

/**
 * Custom hook for handling OnchainKit wallet connection
 * Works alongside RainbowKit/wagmi for wallet management
 */
export function useOnchainWallet() {
  const [state, setState] = useState<OnchainWalletState>({
    address: null,
    isConnected: false,
    isConnecting: false
  })
  const { toast } = useToast()

  // Handle wallet connection
  const connectWallet = async () => {
    setState(prev => ({ ...prev, isConnecting: true }))
    
    try {
      // This would be handled by the Wallet component UI
      // We just need to handle the callback state management
      setState(prev => ({ 
        ...prev, 
        isConnecting: false
      }))
    } catch (error: any) {
      console.error('OnchainKit wallet connection error:', error)
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: error?.message || 'Failed to connect OnchainKit wallet'
      })
      setState(prev => ({ ...prev, isConnecting: false }))
    }
  }

  // Handle successful connection
  const handleSuccess = (data: { address: string }) => {
    if (data?.address) {
      setState({
        address: data.address,
        isConnected: true,
        isConnecting: false
      })
      
      toast({
        title: 'Smart Wallet Connected',
        description: 'Your OnchainKit smart wallet is now connected.'
      })
    }
  }

  // Handle wallet disconnection
  const disconnectWallet = () => {
    setState({
      address: null,
      isConnected: false,
      isConnecting: false
    })
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your OnchainKit smart wallet has been disconnected.'
    })
  }

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    handleSuccess
  }
}
