import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ 
      message: 'Logout successful',
      clearLocalStorage: true
    });
    
    // Clear cookie
    response.cookies.delete('auth-token');
    
    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
