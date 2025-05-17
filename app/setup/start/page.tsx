"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { Loader2, Link as LinkIcon, Wallet, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import StaticRadialGradientBackground from "@/components/ui/StaticRadialGradientBackground"
import { env } from "@/lib/env"

// Extracted reusable components
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, label: "Start" },
    { number: 2, label: "Link" },
    { number: 3, label: "Wallets" },
    { number: 4, label: "Profile" }
  ]

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              index < currentStep ? 'bg-blue-500 border-2 border-blue-600' : 'bg-white border-2 border-blue-100'
            }`}>
              <span className={`font-semibold ${index < currentStep ? 'text-white' : 'text-gray-400'}`}>
                {step.number}
              </span>
            </div>
            <span className={`text-sm ${index < currentStep ? 'font-medium text-blue-500' : 'text-gray-400'}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="h-1 bg-blue-100 flex-1 mx-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const SetupCard = ({ 
  icon: Icon, 
  title, 
  description, 
  children 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  children?: React.ReactNode 
}) => (
  <div className="bg-white rounded-xl p-6 flex flex-col shadow-md border border-blue-50 hover:shadow-lg transition-shadow">
    <div className="mb-auto pb-6">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-blue-500" />
      </div>
      {children}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
)

export default function StartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // If not authenticated, redirect to login
  useEffect(() => {
    // Wait a brief moment to ensure session is loaded
    const checkAuth = setTimeout(() => {
      if (status === "unauthenticated") {
        console.log("Setup page: Not authenticated, redirecting to login")
        router.push("/login")
      }
      // For debugging purposes, log the session status and data
      if (status === "authenticated" && session) {
        console.log("Setup page: Session authenticated:", {
          userId: session.user?.id,
          name: session.user?.name,
          image: session.user?.image,
          hasAccessToken: !!session.accessToken
        })
      }
    }, 500) // Small delay to ensure session is fully loaded
    
    return () => clearTimeout(checkAuth)
  }, [status, router, session])
  
  // Force revalidation on component mount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Setup page: Document became visible, checking session")
        // You could trigger a session refresh here if needed
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Memoize setup cards data
  const setupCards = useMemo(() => [
    {
      icon: LinkIcon,
      title: "Your Link",
      description: "Set your own custom link to start accepting tips!",
      children: (
        <div className="text-gray-500 flex items-center gap-2 mb-4">
          <span className="font-medium">{new URL(env.NEXT_PUBLIC_BASE_URL).host}/</span>
          <span className="text-blue-500">yourname</span>
        </div>
      )
    },
    {
      icon: Wallet,
      title: "Connect Wallet",
      description: "Connect your Ethereum wallet to receive your tips!",
      children: (
        <div className="flex items-center gap-3 mb-4">
          <Image src="/wallet-icons/coinbase.png" alt="Coinbase" width={32} height={32} />
        </div>
      )
    },
    {
      icon: User,
      title: "Profile",
      description: "Add your image, banner and color theme to complete the look!",
      children: (
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg h-12 flex items-center px-4 mb-4">
          <div className="w-6 h-6 bg-white rounded-full border-2 border-white"></div>
        </div>
      )
    }
  ], []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative flex items-center justify-center p-4">
      <StaticRadialGradientBackground />

      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl relative z-10 border border-blue-100">
        <StepIndicator currentStep={1} />

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Let's get you started</h1>
          <p className="text-gray-600">Just a few quick details so you can start accepting tips!</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {setupCards.map((card, i) => (
            <SetupCard key={i} {...card} />
          ))}
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => router.push("/setup/link")}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 