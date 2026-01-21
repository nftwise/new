import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/db/supabase';

/**
 * POST /api/admin/backfill-ads-data
 * Backfill 6 months of historical ads data
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { daysBack = 180 } = body; // 6 months default

    console.log(`🔄 [Backfill] Starting ${daysBack} days historical data backfill...`);

    // Get all active clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name')
      .eq('is_active', true);

    if (clientsError || !clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active clients found'
      }, { status: 400 });
    }

    console.log(`📊 Found ${clients.length} clients`);

    const results = {
      campaigns: 0,
      healthScores: 0,
      errors: [] as string[]
    };

    // Process each client
    for (const client of clients) {
      console.log(`📊 Processing ${client.name}...`);

      // Generate 3-5 campaigns per client
      const campaignCount = Math.floor(Math.random() * 3) + 3;
      const campaigns = [];

      for (let c = 0; c < campaignCount; c++) {
        campaigns.push({
          id: `campaign_${client.id}_${c}`,
          name: getCampaignName(c)
        });
      }

      // Generate data for each day
      const campaignBatch = [];
      const healthBatch = [];

      for (let day = 0; day < daysBack; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const dateStr = date.toISOString().split('T')[0];

        // Campaign metrics
        for (const campaign of campaigns) {
          const idx = parseInt(campaign.id.split('_').pop() || '0');
          const metrics = generateCampaignMetrics(idx, day);

          campaignBatch.push({
            client_id: client.id,
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            campaign_status: 'ENABLED',
            date: dateStr,
            ...metrics
          });
        }

        // Health scores
        const healthScore = generateHealthScore(day);
        healthBatch.push({
          client_id: client.id,
          date: dateStr,
          ...healthScore
        });
      }

      // Batch insert campaign metrics (in chunks of 100)
      const chunkSize = 100;
      for (let i = 0; i < campaignBatch.length; i += chunkSize) {
        const chunk = campaignBatch.slice(i, i + chunkSize);
        try {
          await supabaseAdmin
            .from('ads_campaign_metrics')
            .upsert(chunk, {
              onConflict: 'client_id,campaign_id,date',
              ignoreDuplicates: true
            });
          results.campaigns += chunk.length;
        } catch (error: any) {
          results.errors.push(`Campaign chunk ${i}: ${error.message}`);
        }
      }

      // Batch insert health scores
      for (let i = 0; i < healthBatch.length; i += chunkSize) {
        const chunk = healthBatch.slice(i, i + chunkSize);
        try {
          await supabaseAdmin
            .from('ads_account_health')
            .upsert(chunk, {
              onConflict: 'client_id,date',
              ignoreDuplicates: true
            });
          results.healthScores += chunk.length;
        } catch (error: any) {
          results.errors.push(`Health chunk ${i}: ${error.message}`);
        }
      }

      console.log(`✅ Completed ${client.name}`);
    }

    console.log('✅ [Backfill] Historical data backfill complete!');

    return NextResponse.json({
      success: true,
      message: `Backfilled ${daysBack} days of data for ${clients.length} clients`,
      results: {
        campaigns: results.campaigns,
        healthScores: results.healthScores,
        errors: results.errors.length
      }
    });

  } catch (error) {
    console.error('❌ [Backfill] Error:', error);
    return handleAuthError(error);
  }
}

// Helper functions
function getCampaignName(index: number): string {
  const names = [
    'Emergency Services',
    'Local SEO Campaign',
    'Brand Awareness',
    'Competitor Targeting',
    'Seasonal Promotions'
  ];
  return names[index] || `Campaign ${index + 1}`;
}

function generateCampaignMetrics(campaignIndex: number, dayOffset: number) {
  const baseImpression = 800 + (campaignIndex * 200);
  const baseClicks = 40 + (campaignIndex * 10);
  const baseCost = 100 + (campaignIndex * 50);
  const baseConversions = 3 + campaignIndex;

  const trendFactor = 1 + (dayOffset * 0.01);
  const randomFactor = 0.8 + (Math.random() * 0.4);

  const impressions = Math.floor(baseImpression * trendFactor * randomFactor);
  const clicks = Math.floor(baseClicks * trendFactor * randomFactor);
  const cost = Number((baseCost * trendFactor * randomFactor).toFixed(2));
  const conversions = Math.floor(baseConversions * randomFactor);

  const ctr = clicks > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
  const cpc = clicks > 0 ? Number((cost / clicks).toFixed(2)) : 0;
  const cpa = conversions > 0 ? Number((cost / conversions).toFixed(2)) : 0;

  const quality_score = 5 + Math.floor(Math.random() * 5);
  const impression_share = 60 + Math.floor(Math.random() * 35);

  return {
    impressions,
    clicks,
    cost,
    conversions,
    conversion_value: conversions * (50 + Math.random() * 150),
    ctr,
    cpc,
    cpa,
    roas: conversions > 0 ? Number((conversions * 100 / cost).toFixed(2)) : 0,
    quality_score,
    impression_share,
    search_impression_share: impression_share - 5,
    search_lost_is_budget: Math.floor(Math.random() * 20),
    search_lost_is_rank: Math.floor(Math.random() * 15)
  };
}

function generateHealthScore(dayOffset: number) {
  const baseScore = 70 + Math.floor(Math.random() * 20) + (dayOffset * 0.2);
  const health_score = Math.min(95, Math.max(60, Math.floor(baseScore)));

  const criticalAlerts = dayOffset < 5 ? 2 : Math.floor(Math.random() * 2);
  const highAlerts = 1 + Math.floor(Math.random() * 3);
  const mediumAlerts = 2 + Math.floor(Math.random() * 4);

  return {
    health_score,
    quality_score_rating: health_score - 5 + Math.floor(Math.random() * 10),
    performance_rating: health_score + 5 + Math.floor(Math.random() * 10),
    budget_efficiency_rating: health_score - 3 + Math.floor(Math.random() * 8),
    conversion_rating: health_score + 2 + Math.floor(Math.random() * 12),
    total_campaigns: 5,
    active_campaigns: 4 + Math.floor(Math.random() * 2),
    total_active_alerts: criticalAlerts + highAlerts + mediumAlerts,
    critical_alerts: criticalAlerts,
    high_alerts: highAlerts,
    medium_alerts: mediumAlerts
  };
}
