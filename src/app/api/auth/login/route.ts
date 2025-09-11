import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Read clients from JSON file
    const filePath = path.join(process.cwd(), 'src', 'data', 'clients.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const clientsData = JSON.parse(fileContents);

    // Find user by email and validate password
    const user = clientsData.clients.find((client: any) => client.email === email);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      companyName: user.companyName,
      googleAnalyticsPropertyId: user.googleAnalyticsPropertyId,
      googleAdsCustomerId: user.googleAdsCustomerId,
      callrailAccountId: user.callrailAccountId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}