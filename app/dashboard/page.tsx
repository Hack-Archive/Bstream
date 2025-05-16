"use client"

import React, { Suspense } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo, useCallback } from "react"
import { Loader2, Copy, Wallet, Gift, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useWalletStats } from '@/components/wallet/WalletStatsProvider'
import { useAccount, useBalance } from 'wagmi'

// Dynamic imports for better code splitting
const GradientBackground = React.lazy(() => import('@/components/ui/GradientBackground'))
const StatCard = React.lazy(() => import('@/components/ui/StatCard'))
const EmptyState = React.lazy(() => import('@/components/ui/EmptyState'))

// Interface for donation
interface Donation {
  fromAddress: string;
  amount: number;
  timestamp: number;
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
)

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [username, setUsername] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const { stats: localStats } = useWalletStats()
  const [serverStats, setServerStats] = useState({
    earnings: 0,
    balance: 0,
    donations: 0
  })
  const [recentDonations, setRecentDonations] = useState<Donation[]>([])
  const [walletAddress, setWalletAddress] = useState('')
  const [refreshingBalance, setRefreshingBalance] = useState(false)
  
  // Get user's account and balance using wagmi hooks
  const { address, isConnected } = useAccount()
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: walletAddress ? `0x${walletAddress.replace(/^0x/, '')}` as `0x${string}` : undefined,
  })

  // If not authenticated, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Get username and profile image from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('userLink')
      if (storedUsername) {
        setUsername(storedUsername)
      } else if (session?.user?.username) {
        setUsername(session.user.username)
      }
      
      // Get profile image if available
      const storedProfileImage = localStorage.getItem('profileImage')
      if (storedProfileImage) {
        setProfileImage(storedProfileImage)
      }
    }
  }, [session])

  // Fetch user stats from server
  useEffect(() => {
    if (username) {
      fetch(`/api/users/${username}`)
        .then(response => response.json())
        .then(data => {
          if (data.walletStats) {
            setServerStats(data.walletStats);
          }
          if (data.recentDonations) {
            setRecentDonations(data.recentDonations);
          }
          if (data.walletAddress) {
            setWalletAddress(data.walletAddress);
          }
        })
        .catch(error => {
          console.error('Error fetching user stats:', error);
        });
    }
  }, [username]);

  const handleCopyLink = useCallback(() => {
    const link = `localhost:3000/${username}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [username])

  // Handle refresh balance
  const handleRefreshBalance = useCallback(async () => {
    if (walletAddress) {
      setRefreshingBalance(true);
      try {
        await refetchBalance();
      } catch (error) {
        console.error('Error refreshing balance:', error);
      } finally {
        setRefreshingBalance(false);
      }
    }
  }, [walletAddress, refetchBalance]);

  // Combine local and server stats, preferring the higher values
  const combinedStats = useMemo(() => {
    return {
      donations: Math.max(localStats.donations, serverStats.donations),
      earnings: Math.max(localStats.earnings, serverStats.earnings),
      balance: Math.max(localStats.balance, serverStats.balance)
    };
  }, [localStats, serverStats]);

  // Format balance for display
  const formatBalance = (value?: bigint, decimals?: number): string => {
    if (value === undefined || decimals === undefined) return '0';
    
    // Calculate divisor manually since bigint ** operation might not be supported
    let divisor = BigInt(1);
    for (let i = 0; i < decimals; i++) {
      divisor *= BigInt(10);
    }
    
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;
    
    // Convert to string with up to 6 decimal places
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const truncatedFractional = fractionalStr.substring(0, 6);
    
    // Remove trailing zeros
    const cleanFractional = truncatedFractional.replace(/0+$/, '');
    
    if (cleanFractional === '') {
      return integerPart.toString();
    }
    
    return `${integerPart}.${cleanFractional}`;
  };

  // Memoize stats data
  const statsData = useMemo(() => [
    { title: "Donations", value: combinedStats.donations, icon: Gift },
    { title: "Earnings", value: combinedStats.earnings, icon: Wallet, unit: "ETH" },
    { 
      title: "Wallet Balance", 
      value: balanceData ? formatBalance(balanceData.value, balanceData.decimals) : '0', 
      unit: balanceData?.symbol || "ETH",
      icon: Wallet,
      action: walletAddress ? {
        icon: RefreshCw,
        onClick: handleRefreshBalance,
        isLoading: refreshingBalance
      } : undefined
    }
  ], [combinedStats, walletAddress, balanceData, handleRefreshBalance, refreshingBalance]);

  // Format addresses for display
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (status === "loading") {
    return <LoadingFallback />
  }

  if (!session) {
    return null
  }

  // SVG Components for EmptyState
  const PlusIcon = () => (
    <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeWidth="2" d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z"/>
      <path stroke="currentColor" strokeWidth="2" d="M9 12h6M12 9v6"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative">
      <Suspense fallback={<div className="absolute inset-0 bg-blue-50" />}>
        <GradientBackground />
      </Suspense>
      <div className="relative z-10 p-8">
        <div className="grid grid-cols-3 gap-6 mb-6">
          {statsData.map((stat, i) => (
            <Suspense key={i} fallback={<div className="h-32 bg-white/80 rounded-xl animate-pulse" />}>
              <StatCard {...stat} />
            </Suspense>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100/50 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-700">Recent Donations</h2>
              <div className="text-sm text-gray-500">All tips received by your account</div>
            </div>
            {recentDonations.length > 0 ? (
              <div className="space-y-3">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="bg-blue-50/70 rounded-lg p-4 border border-blue-100 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-600 text-lg">{donation.amount} ETH</span>
                      <span className="text-sm text-gray-500">From: {formatAddress(donation.fromAddress)}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm bg-white/70 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(donation.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Suspense fallback={<div className="h-[200px] animate-pulse" />}>
                <EmptyState 
                  icon={PlusIcon}
                  message="No donations yet" 
                />
              </Suspense>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100/50 shadow-lg mb-6">
              <div className="text-gray-600 text-sm mb-2">Your Donation Link <span className="ml-1 text-xs" title="Share this link to receive donations">ⓘ</span></div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500 font-medium">{`localhost:3000/${username}`}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  className="h-8 w-8"
                >
                  <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : 'text-gray-500'}`} />
                </Button>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100/50 shadow-lg">
              <h3 className="text-gray-700 font-medium mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                    <Gift className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Share your donation link with your audience to receive tips</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                    <Wallet className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Tips are sent directly to your connected wallet</span>
                </li>
                {walletAddress && (
                  <li className="flex items-start gap-2 mt-4 text-xs">
                    <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                      <Wallet className="h-3 w-3 text-blue-600" />
                    </div>
                    <span>Wallet: {formatAddress(walletAddress)}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 