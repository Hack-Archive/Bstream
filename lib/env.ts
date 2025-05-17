// lib/env.ts
export const env = {
    // Base URL of the application - used for both client and server
    NEXT_PUBLIC_BASE_URL: typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    
    // Authentication
    NEXT_PUBLIC_TWITCH_CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    
    // Use NEXT_PUBLIC_BASE_URL for NEXTAUTH_URL if not explicitly defined
    get NEXTAUTH_URL() {
      return process.env.NEXTAUTH_URL || this.NEXT_PUBLIC_BASE_URL;
    }
  }