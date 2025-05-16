import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { mockUsers } from '../route'

// POST endpoint to update wallet address
export async function POST(
  request: Request,
  context: { params: { username: string } }
) {
  try {
    // In Next.js 15, params must be awaited
    const params = await context.params;
    const { username } = params;
    
    // Get request body
    const { walletAddress } = await request.json();
    
    if (!walletAddress || !walletAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }
    
    // Update mock user data if the user exists, or create new user
    if (mockUsers[username.toLowerCase()]) {
      mockUsers[username.toLowerCase()].walletAddress = walletAddress;
    } else {
      mockUsers[username.toLowerCase()] = {
        username: username.toLowerCase(),
        displayName: username,
        profileImage: null,
        bannerColor: '#1e3a8a',
        walletAddress: walletAddress,
      };
    }
    
    // Also update the cookie using the Next.js 15 cookies() API
    const cookieStore = cookies();
    cookieStore.set(`walletAddress_${username.toLowerCase()}`, walletAddress, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'strict'
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Wallet address updated',
      user: mockUsers[username.toLowerCase()]
    });
  } catch (error) {
    console.error('Error updating wallet address:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet address' },
      { status: 500 }
    );
  }
} 