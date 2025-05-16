"use client"

import dynamic from "next/dynamic"

const WalletProvider = dynamic(
  () => import("@/components/wallet/WagmiProvider").then(mod => mod.WalletProvider),
  { ssr: false }
)

const OnchainProvider = dynamic(
  () => import("@/components/wallet/OnchainKitProvider").then(mod => mod.OnchainProvider),
  { ssr: false }
)

const WalletStatsProvider = dynamic(
  () => import("@/components/wallet/WalletStatsProvider").then(mod => mod.WalletStatsProvider),
  { ssr: false }
)

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <OnchainProvider>
        <WalletStatsProvider>
          {children}
        </WalletStatsProvider>
      </OnchainProvider>
    </WalletProvider>
  )
} 