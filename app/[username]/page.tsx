"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { toast } from "sonner"
import { Loader2, Coins, Wallet, ArrowRight, Copy, Check, SendHorizontal } from "lucide-react"
import { use } from "react"
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { useAccount, useDisconnect } from 'wagmi'
import { ErrorBoundary } from 'react-error-boundary'
import { 
  Transaction, 
  TransactionButton,
  type LifecycleStatus
} from '@coinbase/onchainkit/transaction'
import TipTransaction from "../components/TipTransaction"

// Define tip amount options
const TIP_AMOUNTS = [
  { value: 0.05, label: "0.05" },
  { value: 0.1, label: "0.1" },
  { value: 0.2, label: "0.2" },
  { value: 0.3, label: "0.3" },
  { value: 0.5, label: "0.5" },
]

// Error fallback component
function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
      <p className="text-red-500 font-medium">Something went wrong with wallet connection:</p>
      <p className="text-sm text-red-400 mb-3">{error.message || 'Unknown error'}</p>
      <Button 
        onClick={resetErrorBoundary}
        variant="outline" 
        className="border-red-200 text-red-500 hover:bg-red-50"
      >
        Try again
      </Button>
    </div>
  )
}

interface UserProfile {
  username: string;
  displayName: string;
  profileImage: string | null;
  bannerColor: string;
  walletAddress?: string;
}

export default function DonationPage({ params }: { params: Promise<{ username: string }> }) {
  // Unwrap the params Promise
  const unwrappedParams = use(params);
  const { username } = unwrappedParams;
  
  // Wallet connection with wagmi
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  // State variables
  const [tipAmount, setTipAmount] = useState(0.2)
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [tipConfirmed, setTipConfirmed] = useState(false)
  const [walletConnecting, setWalletConnecting] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletError, setWalletError] = useState<Error | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [txComplete, setTxComplete] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ownWalletAddress, setOwnWalletAddress] = useState<string | null>(null)
  const [forceDisconnected, setForceDisconnected] = useState(false)

  // Check if the connected wallet matches the streamer's wallet and disconnect if needed
  useEffect(() => {
    // Only run this check if we have both a connected wallet and the user profile
    if (isConnected && address && userProfile?.walletAddress && !forceDisconnected) {
      const connectedAddress = address.toLowerCase();
      const streamerAddress = userProfile.walletAddress.toLowerCase();
      
      // Only disconnect if the connected wallet matches the streamer's wallet
      if (connectedAddress === streamerAddress) {
        console.log("Donation page: Connected wallet matches streamer's wallet. Disconnecting to avoid confusion.");
        disconnect();
        toast.info("Please connect a different wallet for donation", {
          description: "The connected wallet is the same as the streamer's wallet"
        });
      } else {
        console.log("Donation page: Connected wallet is already different from streamer's wallet:", connectedAddress);
      }
      
      // Mark as handled to avoid rechecking
      setForceDisconnected(true);
    }
  }, [isConnected, address, userProfile, disconnect, forceDisconnected]);

  // Load user profile and saved name on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get the currently set username from localStorage
        const currentUserLink = localStorage.getItem('userLink');
        
        // Fetch user data from the API - this should be the source of truth
        const response = await fetch(`/api/users/${username}`)
        
        if (!response.ok) {
          throw new Error('User not found')
        }
        
        const userData = await response.json()
        
        // For cross-browser compatibility, we prioritize the API data
        // If the API returns a wallet address, use that
        if (userData.walletAddress) {
          console.log(`Using wallet address for ${username} from API:`, userData.walletAddress);
          
          // Also update localStorage in this browser for future use
          localStorage.setItem(`walletAddress_${username.toLowerCase()}`, userData.walletAddress);
        } else {
          // If the API doesn't have a wallet address, check localStorage as fallback
          const userSpecificWalletAddress = localStorage.getItem(`walletAddress_${username.toLowerCase()}`);
          
          if (userSpecificWalletAddress) {
            // If localStorage has an address, use it and update the API for cross-browser compatibility
            userData.walletAddress = userSpecificWalletAddress;
            console.log(`Using wallet address for ${username} from localStorage:`, userSpecificWalletAddress);
            
            // Update the API with this address
            updateServerAddress(username, userSpecificWalletAddress);
          } else {
            console.log(`No wallet address found for ${username}`);
          }
        }
        
        // Check if this is the current user's own profile
        if (currentUserLink && currentUserLink.toLowerCase() === username.toLowerCase()) {
          console.log("This is the user's own profile");
          setOwnWalletAddress(userData.walletAddress || null);
        }
        
        setUserProfile(userData)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Could not load user profile')
      } finally {
        setIsLoading(false)
      }
    }
    
    // Helper function to update the server with an address
    const updateServerAddress = (username: string, address: string) => {
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
    
    fetchUserProfile()
    
    // Check if there's a saved name
    const savedName = localStorage.getItem('donorName')
    if (savedName) {
      setName(savedName)
    }
  }, [username])
  
  // Save name to localStorage when changed
  useEffect(() => {
    if (name) {
      localStorage.setItem('donorName', name)
    }
  }, [name])
  
  // Update wallet connection state when wagmi connection changes
  useEffect(() => {
    if (isConnected && address) {
      setWalletConnected(true)
      setWalletConnecting(false)
      setWalletError(null)
    } else {
      setWalletConnected(false)
    }
  }, [isConnected, address])

  // Reset forceDisconnected when wallet address changes so we can recheck
  useEffect(() => {
    // If the wallet is not connected, don't need to check
    if (!isConnected || !address) return;
    
    // Reset the check flag when address changes
    setForceDisconnected(false);
  }, [address, isConnected]);

  const handleTipAmountChange = (amount: number) => {
    setTipAmount(amount)
  }

  const handleConfirmTip = () => {
    setTipConfirmed(true)
    // We don't need to reset forceDisconnected here, 
    // it should only reset if the connected wallet changes
  }

  const handleConnectWallet = () => {
    setWalletConnecting(true)
    // Don't reset forceDisconnected here - we want to maintain the check
    // for whether the wallet is different from the streamer's
  }
  
  const handleSendTransaction = () => {
    setIsSending(true)
    
    // Simulate transaction processing
    setTimeout(() => {
      setIsSending(false)
      setTxComplete(true)
      toast.success(`Sent ${tipAmount} ETH tip to ${username}!`)
    }, 2000)
  }

  const handleCopyAddress = () => {
    // Get the wallet address from userProfile which contains the most up-to-date address
    if (userProfile?.walletAddress) {
      navigator.clipboard.writeText(userProfile.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Create transaction call for sending ETH
  const createTransactionCall = useCallback(() => {
    if (!userProfile?.walletAddress) {
      return []
    }
    
    // Convert ETH amount to Wei (1 ETH = 10^18 Wei)
    const amountInWei = BigInt(Math.floor(tipAmount * 10**18))
    
    // Create a simple ETH transfer call
    return [{
      to: userProfile.walletAddress as `0x${string}`,
      value: amountInWei.toString(),
      data: '0x' as `0x${string}`,
    }]
  }, [tipAmount, userProfile?.walletAddress])
  
  // Handle transaction status updates
  const handleTransactionStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status)
    
    if (status.statusName === 'error') {
      setIsSending(false)
      toast.error('Transaction failed')
    } else if (status.statusName === 'success') {
      setIsSending(false)
      setTxComplete(true)
      toast.success(`Sent ${tipAmount} ETH tip to ${username}!`)
    } else if (status.statusName === 'transactionPending') {
      setIsSending(true)
    }
  }, [tipAmount, username])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error: {error}</div>
          <div>The user "{username}" could not be found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[20%] w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-4xl w-full mx-auto z-10">
        {/* User profile card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mb-8 border border-blue-100/60 transition hover:shadow-lg">
          {/* Header with banner color */}
          <div 
            className="h-28 w-full relative overflow-hidden"
            style={{ 
              backgroundColor: userProfile?.bannerColor || "#1e3a8a",
              backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 50%)"
            }}
          >
            {/* Profile image */}
            <div className="absolute -bottom-8 left-8">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                {userProfile?.profileImage ? (
                  <Image 
                    src={userProfile.profileImage} 
                    alt={username} 
                    width={64} 
                    height={64} 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                    {(userProfile?.displayName || username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-3 right-8">
              <div className="text-sm text-white font-medium px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                Send a tip to
              </div>
            </div>
          </div>
          
          {/* Name section */}
          <div className="pt-10 px-8 pb-5">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {userProfile?.displayName || username}
              </h1>
              <div className="text-gray-500 text-sm ml-2 mt-1">
                @{username}
              </div>
            </div>
          </div>
        </div>
        
        {/* Two-column layout for boxes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Box 1: Tip Amount - Takes 2 columns on md */}
          <div className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-blue-100/60 transition-all hover:shadow-xl">
            <div className="p-6">
              <div className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                <Coins className="h-5 w-5 mr-2 text-blue-500" />
                Tip Amount
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {TIP_AMOUNTS.map((amount) => (
                  <button
                    key={amount.value}
                    className={`px-3 py-2 border rounded-xl text-sm ${
                      tipAmount === amount.value 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-md" 
                        : "bg-white/80 text-gray-800 border-gray-200 hover:bg-blue-50/80 hover:border-blue-200"
                    } transition-all duration-200`}
                    onClick={() => handleTipAmountChange(amount.value)}
                    disabled={tipConfirmed}
                  >
                    <div className="flex items-center justify-center">
                      <span className="mr-1">Ξ</span> {amount.label}
                    </div>
                  </button>
                ))}
                <button
                  className={`px-3 py-2 border rounded-xl text-sm ${
                    !TIP_AMOUNTS.some(a => a.value === tipAmount)
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-md" 
                      : "bg-white/80 text-gray-800 border-gray-200 hover:bg-blue-50/80 hover:border-blue-200"
                  } transition-all duration-200`}
                  onClick={() => {
                    const amount = prompt("Enter custom amount:")
                    if (amount && !isNaN(parseFloat(amount))) {
                      setTipAmount(parseFloat(amount))
                    }
                  }}
                  disabled={tipConfirmed}
                >
                  Custom
                </button>
              </div>
              
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-700 mb-2">Message (optional)</div>
                <Input
                  placeholder="Add a message for the streamer"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
                  disabled={tipConfirmed}
                />
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Your Name</div>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
                  disabled={tipConfirmed}
                />
              </div>
            </div>
          </div>
          
          {/* Box 2: Confirm Tip - Takes 3 columns on md */}
          <div className="md:col-span-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-blue-100/60 transition-all hover:shadow-xl flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              {!tipConfirmed ? (
                <>
                  <div className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <div className="h-5 w-5 flex items-center justify-center rounded-full bg-blue-500 text-white mr-2 text-xs font-bold">1</div>
                    <span>Tip Summary</span>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50/90 to-blue-100/90 rounded-xl border border-blue-200/60 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 text-sm">Amount:</span>
                      <span className="font-medium text-blue-600 bg-white/60 px-3 py-1 rounded-full border border-blue-100">Ξ {tipAmount} Sepolia ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Recipient:</span>
                      <span className="font-medium">{userProfile?.displayName || username}</span>
                    </div>
                    
                    {message && (
                      <div className="mt-3 pt-3 border-t border-blue-200/40">
                        <span className="text-gray-600 text-sm block mb-2">Your message:</span>
                        <span className="text-gray-800 text-sm italic px-3 py-2 bg-white/60 rounded-lg block">{message}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-end mt-6">
                    <Button 
                      onClick={handleConfirmTip}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 rounded-xl transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      Confirm Tip
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <div className="h-5 w-5 flex items-center justify-center rounded-full bg-blue-500 text-white mr-2 text-xs font-bold">2</div>
                    <span>Connect Wallet to Send</span>
                  </div>
                  
                  {/* Wallet error message */}
                  {walletError && (
                    <div className="mb-5 p-4 bg-red-50/90 text-red-600 rounded-xl border border-red-100">
                      <p className="text-sm">{walletError.message || 'Error connecting wallet. Please try again.'}</p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50/90 to-blue-100/90 rounded-xl border border-blue-200/60 flex-1 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 text-sm">Amount:</span>
                      <span className="font-medium text-blue-600 bg-white/60 px-3 py-1 rounded-full border border-blue-100">Ξ {tipAmount} Sepolia ETH</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 text-sm">Recipient:</span>
                      <span className="font-medium">{userProfile?.displayName || username}</span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-blue-200/40">
                      <span className="text-gray-600 text-sm block mb-2">Recipient's Wallet:</span>
                      {userProfile?.walletAddress ? (
                        <div className="flex items-center">
                          <span className="text-gray-800 text-xs font-mono bg-white/80 p-2 rounded-lg border border-gray-200 flex-1 overflow-hidden text-ellipsis">
                            {userProfile.walletAddress}
                          </span>
                          <button 
                            className="ml-2 p-2 bg-white/80 text-gray-500 hover:text-blue-500 rounded-lg border border-gray-200 transition-colors"
                            onClick={handleCopyAddress}
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-yellow-50/90 p-3 rounded-lg border border-yellow-200 text-yellow-700 text-sm">
                          This streamer hasn't set up their wallet address yet.
                        </div>
                      )}
                      {/* Show indicator if using own wallet address */}
                      {ownWalletAddress && userProfile?.walletAddress === ownWalletAddress && (
                        <div className="mt-2 text-xs text-green-600 flex items-center bg-green-50/80 p-2 rounded-lg border border-green-100">
                          <Check className="h-3 w-3 mr-1" />
                          Using your connected wallet from setup
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!walletConnected ? (
                    <ErrorBoundary
                      FallbackComponent={ErrorFallback}
                      onReset={() => setWalletError(null)}
                    >
                      <ConnectWallet className="!border-0 w-full">
                        <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center font-medium">
                          <Wallet className="h-5 w-5 mr-2" />
                          Connect Wallet
                        </div>
                      </ConnectWallet>
                    </ErrorBoundary>
                  ) : (
                    <>
                      <div className="flex items-center text-green-600 bg-green-50/90 p-4 rounded-xl border border-green-100 mb-5">
                        <Check className="h-5 w-5 mr-2" />
                        <span className="font-medium">Wallet connected: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Unknown"}</span>
                      </div>
                      
                      {txComplete ? (
                        <div className="bg-green-50/90 border border-green-100 rounded-xl p-6 text-center">
                          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="h-8 w-8 text-green-500" />
                          </div>
                          <p className="text-green-800 font-medium text-lg">Transaction Complete!</p>
                          <p className="text-green-600 mt-2">Thank you for your tip!</p>
                        </div>
                      ) : (
                        userProfile?.walletAddress ? (
                          <TipTransaction
                            recipientAddress={userProfile.walletAddress}
                            amount={tipAmount}
                            onSuccess={() => {
                              setIsSending(false)
                              setTxComplete(true)
                            }}
                            onPending={() => setIsSending(true)}
                            username={username}
                          />
                        ) : (
                          <div className="bg-yellow-50/90 border border-yellow-200 rounded-xl p-5 text-center">
                            <p className="text-yellow-700 font-medium">This streamer hasn't set up their wallet address yet.</p>
                            <p className="text-yellow-600 text-sm mt-2">Donations cannot be sent until they complete their wallet setup.</p>
                          </div>
                        )
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 