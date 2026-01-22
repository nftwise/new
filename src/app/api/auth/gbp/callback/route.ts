import { NextRequest, NextResponse } from 'next/server';
import { GBPTokenManager } from '@/lib/api/gbp-token-manager';

/**
 * GET /api/auth/gbp/callback
 * Handles OAuth callback from Google and saves tokens
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({
      success: false,
      error: `OAuth error: ${error}`,
      description: searchParams.get('error_description')
    }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({
      success: false,
      error: 'No authorization code received'
    }, { status: 400 });
  }

  try {
    const redirectUri = `${origin}/api/auth/gbp/callback`;
    const token = await GBPTokenManager.exchangeCode(code, redirectUri);

    // Return success page
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>GBP Authorization Success</title>
        <style>
          body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; }
          .info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px; }
          code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="success">
          <h2>✅ GBP Authorization Successful!</h2>
          <p>Your Google Business Profile access has been configured.</p>
        </div>
        <div class="info">
          <p><strong>Email:</strong> ${token.email || 'Unknown'}</p>
          <p><strong>Token expires:</strong> ${new Date(token.expiry_date).toLocaleString()}</p>
          <p><strong>Status:</strong> Token saved to database</p>
        </div>
        <p style="margin-top: 30px;">
          <a href="/admin">← Back to Admin Dashboard</a>
        </p>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error: any) {
    console.error('[GBP Callback] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Check OAuth credentials and redirect URI configuration'
    }, { status: 500 });
  }
}
