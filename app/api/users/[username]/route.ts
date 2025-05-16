import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface WalletStats {
  earnings: number;
  balance: number;
  donations: number;
}

interface Donation {
  fromAddress: string;
  amount: number;
  timestamp: number;
}

interface UserProfile {
  username: string;
  displayName: string;
  profileImage: string | null;
  bannerColor: string;
  walletAddress: string;
  walletStats?: WalletStats;
  recentDonations?: Donation[];
}

// This would connect to a database in a production app
// Here we're just mocking the data
export const mockUsers: Record<string, UserProfile> = {
  // Add some example users for testing
  amiy: {
    username: 'amiy',
    displayName: 'Amiy',
    profileImage: null, 
    bannerColor: '#1e3a8a',
    walletAddress: '0x8cCbC1f6382100205B8EAF9D0E393EaE500bc669',
    walletStats: {
      earnings: 0,
      balance: 0,
      donations: 0
    },
    recentDonations: []
  }
}

export async function GET(
  request: Request,
  context: { params: { username: string } }
) {
  // In Next.js 15, params must be awaited
  const params = await context.params;
  const { username } = params;
  
  // Get wallet address from cookie if available (for demo purposes)
  const cookieStore = await cookies();
  
  // Check for username-specific wallet address cookie
  const userSpecificCookieName = `walletAddress_${username.toLowerCase()}`;
  const savedWalletAddress = cookieStore.get(userSpecificCookieName)?.value || 
                            cookieStore.get('walletAddress')?.value;
  
  // Check if the user exists in mockUsers
  if (mockUsers[username.toLowerCase()]) {
    // If the user exists in mockUsers, use that data
    const userData = { ...mockUsers[username.toLowerCase()] };
    
    // Only update the wallet address from cookies if there's a saved wallet address
    // This ensures we keep the mockUsers data as the source of truth for cross-browser compatibility
    if (savedWalletAddress) {
      userData.walletAddress = savedWalletAddress;
    }
    
    // Return the user data with the most up-to-date wallet address
    return NextResponse.json(userData);
  } else {
    // If the user doesn't exist in mockUsers, create a new user object
    const newUser = {
      username,
      displayName: username,
      profileImage: null,
      bannerColor: '#1e3a8a',
      walletAddress: savedWalletAddress || '', // Remove hardcoded default address
      walletStats: {
        earnings: 0,
        balance: 0,
        donations: 0
      },
      recentDonations: []
    };
    
    // Add the new user to mockUsers for future requests (cross-browser support)
    mockUsers[username.toLowerCase()] = newUser;
    
    return NextResponse.json(newUser);
  }
} 