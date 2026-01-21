import { NextRequest, NextResponse } from 'next/server';
import { CallRailConnector } from '@/lib/api/callrail';
import { getTimeRangeDates } from '@/lib/utils/utils';
import { getClientConfig } from '@/lib/utils/server-utils';

/**
 * GET /api/callrail
 * Fetch CallRail data (calls, overview, etc.)
 * No cache - KISS approach
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7days';
    const report = searchParams.get('report') || searchParams.get('type') || 'calls';
    const clientId = searchParams.get('clientId');

    // Support both period-based and direct date parameters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const timeRange = (startDateParam && endDateParam)
      ? { startDate: startDateParam, endDate: endDateParam, period: period as any }
      : getTimeRangeDates(period);

    // Get client-specific configuration
    const clientConfig = clientId ? await getClientConfig(clientId) : null;
    const callrailAccountId = clientConfig?.callrailAccountId;

    const connector = new CallRailConnector();

    let result;

    switch (report) {
      case 'status':
        if (!process.env.CALLRAIL_API_TOKEN && !process.env.CALLRAIL_API_KEY) {
          throw new Error('Missing CallRail API credentials');
        }
        result = { data: { status: 'connected' } };
        break;

      case 'calls':
      case 'overview':
        result = await connector.getCallsReport(timeRange, callrailAccountId);
        break;

      case 'calls-by-day':
        result = await connector.getCallsByDay(timeRange, callrailAccountId);
        break;

      case 'calls-by-source':
        result = await connector.getCallsBySource(timeRange, callrailAccountId);
        break;

      case 'recent-calls':
        result = await connector.getRecentCalls(timeRange, callrailAccountId);
        break;

      default:
        return NextResponse.json({ success: false, error: `Unknown report type: ${report}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error: any) {
    console.error('[CallRail API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
