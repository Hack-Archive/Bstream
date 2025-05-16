"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * This page serves as a redirect to the first step of the setup flow.
 * It ensures users always enter the setup flow at the correct starting point.
 */
export default function SetupRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the first step of setup
    router.replace("/setup/start")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="ml-3 text-gray-600">Loading setup...</p>
    </div>
  )
} 