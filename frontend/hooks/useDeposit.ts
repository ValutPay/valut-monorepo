import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CHAINS } from '@/lib/chains';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface TransactionResponse {
  transactionId: string;
  amount: string;
  chainId: string;
  address: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

/**
 * Custom hook for handling deposit and transfer functionality
 */
export function useDeposit(chainId: string) {
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const { toast } = useToast();

  // Get contract address based on selected chain
  const contractAddress = CHAINS[chainId]?.valutContractAddress || '';
  
  // Get USDC token address and info based on selected chain
  const usdcTokenAddress = Object.keys(CHAINS[chainId]?.erc20Tokens || {}).find(
    address => CHAINS[chainId]?.erc20Tokens[address]?.symbol === 'USDC'
  ) || '';
  
  const tokenInfo: TokenInfo | null = usdcTokenAddress ? {
    address: usdcTokenAddress,
    ...CHAINS[chainId].erc20Tokens[usdcTokenAddress]
  } : null;

  // Setup contract write hook
  const { writeContract, isPending, isSuccess } = useWriteContract();

  // Handle success and error with useEffect
  useEffect(() => {
    if (isSuccess) {
      // Simulate API call to process transaction after blockchain transfer
      simulateTransactionProcessing();
    }
  }, [isSuccess, toast]);
  
  /**
   * Simulate transaction processing with the server
   */
  const simulateTransactionProcessing = async () => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000) + 3000));
      
      // Create transaction response with fixed ID
      const txnResponse: TransactionResponse = {
        transactionId: 'LYPDL5M7K4V3GP1',
        amount,
        chainId,
        address: contractAddress,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      setTransaction(txnResponse);
      setSuccess(true);
      
      toast({
        title: 'Transfer Successful',
        description: 'Your funds have been transferred to the Valut contract.'
      });
    } catch (error) {
      console.error('Transaction processing error:', error);
      toast({
        variant: 'destructive',
        title: 'Processing Error',
        description: 'There was an error processing your transaction.'
      });
    } finally {
      setLoading(false);
      setIsTransferring(false);
    }
  };

  /**
   * Transfer tokens to the contract
   */
  const transferTokens = async () => {
    if (!tokenInfo || !contractAddress) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Token or contract address is not configured correctly.'
      });
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.'
      });
      return;
    }
    
    setIsTransferring(true);
    
    try {
      const amountInWei = parseUnits(amount, tokenInfo.decimals);
      
      // Transfer USDC to contract
      try {
        await writeContract({
          address: tokenInfo.address as `0x${string}`,
          abi: [{
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
            outputs: [{ name: '', type: 'bool' }],
          }],
          functionName: 'transfer',
          args: [contractAddress as `0x${string}`, amountInWei]
        });
      } catch (error: any) {
        console.error('Transfer error:', error);
        toast({
          variant: 'destructive',
          title: 'Transfer Error',
          description: error?.message || 'Failed to initiate transfer.'
        });
        setIsTransferring(false);
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      setIsTransferring(false);
      toast({
        variant: 'destructive',
        title: 'Transfer Error',
        description: 'Failed to initiate transfer.'
      });
    }
  };

  return {
    amount,
    setAmount,
    isTransferring,
    isPending,
    loading,
    success,
    transaction,
    contractAddress,
    usdcTokenAddress,
    tokenInfo,
    transferTokens
  };
}
