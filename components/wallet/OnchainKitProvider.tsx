"use client"

import { ReactNode, useMemo } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';

export function OnchainProvider({ children }: { children: ReactNode }) {
  // Use useMemo to prevent unnecessary re-renders
  const chainConfig = useMemo(() => baseSepolia, []);
  
  return (
    <OnchainKitProvider 
      chain={chainConfig}
      config={{
        analytics: false
      }}
    >
      {children}
    </OnchainKitProvider>
  );
} 