import { NextRequest, NextResponse } from 'next/server';
import { GBPTokenManager } from '@/lib/api/gbp-token-manager';

/**
 * GET /api/auth/gbp/authorize
 * Redirects to Google OAuth consent screen for GBP access
 */
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const redirectUri = `${origin}/api/auth/gbp/callback`;

  try {
    const authUrl = GBPTokenManager.getAuthUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Make sure GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are set'
    }, { status: 500 });
  }
}
