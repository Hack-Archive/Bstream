"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from "next-auth/react";

// Define the shape of our wallet stats
interface WalletStats {
  earnings: number;
  balance: number;
  donations: number;
}

// Define the context interface
interface WalletStatsContextType {
  stats: WalletStats;
  updateStats: (amount: number) => void;
  resetStats: () => void;
}

// Create context with default values
const WalletStatsContext = createContext<WalletStatsContextType>({
  stats: {
    earnings: 0,
    balance: 0,
    donations: 0
  },
  updateStats: () => {},
  resetStats: () => {}
});

// Custom hook to use the wallet stats context
export const useWalletStats = () => useContext(WalletStatsContext);

export function WalletStatsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<WalletStats>({
    earnings: 0,
    balance: 0,
    donations: 0
  });

  // Load stats from localStorage on mount if they exist
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.username) {
      const username = session.user.username;
      const storedStats = localStorage.getItem(`walletStats_${username.toLowerCase()}`);
      
      if (storedStats) {
        try {
          const parsedStats = JSON.parse(storedStats);
          setStats(parsedStats);
        } catch (error) {
          console.error('Error parsing stored wallet stats:', error);
        }
      }
    }
  }, [session]);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.username) {
      const username = session.user.username;
      localStorage.setItem(`walletStats_${username.toLowerCase()}`, JSON.stringify(stats));
    }
  }, [stats, session]);

  // Update stats with a new tip amount
  const updateStats = (amount: number) => {
    setStats(prevStats => ({
      earnings: prevStats.earnings + amount,
      balance: prevStats.balance + amount,
      donations: prevStats.donations + 1
    }));
  };

  // Reset stats to zero
  const resetStats = () => {
    setStats({
      earnings: 0,
      balance: 0,
      donations: 0
    });
  };

  return (
    <WalletStatsContext.Provider value={{ stats, updateStats, resetStats }}>
      {children}
    </WalletStatsContext.Provider>
  );
} 