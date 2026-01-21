import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

/**
 * POST /api/admin/backfill
 * Backfill historical data for a date range
 *
 * Body: { startDate: "2025-11-01", endDate: "2025-12-20" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, secret } = body;

    // Verify secret (optional but recommended for production)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && secret !== cronSecret) {
      // If no valid secret, require admin auth
      await requireAdmin();
    }

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'startDate and endDate are required'
      }, { status: 400 });
    }

    // Calculate all dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    console.log(`🔄 [Backfill] Starting backfill for ${dates.length} days: ${startDate} to ${endDate}`);

    const results: { date: string; success: boolean; error?: string }[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Process dates sequentially to avoid overwhelming APIs
    for (const date of dates) {
      try {
        console.log(`📅 [Backfill] Processing ${date}...`);

        const response = await fetch(`${baseUrl}/api/admin/run-rollup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, secret }),
        });

        const result = await response.json();

        if (result.success) {
          console.log(`✅ [Backfill] ${date} completed`);
          results.push({ date, success: true });
        } else {
          console.log(`❌ [Backfill] ${date} failed: ${result.error}`);
          results.push({ date, success: false, error: result.error });
        }

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`❌ [Backfill] ${date} error:`, error.message);
        results.push({ date, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`🏁 [Backfill] Complete: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      totalDays: dates.length,
      successful,
      failed,
      results,
    });

  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * GET /api/admin/backfill?days=30
 * Quick backfill for last N days
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days + 1);

    // Redirect to POST with calculated dates
    const body = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    console.log(`🔄 [Backfill] Quick backfill for last ${days} days`);

    // Call POST internally
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/admin/backfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
