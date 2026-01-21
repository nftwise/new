import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/db/supabase';

/**
 * GET /api/admin/ads-data-status
 * Check status of ads analysis data
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Count records
    const { count: campaignCount } = await supabaseAdmin
      .from('ads_campaign_metrics')
      .select('*', { count: 'exact', head: true });

    const { count: healthCount } = await supabaseAdmin
      .from('ads_account_health')
      .select('*', { count: 'exact', head: true });

    const { count: insightCount } = await supabaseAdmin
      .from('ads_insights')
      .select('*', { count: 'exact', head: true });

    const { count: keywordCount } = await supabaseAdmin
      .from('ads_keyword_metrics')
      .select('*', { count: 'exact', head: true });

    // Get date ranges
    const { data: campaignRange } = await supabaseAdmin
      .from('ads_campaign_metrics')
      .select('date')
      .order('date', { ascending: true })
      .limit(1);

    const { data: campaignLatest } = await supabaseAdmin
      .from('ads_campaign_metrics')
      .select('date')
      .order('date', { ascending: false })
      .limit(1);

    // Get client breakdown
    const { data: clientBreakdown } = await supabaseAdmin
      .from('ads_campaign_metrics')
      .select('client_id, clients(name)')
      .then(result => {
        if (result.data) {
          const grouped = result.data.reduce((acc: any, row: any) => {
            const clientName = row.clients?.name || 'Unknown';
            acc[clientName] = (acc[clientName] || 0) + 1;
            return acc;
          }, {});
          return { data: Object.entries(grouped).map(([name, count]) => ({ name, count })) };
        }
        return { data: [] };
      });

    const earliestDate = campaignRange?.[0]?.date || null;
    const latestDate = campaignLatest?.[0]?.date || null;
    const daysOfData = earliestDate && latestDate
      ? Math.floor((new Date(latestDate).getTime() - new Date(earliestDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        recordCounts: {
          campaigns: campaignCount || 0,
          healthScores: healthCount || 0,
          insights: insightCount || 0,
          keywords: keywordCount || 0,
          total: (campaignCount || 0) + (healthCount || 0) + (insightCount || 0) + (keywordCount || 0)
        },
        dateRange: {
          earliest: earliestDate,
          latest: latestDate,
          daysOfData
        },
        clientBreakdown: clientBreakdown || [],
        status: {
          hasCampaigns: (campaignCount || 0) > 0,
          hasHealthScores: (healthCount || 0) > 0,
          hasInsights: (insightCount || 0) > 0,
          isComplete: (campaignCount || 0) > 0 && (healthCount || 0) > 0
        }
      }
    });
  } catch (error) {
    console.error('Error checking ads data status:', error);
    return handleAuthError(error);
  }
}
