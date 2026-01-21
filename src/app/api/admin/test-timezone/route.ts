import { NextResponse } from 'next/server';
import {
  getUSDate,
  getUSYesterday,
  getUSToday,
  getUSDateRange,
  getTimezoneInfo,
  formatUSDate,
  isRollupTime,
} from '@/lib/utils/timezone';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/test-timezone
 *
 * Test endpoint to verify timezone handling
 *
 * Usage:
 *   curl http://localhost:3000/api/admin/test-timezone
 */
export async function GET() {
  try {
    // Verify admin access
    await requireAdmin();
  const serverNow = new Date();

  const result = {
    message: 'Timezone Test - VN Developer vs US Data',

    // Server info
    server: {
      time: serverNow.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },

    // US timezone (where business data is from)
    us: getTimezoneInfo(),

    // Date calculations
    dates: {
      usToday: getUSToday(),
      usYesterday: getUSYesterday(),
      usLast7Days: getUSDateRange(7),
      usLast30Days: getUSDateRange(30),
    },

    // Rollup timing
    rollup: {
      isRollupTime: isRollupTime(),
      shouldRunFor: getUSYesterday(),
      explanation: 'Cron runs at 2AM US time for yesterday US date',
    },

    // Formatting examples
    formatting: {
      todayShort: formatUSDate(getUSToday(), 'short'),
      todayLong: formatUSDate(getUSToday(), 'long'),
      yesterdayShort: formatUSDate(getUSYesterday(), 'short'),
    },

    // Example scenario
    scenario: {
      description: 'When cron runs at 2AM Pacific Time',
      cronTime: '2AM Pacific (US)',
      vietnamTime: '5PM Vietnam (same day)',
      dataFor: getUSYesterday(),
      example: {
        ifTodayIs: '2026-01-08',
        then: {
          usToday: '2026-01-08 or 2026-01-07 (depends on exact time)',
          usYesterday: '2026-01-07 or 2026-01-06',
          rollupFetches: 'Data for US yesterday',
        },
      },
    },

    // Debugging
    debug: {
      note: 'All dates stored as YYYY-MM-DD in US timezone',
      recommendation: 'Dashboard should display dates as-is without timezone conversion',
      currentImplementation: 'Using America/Los_Angeles (Pacific Time)',
    },
  };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleAuthError(error);
  }
}
