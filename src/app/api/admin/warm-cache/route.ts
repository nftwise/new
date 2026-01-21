import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/warm-cache
 *
 * DEPRECATED: Cache removed in KISS refactor
 * This endpoint is kept for backward compatibility but does nothing
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    return NextResponse.json({
      success: true,
      message: 'Cache warming disabled (KISS refactor - database-only approach)',
      cached: false
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
