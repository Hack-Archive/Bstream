"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Home, Bell, User } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const { data: session } = useSession()
  const [username, setUsername] = useState(session?.user?.username || '')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const pathname = usePathname()
  
  // Get username and profile image from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('userLink')
    if (storedUsername) {
      setUsername(storedUsername)
    }
    
    // Get profile image if available
    const storedProfileImage = localStorage.getItem('profileImage')
    if (storedProfileImage) {
      setProfileImage(storedProfileImage)
    }
  }, [])

  return (
    <aside className="flex flex-col h-screen w-64 bg-white/80 backdrop-blur-sm border-r border-blue-100 text-gray-800 fixed left-0 top-0 z-40 shadow-lg">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-blue-100">
        <Image src="/logo.svg" alt="Logo" width={28} height={28} className="mr-2" />
        <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">stream</span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                pathname === "/dashboard" 
                  ? "bg-blue-50 text-blue-500" 
                  : "hover:bg-blue-50 text-gray-800"
              }`}
            >
              <Home className="w-5 h-5" /> Home
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/alerts" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                pathname === "/dashboard/alerts" 
                  ? "bg-blue-50 text-blue-500" 
                  : "hover:bg-blue-50 text-gray-800"
              }`}
            >
              <Bell className="w-5 h-5" /> Alerts
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/profile" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                pathname === "/dashboard/profile" 
                  ? "bg-blue-50 text-blue-500" 
                  : "hover:bg-blue-50 text-gray-800"
              }`}
            >
              <User className="w-5 h-5" /> Profile
            </Link>
          </li>
        </ul>
      </nav>
      {/* User Info */}
      <div className="mt-auto px-6 py-4 border-t border-blue-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-50">
          {profileImage ? (
            <Image 
              src={profileImage} 
              alt="Profile" 
              width={40} 
              height={40} 
              className="object-cover w-full h-full"
            />
          ) : (
            <User className="w-6 h-6 text-blue-500" />
          )}
        </div>
        <div>
          <div className="font-semibold text-sm">{username}</div>
          <div className="text-xs text-gray-500">Streamer</div>
        </div>
      </div>
    </aside>
  )
} 