"use client"
import { Button } from "@/components/ui/button"
import { TwitchIcon } from "lucide-react"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleTwitchLogin = async () => {
    try {
      setIsLoading(true)
      await signIn("twitch", { 
        callbackUrl: "/setup/start",
        redirect: true
      })
    } catch (error) {
      console.error("Login failed:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Light left side */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 relative flex items-center justify-center p-8">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,180,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(100,150,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
        </div>
        
        <div className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 24 24" fill="none" className="text-blue-500 w-16 h-16">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* Login text */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome to Bstream</h2>
            <p className="text-gray-600">Login with Twitch to continue</p>
          </div>

          {/* Login buttons */}
          <div className="space-y-6">
            <Button
              className="w-full bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white py-5 flex items-center justify-center gap-2 rounded-lg shadow-md"
              onClick={handleTwitchLogin}
              disabled={isLoading}
            >
              <TwitchIcon className="h-5 w-5" />
              {isLoading ? "Connecting..." : "Continue with Twitch"}
            </Button>
            
            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
      
      {/* Blue right side */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
        </div>
      </div>
    </div>
  )
}