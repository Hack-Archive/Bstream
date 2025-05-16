"use client"

import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function Header() {
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"
  
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-blue-100">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="BStream Logo" width={32} height={32} className="mr-2" />
          <span className="font-semibold text-gray-800 text-xl">BStream</span>
        </Link>

        {status === "loading" ? (
          <div className="h-10 w-10 rounded-full bg-blue-100 animate-pulse"></div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-blue-500 border-blue-500">
                Dashboard
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 border-red-500"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-blue-500 border-blue-500">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}