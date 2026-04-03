import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json().catch(() => null);
    return NextResponse.json({
      success: false,
      error: 'Legacy /api/auth login is disabled. Use NextAuth credentials sign-in at /api/auth/[...nextauth].'
    }, { status: 410 });
  } catch (_error) {
    return NextResponse.json({
      success: false,
      error: 'Server error' 
    }, { status: 500 });
  }
}

// Handle logout — clear both legacy cookie and NextAuth session cookie
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('user');
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  return response;
}

// Check if logged in
export async function GET(request: NextRequest) {
  const userCookie = request.cookies.get('user');
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      return NextResponse.json({ success: true, user });
    } catch {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  }
  
  return NextResponse.json({ success: false }, { status: 401 });
}
