"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { useMemo } from "react"
import StaticRadialGradientBackground from "@/components/ui/StaticRadialGradientBackground"

// Extracted reusable components
const FeatureCard = ({ title, description, index }: { title: string; description: string; index: number }) => (
  <div className="group bg-white/80 p-6 rounded-2xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-all">
    <div className={`bg-gradient-to-r ${index % 2 === 0 ? 'from-indigo-400 to-blue-500' : 'from-blue-400 to-indigo-500'} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    </div>
    <div className="flex justify-between mb-3">
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="text-blue-500 font-medium flex items-center">
      <span>Learn more</span>
      <ArrowRight className="ml-2 w-4 h-4" />
    </div>
  </div>
)

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
    <h2 className="text-4xl font-bold text-blue-500 mb-2">{value}</h2>
    <p className="text-gray-600">{label}</p>
  </div>
)

export default function Home() {
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"

  // Memoize static data to prevent recreation on each render
  const features = useMemo(() => [
    {
      title: "Personalized Donation Links",
      description: "Create unique donation links for your streams. Share them anywhere and receive instant ETH donations directly to your wallet."
    },
    {
      title: "Customizable Alerts",
      description: "Set up custom alerts for donations with personalized messages, sounds, and visual effects to enhance viewer engagement."
    },
    {
      title: "Direct Wallet Integration",
      description: "Connect your Ethereum wallet to receive donations instantly. No intermediaries, no delays - just direct crypto transfers."
    },
    {
      title: "Analytics Center",
      description: "Track your donation metrics, viewer engagement, and revenue analytics in real-time with our comprehensive analytics center."
    }
  ], []);

  const stats = useMemo(() => [
    { value: "0.1s", label: "Instant Payouts" },
    { value: "0%", label: "Platform Fees" },
    { value: "100%", label: "Direct to Wallet" }
  ], []);

  // Memoize action buttons to prevent recreation
  const actionButtons = useMemo(() => (
    isAuthenticated ? (
      <div className="flex gap-4">
        <Link href="/dashboard" className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-md transition-colors">
          Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    ) : (
      <div className="flex gap-4">
        <Link href="/login" className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-md transition-colors">
          Get Started <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
        <Link href="/login" className="inline-flex items-center bg-white hover:bg-gray-50 text-blue-500 border border-blue-500 px-5 py-2.5 rounded-md transition-colors">
          Login
        </Link>
      </div>
    )
  ), [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative">
      <StaticRadialGradientBackground />
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-16 pb-24">
        <div className="max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-blue-500 to-blue-400 bg-clip-text text-transparent">Instant Crypto</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Donations for Streamers</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl">
            Bstream enables streamers to receive instant ETH-based crypto donations via personalized links, with customizable alerts and direct wallet payouts.
          </p>
          {actionButtons}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-12">
        <h2 className="text-5xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Bstream</span>
          <span className="text-gray-800"> Features</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}