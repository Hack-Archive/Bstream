"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Upload, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function ProfileStep() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [color, setColor] = useState("#3b82f6") // Default blue color
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  
  // If not authenticated, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])
  
  // Get username from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('userLink')
      if (storedUsername) {
        setUsername(storedUsername)
      }
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      // Save profile image to localStorage if exists
      if (profileImage) {
        localStorage.setItem('profileImage', profileImage);
      }
      
      // In a real app, you would save the profile data here
      // For now, we'll just redirect to dashboard
      await router.push("/dashboard")
    } catch (error) {
      console.error("Error redirecting to dashboard:", error)
      // Fallback to window.location only if router.push fails
      window.location.href = "/dashboard"
    }
  }

  const handleBack = () => {
    router.push("/setup/wallet")
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
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-blue-100 border-2 border-blue-200">
                <span className="text-blue-500 font-semibold">3</span>
              </div>
              <span className="text-sm text-gray-600">Wallets</span>
            </div>
            <div className="h-1 bg-blue-100 flex-1 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-blue-500 border-2 border-blue-600">
                <span className="text-white font-semibold">4</span>
              </div>
              <span className="text-sm font-medium text-blue-500">Profile</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Customize your profile</h1>
          <p className="text-gray-600">Add a personal touch to your donation page.</p>
        </div>

        {/* Profile customization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Preview */}
          <div className="bg-white rounded-xl shadow-md border border-blue-50 overflow-hidden">
            <div 
              className="h-32 relative w-full"
              style={{ 
                backgroundColor: color,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute -bottom-10 left-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white bg-gray-200 flex items-center justify-center">
                    {profileImage ? (
                      <Image 
                        src={profileImage} 
                        alt="Profile" 
                        width={80} 
                        height={80} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-400 text-3xl font-light">?</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-12 px-4 pb-4">
              <p className="text-gray-500 text-sm mb-4">@{username || "username"}</p>
              <p className="text-gray-600 text-sm">
                This is a preview of how your donation page will look to others. Customize it to make it uniquely yours!
              </p>
            </div>
          </div>
          
          {/* Customization controls */}
          <div className="space-y-6">
            {/* Profile picture upload */}
            <div>
              <h3 className="text-gray-700 font-medium mb-2">Profile Picture</h3>
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-500 py-6 border-dashed border-2 hover:bg-blue-50"
                  onClick={() => document.getElementById('profile-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {profileImage ? 'Change profile picture' : 'Upload profile picture'}
                </Button>
                <input 
                  type="file" 
                  id="profile-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
                {profileImage && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended: Square image, at least 300x300px
              </p>
            </div>
            
            {/* Color picker */}
            <div>
              <h3 className="text-gray-700 font-medium mb-2">Theme Color</h3>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-md border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: color }}
                ></div>
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleFinish}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Finish
          </Button>
        </div>
      </div>
    </div>
  )
} 