import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useSignMessage, useAccount } from 'wagmi';
import { useAuth } from '@/contexts/auth-context';

export interface WalletVerification {
  uid: string;
  walletAddress: string;
  signature: string;
  signedMessage: string; // The message that was signed
  chainId: string;
  timestamp: string;
  verified: boolean;
  network: string;
  lastUpdated: string;
}

/**
 * Custom hook for wallet verification functionality
 */
export function useWalletVerification(chainId: string) {
  // State variables
  const [isVerifying, setIsVerifying] = useState(false);
  const [isWalletVerified, setIsWalletVerified] = useState(false);
  const [signature, setSignature] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  
  // Hooks
  const { toast } = useToast();
  const { user } = useAuth();
  const { address } = useAccount();

  /**
   * Generate message to sign
   */
  const generateMessage = useCallback(() => {
    const message = `I am verifying my wallet ${address || 'wallet'} for Valut on chain ${chainId} with uid ${user?.uid || 'unknown'} at ${new Date().toISOString()}`;
    return message;
  }, [address, chainId, user?.uid]);

  /**
   * Store signature in Firebase
   */
  const storeSignature = async (
    signatureData: string, 
    address: string,
    message: string
  ): Promise<boolean> => {
    console.log("Starting signature storage process");
    
    if (!user?.uid || !address) {
      console.error("Missing user info for signature storage", { user, address });
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "User information is missing. Please ensure you're logged in."
      });
      return false;
    }
    
    try {
      console.log("Attempting to store signature in Firestore", { 
        uid: user.uid,
        address,
        chainId 
      });
      
      // Verify Firestore instance
      if (!db) {
        throw new Error("Firestore database instance is not available");
      }
      
      // Get network name from chainId
      let networkName = "Unknown";
      try {
        // Try to get the network name from a mapping of chain IDs
        switch (chainId) {
          case "8453":
            networkName = "Base Mainnet";
            break;
          case "84531":
            networkName = "Base Testnet";
            break;
          default:
            networkName = `Chain ID ${chainId}`;
        }
      } catch (error) {
        console.error("Error getting network name:", error);
      }
      
      const now = new Date().toISOString();
      
      // Create comprehensive verification data with all required fields
      const verificationData: WalletVerification = {
        uid: user.uid,
        walletAddress: address,
        signature: signatureData,
        signedMessage: message, // Include the message that was signed
        chainId,
        timestamp: now,
        verified: true,
        network: networkName,
        lastUpdated: now
      };
      
      // Store in Firestore with a more descriptive document ID structure to allow multiple wallets per user
      const docId = `${user.uid}_${address}_${chainId}`;
      
      // Store in both locations for backward compatibility and better querying
      await Promise.all([
        // Store by user ID (backwards compatibility)
        setDoc(doc(db, "wallet_verifications", user.uid), verificationData),
        
        // Store with composite ID for better querying by wallet
        setDoc(doc(db, "wallet_verifications_by_address", docId), verificationData)
      ]);
      
      console.log("Signature stored successfully in multiple locations");
      return true;
    } catch (error: any) {
      console.error("Error storing signature:", error);
      
      // More descriptive error message
      let errorMessage = "Failed to store verification. ";
      
      if (error.code === "permission-denied") {
        errorMessage += "You don't have permission to write to the database.";
      } else if (error.name === "FirebaseError") {
        errorMessage += `Firebase error: ${error.message}`;
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      toast({
        variant: "destructive",
        title: "Storage Error",
        description: errorMessage
      });
      
      return false;
    }
  };

  // Setup sign message hook
  const { signMessage, isPending: isSigningPending, data: signatureData, error: signError } = useSignMessage();
  
  // Handle signature success and store in Firebase
  useEffect(() => {
    const storeSignatureInFirebase = async () => {
      if (!signatureData || !user?.uid || !signedMessage) return;
      
      console.log("Message signed successfully", { data: signatureData.substring(0, 20) + '...' });
      setSignature(signatureData);
      
      try {
        // Store the signature in Firebase
        if (address) {
          const result = await storeSignature(signatureData, address, signedMessage);
          
          if (result) {
            // If storage was successful
            console.log("Signature stored in Firebase");
            setIsWalletVerified(true);
            setIsVerifying(false);
            
            toast({
              title: "Verification Successful",
              description: "Your wallet has been verified and signature stored."
            });
          } else {
            // If storage failed
            console.error("Failed to store signature in Firebase");
            // Still set wallet as verified as a fallback
            setIsWalletVerified(true);
            setIsVerifying(false);
            
            toast({
              title: "Signature Recorded",
              description: "Wallet verified, but there was an issue storing the data."
            });
          }
        } else {
          console.error("No wallet address available for signature storage");
          setIsVerifying(false);
        }
      } catch (error) {
        console.error("Error handling signature:", error);
        setIsVerifying(false);
      }
    };
    
    if (signatureData) {
      storeSignatureInFirebase();
    }
  }, [signatureData, address, user, toast]);
  
  // Handle signature error
  useEffect(() => {
    if (signError) {
      console.error("Signing error:", signError);
      toast({
        variant: "destructive",
        title: "Signing Error",
        description: signError.message,
      });
      setIsVerifying(false);
    }
  }, [signError, toast]);

  /**
   * Check if a wallet address is already verified
   * @returns Object with isVerified flag and userId of the existing verification (if any)
   */
  const checkExistingVerification = useCallback(async (walletAddress: string) => {
    try {
      console.log("Checking existing verification for wallet:", walletAddress);
      
      if (!db) {
        throw new Error("Firestore database instance is not available");
      }
      
      // Query by wallet address
      const walletsRef = collection(db, "wallet_verifications_by_address");
      const q = query(walletsRef, where("walletAddress", "==", walletAddress));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Wallet is already verified
        const doc = querySnapshot.docs[0].data() as WalletVerification;
        return {
          isVerified: true,
          userId: doc.uid,
          chainId: doc.chainId,
          verificationData: doc
        };
      }
      
      return { isVerified: false };
    } catch (error) {
      console.error("Error checking wallet verification:", error);
      return { isVerified: false, error };
    }
  }, []);

  /**
   * Verify wallet by signing a message
   */
  const verifyWallet = useCallback(async () => {
    if (!address || !user?.uid) {
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "Missing wallet address or user information."
      });
      return;
    }

    try {
      setIsVerifying(true);

      // First check if this wallet is already verified
      const existingVerification = await checkExistingVerification(address);
      
      if (existingVerification.isVerified) {
        // Wallet is already verified
        if (existingVerification.userId === user.uid) {
          // Already verified by this same user - just update UI state
          setIsWalletVerified(true);
          setIsVerifying(false);
          toast({
            title: "Already Verified",
            description: "This wallet is already verified for your account."
          });
          return;
        } else {
          // Verified by a different user - warn and halt
          setIsVerifying(false);
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "This wallet address is already verified by another user. Each wallet can only be linked to one user account."
          });
          return;
        }
      }

      // Generate message to sign
      const message = generateMessage();
      setSignedMessage(message); // Store the message to use later
      console.log("Generated verification message", { message });

      // Request signature - this will trigger the useEffect when successful
      signMessage({ message });
    } catch (error: any) {
      console.error("Verification error:", error);
      setIsVerifying(false);
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: error?.message || "An error occurred during verification."
      });
    }
  }, [address, user, generateMessage, signMessage, toast, checkExistingVerification, setIsWalletVerified, setIsVerifying]);

  /**
   * Manually confirm verification (fallback)
   */
  const confirmVerification = useCallback(() => {
    setIsWalletVerified(true);
    toast({
      title: "Wallet Verified",
      description: "Your wallet has been manually verified."
    });
  }, [toast]);

  return {
    isVerifying,
    isWalletVerified,
    signature,
    isSigningPending,
    verifyWallet,
    confirmVerification,
    signedMessage
  };
}
