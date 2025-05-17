"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Wallet, Check, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { useAccount, useConnect } from 'wagmi'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { env } from "@/lib/env"

// Error fallback component
function ErrorFallback({error, resetErrorBoundary}: FallbackProps) {
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

export default function WalletStep() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { address, isConnected } = useAccount()
  const { error: connectError } = useConnect()
  const [isValid, setIsValid] = useState(false)
  const [walletError, setWalletError] = useState<Error | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  
  // If not authenticated, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Load the current username from localStorage when the component mounts
  useEffect(() => {
    const username = localStorage.getItem('userLink');
    setCurrentUsername(username);
    
    // Clear any previously stored wallet address for this username
    // This ensures we don't reuse addresses from previous sessions
    if (username) {
      // We don't clear localStorage here to allow the user to use the same wallet if they want
      // But we make sure the API is updated with the new connection when the user proceeds
      console.log('Current username:', username);
    }
  }, []);

  // Update validation when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      setIsValid(true)
      setWalletError(null)
    } else {
      setIsValid(false)
    }
  }, [isConnected, address])

  // Handle wallet connection errors
  useEffect(() => {
    if (connectError) {
      setWalletError(connectError as Error)
    }
  }, [connectError])

  // Handle unhandled promise rejections globally
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent the error from bubbling up
      event.preventDefault()
      
      // Log the error for debugging
      console.error('Unhandled rejection (caught):', event.reason)
      
      // Set a user-friendly error message
      setWalletError(new Error('Wallet connection failed. Please try again.'))
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleNext = () => {
    if (isValid && currentUsername) {
      setLoading(true)
      try {
        // Save wallet address to localStorage
        if (address) {
          // Get the user's chosen username
          const username = currentUsername;
          
          // Save the wallet address in localStorage - specific to this username
          localStorage.setItem(`walletAddress_${username.toLowerCase()}`, address);
          
          // Set username-specific cookie for server components
          document.cookie = `walletAddress_${username.toLowerCase()}=${address}; path=/; max-age=31536000; SameSite=Strict`;
          
          // Also update the backend mockUsers data through the API
          fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/users/${username}/walletUpdate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: address }),
          })
          .then(response => response.json())
          .then(data => {
            console.log('Wallet address updated in mockUsers:', data);
            
            // Now we also set the general wallet address, but only after the user-specific one is saved
            localStorage.setItem('walletAddress', address);
            document.cookie = `walletAddress=${address}; path=/; max-age=31536000; SameSite=Strict`;
            
            router.push("/setup/profile");
          })
          .catch(error => {
            console.error('Error updating wallet address in mockUsers:', error);
            setLoading(false);
            setWalletError(new Error('Failed to update wallet address. Please try again.'));
          });
        } else {
          router.push("/setup/profile");
        }
      } catch (error) {
        setLoading(false)
        setWalletError(error as Error)
      }
    }
  }

  const handleBack = () => {
    router.push("/setup/link")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative flex items-center justify-center p-4">
      {/* Gradient background effects */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,180,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(100,150,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
      </div>

      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl relative z-10 border border-blue-100">
        {/* Progress steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-blue-100 border-2 border-blue-200">
                <span className="text-blue-500 font-semibold">1</span>
              </div>
              <span className="text-sm text-gray-600">Start</span>
            </div>
            <div className="h-1 bg-blue-100 flex-1 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-blue-100 border-2 border-blue-200">
                <span className="text-blue-500 font-semibold">2</span>
              </div>
              <span className="text-sm text-gray-600">Link</span>
            </div>
            <div className="h-1 bg-blue-100 flex-1 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-blue-500 border-2 border-blue-600">
                <span className="text-white font-semibold">3</span>
              </div>
              <span className="text-sm font-medium text-blue-500">Wallets</span>
            </div>
            <div className="h-1 bg-blue-100 flex-1 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-white border-2 border-blue-100">
                <span className="text-gray-400 font-semibold">4</span>
              </div>
              <span className="text-sm text-gray-400">Profile</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Connect your wallet</h1>
          <p className="text-gray-600">This is where your ETH tips will be withdrawn to.</p>
          {currentUsername && (
            <p className="text-blue-500 mt-2">Setting up wallet for: <span className="font-semibold">@{currentUsername}</span></p>
          )}
        </div>

        {/* Wallet error message */}
        {walletError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-100">
            <p className="text-sm">{walletError.message || 'Error connecting wallet. Please try again.'}</p>
          </div>
        )}

        {/* Wallet button */}
        <div className="mb-8">
          {!isValid ? (
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => setWalletError(null)}
            >
              <ConnectWallet className="!border-0">
                <div className="bg-blue-500 text-white hover:bg-blue-600 border-none rounded-md flex justify-center items-center px-5 h-12 shadow-md">
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
                </div>
              </ConnectWallet>
            </ErrorBoundary>
          ) : (
            <div className="flex items-center text-green-500 bg-green-50 p-3 rounded-lg">
              <Check className="h-5 w-5 mr-2" />
              <span>Wallet connected successfully: {address}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-500 hover:bg-blue-50"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleNext}
            disabled={loading || !isValid}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}