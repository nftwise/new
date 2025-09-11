import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json({
      success: true,
      user: {
        id: payload.id,
        email: payload.email,
        companyName: payload.companyName,
        googleAnalyticsPropertyId: payload.googleAnalyticsPropertyId,
        googleAdsCustomerId: payload.googleAdsCustomerId,
        callrailAccountId: payload.callrailAccountId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}