import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Send a Tip",
  description: "Send cryptocurrency tips to your favorite creators",
}

export default function DonationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
} 