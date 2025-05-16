"use client"

import { useState, useEffect } from 'react'
import { Loader2, SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAccount, useConfig } from 'wagmi'
import { useWalletStats } from '@/components/wallet/WalletStatsProvider'

// Base Sepolia testnet chain ID
const BASE_SEPOLIA_CHAIN_ID = 84532

interface TipTransactionProps {
  recipientAddress: string
  amount: number
  onSuccess: () => void
  onPending: () => void
  username: string
}

export default function TipTransaction({ 
  recipientAddress, 
  amount, 
  onSuccess, 
  onPending,
  username
}: TipTransactionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [finalRecipientAddress, setFinalRecipientAddress] = useState(recipientAddress)
  const { connector } = useAccount()
  const config = useConfig()
  const { updateStats } = useWalletStats()
  
  // Always refresh from the API first to ensure cross-browser compatibility
  useEffect(() => {
    // First, check the API for the most up-to-date wallet address
    fetch(`/api/users/${username}`)
      .then(response => response.json())
      .then(data => {
        if (data.walletAddress) {
          console.log(`Using wallet address for ${username} from API:`, data.walletAddress);
          setFinalRecipientAddress(data.walletAddress);
          
          // Also update localStorage for future use in this browser
          localStorage.setItem(`walletAddress_${username.toLowerCase()}`, data.walletAddress);
        } else {
          console.log(`No wallet address found for ${username} in API`);
          
          // If API doesn't have an address, check localStorage as fallback
          const storedAddress = localStorage.getItem(`walletAddress_${username.toLowerCase()}`);
          if (storedAddress) {
            console.log(`Using wallet address for ${username} from localStorage:`, storedAddress);
            setFinalRecipientAddress(storedAddress);
            
            // Update the API with this address for cross-browser support
            updateServerAddress(storedAddress);
          } else if (recipientAddress) {
            // Last resort: use the address from props
            console.log(`Using wallet address for ${username} from props:`, recipientAddress);
            setFinalRecipientAddress(recipientAddress);
          } else {
            setFinalRecipientAddress('');
          }
        }
      })
      .catch(error => {
        console.error('Error fetching user wallet address:', error);
        // On API error, fall back to localStorage or props
        const storedAddress = localStorage.getItem(`walletAddress_${username.toLowerCase()}`);
        if (storedAddress) {
          setFinalRecipientAddress(storedAddress);
        } else if (recipientAddress) {
          setFinalRecipientAddress(recipientAddress);
        } else {
          setFinalRecipientAddress('');
        }
      });
  }, [username, recipientAddress]);
  
  // Helper function to update the server with an address
  const updateServerAddress = (address: string) => {
    fetch(`/api/users/${username}/walletUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress: address }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Updated server with wallet address:', data);
    })
    .catch(error => {
      console.error('Error updating server wallet address:', error);
    });
  };

  // Helper function to update recipient's wallet stats on the server
  const updateRecipientStats = (amount: number, fromAddress: string) => {
    fetch(`/api/users/${username}/updateStats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, fromAddress }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Updated recipient wallet stats:', data);
    })
    .catch(error => {
      console.error('Error updating recipient wallet stats:', error);
    });
  };
  
  const handleSendTip = async () => {
    // Refresh from the API one more time to ensure we have the latest address
    try {
      const response = await fetch(`/api/users/${username}`);
      const userData = await response.json();
      if (userData.walletAddress) {
        setFinalRecipientAddress(userData.walletAddress);
      }
    } catch (error) {
      console.error('Error fetching latest wallet address:', error);
    }
    
    // Now use the most recent address
    const latestAddress = finalRecipientAddress;
    
    if (!latestAddress || latestAddress === '') {
      toast.error('Invalid recipient address: The streamer has not set up their wallet yet');
      return;
    }
    
    if (!connector) {
      toast.error('Wallet not connected');
      return;
    }
    
    try {
      setIsProcessing(true);
      onPending();
      
      // Additional validation for recipient address
      if (!latestAddress.startsWith('0x') || latestAddress.length !== 42) {
        throw new Error('Invalid recipient wallet address format');
      }
      
      console.log('Sending tip to address:', latestAddress);
      
      // Get the provider from the connector
      const provider = await connector.getProvider() as any;
      
      // Request accounts and get the current account
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });
      
      const fromAddress = accounts[0];
      console.log('Sending from wallet:', fromAddress);
      
      // Convert ETH amount to Wei hex string
      const amountInWei = BigInt(Math.floor(amount * 10**18));
      const valueHex = '0x' + amountInWei.toString(16);
      
      // Check current chain ID and switch to Base Sepolia if needed
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex, 16);
      
      // If not on Base Sepolia, request chain switch
      if (currentChainId !== BASE_SEPOLIA_CHAIN_ID) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16) }],
          });
          console.log('Switched to Base Sepolia testnet');
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to the wallet
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16),
                    chainName: 'Base Sepolia Testnet',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['https://sepolia.base.org'],
                    blockExplorerUrls: ['https://sepolia.basescan.org'],
                  },
                ],
              });
            } catch (addError) {
              throw new Error('Failed to add Base Sepolia network to wallet');
            }
          } else {
            throw new Error('Failed to switch to Base Sepolia network');
          }
        }
      }
      
      // Send the transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: fromAddress,
          to: latestAddress,
          value: valueHex,
          chainId: '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16),
        }],
      });
      
      console.log('Transaction hash:', txHash);
      console.log('Transaction sent to recipient:', latestAddress);
      
      // Update local wallet stats for the current user's session
      updateStats(amount);
      
      // Update recipient wallet stats on the server
      updateRecipientStats(amount, fromAddress);
      
      onSuccess();
      toast.success(`Sent ${amount} ETH tip to ${username}!`);
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleSendTip}
      className="w-full bg-green-500 hover:bg-green-600 text-white py-5 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center"
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <SendHorizontal className="h-5 w-5 mr-2" />
          Send {amount} ETH on Sepolia
        </>
      )}
    </Button>
  );
} 