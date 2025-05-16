"use client"

import React, { ReactNode, useMemo, useEffect } from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="p-4 rounded-lg border border-red-200 bg-red-50">
      <p className="text-red-500 font-medium">Error in wallet provider:</p>
      <p className="text-sm text-red-400 mb-3">{error.message || 'Unknown error'}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-3 py-1 text-sm bg-white border border-red-200 rounded text-red-500"
      >
        Try again
      </button>
    </div>
  )
}

// Create a client outside component to prevent recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

// Create optimized http providers outside component
const baseTransport = http();
const baseSepoliaTransport = http();

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent the error from bubbling up
      event.preventDefault();
      
      // Log the error for debugging
      console.error('Unhandled wallet rejection (caught):', event.reason);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Use useMemo to create the config only once
  const config = useMemo(() => {
    try {
      return createConfig({
        chains: [baseSepolia, base],
        transports: {
          [base.id]: baseTransport,
          [baseSepolia.id]: baseSepoliaTransport,
        },
        connectors: [
          coinbaseWallet({
            appName: 'Bstream',
            appLogoUrl: 'http://localhost:3000/logo.png',
            reloadOnDisconnect: false,
          }),
        ],
        batch: {
          multicall: true,
        },
      });
    } catch (error) {
      console.error('Error creating Wagmi config:', error);
      // Return a minimal fallback config
      return createConfig({
        chains: [baseSepolia],
        transports: {
          [baseSepolia.id]: baseSepoliaTransport,
        },
      });
    }
  }, []);
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiConfig>
    </ErrorBoundary>
  );
}