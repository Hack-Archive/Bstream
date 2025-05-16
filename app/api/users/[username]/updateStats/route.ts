import { NextResponse } from 'next/server'
import { mockUsers } from '../route'

// POST endpoint to update wallet stats
export async function POST(
  request: Request,
  context: { params: { username: string } }
) {
  try {
    // In Next.js 15, params must be awaited
    const params = await context.params;
    const { username } = params;
    
    // Get request body
    const { amount, fromAddress } = await request.json();
    
    if (amount === undefined || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid amount format' },
        { status: 400 }
      );
    }
    
    const userKey = username.toLowerCase();
    
    // Update mock user data if the user exists, or create new user
    if (!mockUsers[userKey]) {
      mockUsers[userKey] = {
        username: userKey,
        displayName: username,
        profileImage: null,
        bannerColor: '#1e3a8a',
        walletAddress: '',
        walletStats: {
          earnings: 0,
          balance: 0,
          donations: 0
        },
        recentDonations: []
      };
    }
    
    // Initialize wallet stats if they don't exist
    if (!mockUsers[userKey].walletStats) {
      mockUsers[userKey].walletStats = {
        earnings: 0,
        balance: 0,
        donations: 0
      };
    }
    
    // Initialize recent donations if they don't exist
    if (!mockUsers[userKey].recentDonations) {
      mockUsers[userKey].recentDonations = [];
    }
    
    // Update the stats - ensure it exists first
    const stats = mockUsers[userKey].walletStats!;
    stats.earnings += amount;
    stats.balance += amount;
    stats.donations += 1;
    
    // Add to recent donations (limited to most recent 10)
    const newDonation = {
      fromAddress: fromAddress || '0x0000...anonymous',
      amount,
      timestamp: Date.now()
    };
    
    mockUsers[userKey].recentDonations!.unshift(newDonation);
    
    // Keep only the 10 most recent donations
    if (mockUsers[userKey].recentDonations!.length > 10) {
      mockUsers[userKey].recentDonations = 
        mockUsers[userKey].recentDonations!.slice(0, 10);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Wallet stats updated',
      user: mockUsers[userKey]
    });
  } catch (error) {
    console.error('Error updating wallet stats:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet stats' },
      { status: 500 }
    );
  }
} 