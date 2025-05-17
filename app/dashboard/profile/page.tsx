"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Loader2, Upload, CheckCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

export default function DashboardProfilePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [color, setColor] = useState("#1e1b8b") // Default blue color - matches the alert page
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  
  // Get username and profile details from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get username
      const storedUsername = localStorage.getItem('userLink')
      if (storedUsername) {
        setUsername(storedUsername)
      }
      
      // Get profile image
      const storedProfileImage = localStorage.getItem('profileImage')
      if (storedProfileImage) {
        setProfileImage(storedProfileImage)
      }
      
      // Get color if saved
      const storedColor = localStorage.getItem('profileColor')
      if (storedColor) {
        setColor(storedColor)
      }
    }
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
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

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save profile image to localStorage if exists
      if (profileImage) {
        localStorage.setItem('profileImage', profileImage);
      }
      
      // Save color
      localStorage.setItem('profileColor', color);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 relative">
      <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
      <p className="text-gray-600 mb-6">Customize your profile and donation page appearance.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Preview */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100/50 overflow-hidden">
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
              This is a preview of how your donation page will look to others.
            </p>
            <div className="mt-4">
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded">Donation Link</span>
              <p className="mt-2 text-sm text-gray-600">
                <span className="text-black">{typeof window !== 'undefined' ? window.location.host : 'bstream-weld.vercel.app'}/{username}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Customization controls */}
        <div className="bg-white rounded-xl p-5 border border-blue-100/50 shadow-lg">
          <h2 className="text-gray-800 text-lg font-medium mb-4">Appearance Settings</h2>
          
          <div className="space-y-6">
            {/* Profile picture upload */}
            <div>
              <h3 className="text-gray-700 font-medium mb-2">Profile Picture</h3>
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-500 py-6 border-dashed border-2 hover:bg-gray-50"
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

            {/* Save button */}
            <Button 
              className="w-full mt-4"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 