// lib/env.ts
export const env = {
    // The base URL for the entire application
    NEXT_PUBLIC_BASE_URL: typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
    
    // Authentication
    NEXT_PUBLIC_TWITCH_CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  }