import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { ClientProviders } from "@/components/layout/ClientProviders"
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bstream - Instant Crypto Donations for Streamers",
  description:
    "Bstream enables streamers to receive instant ETH-based crypto donations via personalized links, with customizable alerts and direct wallet payouts.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}