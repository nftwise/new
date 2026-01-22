import { NextResponse } from 'next/server';
import { GBPTokenManager } from '@/lib/api/gbp-token-manager';

/**
 * GET /api/auth/gbp/status
 * Check GBP token status
 */
export async function GET() {
  try {
    const status = await GBPTokenManager.getStatus();

    return NextResponse.json({
      success: true,
      ...status,
      config: {
        clientIdSet: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecretSet: !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
