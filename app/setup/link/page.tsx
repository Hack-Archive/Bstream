"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function LinkStep() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [linkValue, setLinkValue] = useState("")
  const [error, setError] = useState("")
  
  // If not authenticated, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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

  const validateLink = (value: string) => {
    // Clear previous errors
    setError("")
    
    // Check if the link is empty
    if (!value.trim()) {
      setError("Username cannot be empty")
      return false
    }
    
    // Check if the link contains only valid characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setError("Username can only contain letters, numbers, underscores, and hyphens")
      return false
    }
    
    // Check length constraints
    if (value.length < 3) {
      setError("Username must be at least 3 characters long")
      return false
    }
    
    if (value.length > 20) {
      setError("Username must be less than 20 characters long")
      return false
    }
    
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLinkValue(value)
    // Clear error when user starts typing again
    if (error) {
      setError("")
    }
  }

  const handleNext = () => {
    if (validateLink(linkValue)) {
      setLoading(true)
      // Store the username in localStorage
      localStorage.setItem('userLink', linkValue)
      // For now, we'll just navigate to the next step
      router.push("/setup/wallet")
    }
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
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-blue-500 border-2 border-blue-600">
                <span className="text-white font-semibold">2</span>
              </div>
              <span className="text-sm font-medium text-blue-500">Link</span>
            </div>
            <div className="h-1 bg-blue-100 flex-1 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-white border-2 border-blue-100">
                <span className="text-gray-400 font-semibold">3</span>
              </div>
              <span className="text-sm text-gray-400">Wallets</span>
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
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Set your link</h1>
          <p className="text-gray-600">Create your donation link to start receiving tips.</p>
        </div>

        {/* Input section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg flex items-center px-3 shadow-md border border-blue-100 overflow-hidden">
            <div className="text-gray-500 font-medium">localhost:3000/</div>
            <Input 
              placeholder="yourname" 
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-gray-800" 
              value={linkValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNext();
                }
              }}
            />
          </div>
          {error && (
            <div className="mt-2 flex items-center text-red-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="mt-2 text-sm text-gray-500">
            Choose a unique username for your donation link (3-20 characters, only letters, numbers, underscores and hyphens).
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-500 hover:bg-blue-50"
            onClick={() => router.push("/setup/start")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleNext}
            disabled={loading || !linkValue.trim()}
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