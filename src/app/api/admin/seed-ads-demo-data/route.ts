import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/db/supabase';

/**
 * POST /api/admin/seed-ads-demo-data
 * Create demo data for Ads Analysis module testing
 *
 * Body: {
 *   clientCount?: number (default: 3)
 *   daysBack?: number (default: 30)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const body = await request.json();
    const { clientCount = 3, daysBack = 30 } = body;

    console.log(`🌱 [Seed] Creating demo data for ${clientCount} clients, ${daysBack} days back`);

    // Get first N clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name, slug')
      .eq('is_active', true)
      .limit(clientCount);

    if (clientsError || !clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active clients found. Please create clients first.'
      }, { status: 400 });
    }

    const results = {
      campaigns: 0,
      keywords: 0,
      insights: 0,
      healthScores: 0,
      errors: [] as string[]
    };

    // Generate data for each client
    for (const client of clients) {
      console.log(`📊 [Seed] Generating data for ${client.name}...`);

      // Generate 3-5 campaigns per client
      const campaignCount = Math.floor(Math.random() * 3) + 3;

      for (let c = 0; c < campaignCount; c++) {
        const campaignId = `campaign_${client.id}_${c}`;
        const campaignName = getCampaignName(c);

        // Generate daily metrics for each campaign
        for (let day = 0; day < daysBack; day++) {
          const date = new Date();
          date.setDate(date.getDate() - day);
          const dateStr = date.toISOString().split('T')[0];

          const metrics = generateCampaignMetrics(c, day);

          try {
            await supabaseAdmin
              .from('ads_campaign_metrics')
              .upsert({
                client_id: client.id,
                campaign_id: campaignId,
                campaign_name: campaignName,
                campaign_status: 'ENABLED',
                date: dateStr,
                ...metrics
              }, {
                onConflict: 'client_id,campaign_id,date'
              });

            results.campaigns++;
          } catch (error: any) {
            results.errors.push(`Campaign ${campaignName}: ${error.message}`);
          }
        }

        // Generate top keywords for each campaign
        const keywordCount = 10; // Top 10 keywords
        for (let k = 0; k < keywordCount; k++) {
          const keyword = getKeywordName(campaignName, k);
          const date = new Date().toISOString().split('T')[0];
          const keywordMetrics = generateKeywordMetrics();

          try {
            await supabaseAdmin
              .from('ads_keyword_metrics')
              .upsert({
                client_id: client.id,
                campaign_id: campaignId,
                keyword,
                match_type: ['EXACT', 'PHRASE', 'BROAD'][Math.floor(Math.random() * 3)],
                date,
                ...keywordMetrics
              }, {
                onConflict: 'client_id,campaign_id,keyword,date'
              });

            results.keywords++;
          } catch (error: any) {
            results.errors.push(`Keyword ${keyword}: ${error.message}`);
          }
        }
      }

      // Generate insights for this client
      const insights = generateInsights(client.id, campaignCount);
      for (const insight of insights) {
        try {
          await supabaseAdmin
            .from('ads_insights')
            .insert(insight);

          results.insights++;
        } catch (error: any) {
          results.errors.push(`Insight: ${error.message}`);
        }
      }

      // Generate daily health scores
      for (let day = 0; day < daysBack; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const dateStr = date.toISOString().split('T')[0];

        const healthScore = generateHealthScore(day);

        try {
          await supabaseAdmin
            .from('ads_account_health')
            .upsert({
              client_id: client.id,
              date: dateStr,
              ...healthScore
            }, {
              onConflict: 'client_id,date'
            });

          results.healthScores++;
        } catch (error: any) {
          results.errors.push(`Health score: ${error.message}`);
        }
      }
    }

    console.log(`✅ [Seed] Demo data created successfully!`);

    return NextResponse.json({
      success: true,
      message: `Created demo data for ${clients.length} clients`,
      clients: clients.map(c => ({ id: c.id, name: c.name })),
      results,
      summary: {
        totalCampaigns: results.campaigns,
        totalKeywords: results.keywords,
        totalInsights: results.insights,
        totalHealthScores: results.healthScores,
        errors: results.errors.length
      }
    });

  } catch (error) {
    console.error('❌ [Seed] Error creating demo data:', error);
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

function getKeywordName(campaignName: string, index: number): string {
  const keywords = {
    'Emergency Services': ['emergency chiropractor', 'urgent back pain', 'same day appointment'],
    'Local SEO Campaign': ['chiropractor near me', 'best chiropractor', 'spine specialist'],
    'Brand Awareness': ['dr smith chiropractor', 'smith chiropractic clinic'],
    'Competitor Targeting': ['alternative to clinic x', 'better than clinic y'],
    'Seasonal Promotions': ['new patient special', 'spring wellness', 'back to school']
  };

  const baseKeywords = keywords[campaignName as keyof typeof keywords] ||
    ['keyword 1', 'keyword 2', 'keyword 3'];

  return baseKeywords[index % baseKeywords.length] || `keyword ${index + 1}`;
}

function generateCampaignMetrics(campaignIndex: number, dayOffset: number) {
  // Vary metrics based on campaign type and recency
  const baseImpression = 800 + (campaignIndex * 200);
  const baseClicks = 40 + (campaignIndex * 10);
  const baseCost = 100 + (campaignIndex * 50);
  const baseConversions = 3 + campaignIndex;

  // Add some randomness and trend
  const trendFactor = 1 + (dayOffset * 0.01); // Slight increase over time
  const randomFactor = 0.8 + (Math.random() * 0.4); // ±20% variance

  const impressions = Math.floor(baseImpression * trendFactor * randomFactor);
  const clicks = Math.floor(baseClicks * trendFactor * randomFactor);
  const cost = Number((baseCost * trendFactor * randomFactor).toFixed(2));
  const conversions = Math.floor(baseConversions * randomFactor);

  const ctr = clicks > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
  const cpc = clicks > 0 ? Number((cost / clicks).toFixed(2)) : 0;
  const cpa = conversions > 0 ? Number((cost / conversions).toFixed(2)) : 0;

  const quality_score = 5 + Math.floor(Math.random() * 5); // 5-10
  const impression_share = 60 + Math.floor(Math.random() * 35); // 60-95%

  return {
    impressions,
    clicks,
    cost,
    conversions,
    conversion_value: conversions * (50 + Math.random() * 150), // $50-$200 per conversion
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

function generateKeywordMetrics() {
  const impressions = 50 + Math.floor(Math.random() * 200);
  const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.08)); // 2-10% CTR
  const cost = Number((clicks * (1 + Math.random() * 4)).toFixed(2)); // $1-5 CPC
  const conversions = Math.floor(clicks * (0.05 + Math.random() * 0.15)); // 5-20% conv rate

  return {
    impressions,
    clicks,
    cost,
    conversions,
    ctr: clicks > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
    cpc: clicks > 0 ? Number((cost / clicks).toFixed(2)) : 0,
    cpa: conversions > 0 ? Number((cost / conversions).toFixed(2)) : 0,
    quality_score: 4 + Math.floor(Math.random() * 7) // 4-10
  };
}

function generateInsights(clientId: string, campaignCount: number) {
  const insights = [];

  // Always add 1-2 critical insights
  insights.push({
    client_id: clientId,
    campaign_id: `campaign_${clientId}_0`,
    insight_type: 'critical',
    severity: 'critical',
    category: 'conversions',
    title: 'Zero Conversions Alert',
    description: 'Campaign has received 0 conversions in the last 7 days despite $450 in spend.',
    suggested_action: 'Review landing page, check conversion tracking, or pause campaign to prevent wasted budget.',
    metric_name: 'conversions',
    metric_value: 0,
    threshold_value: 1,
    impact_estimate: 450,
    status: 'active'
  });

  // Add 2-3 warnings
  insights.push({
    client_id: clientId,
    campaign_id: `campaign_${clientId}_1`,
    insight_type: 'warning',
    severity: 'high',
    category: 'quality_score',
    title: 'Low Quality Score Detected',
    description: 'Quality Score dropped from 7 to 4 over the past 2 weeks.',
    suggested_action: 'Improve ad relevance, landing page experience, and expected CTR.',
    metric_name: 'quality_score',
    metric_value: 4,
    threshold_value: 7,
    impact_estimate: 200,
    status: 'active'
  });

  insights.push({
    client_id: clientId,
    campaign_id: `campaign_${clientId}_2`,
    insight_type: 'warning',
    severity: 'medium',
    category: 'ctr',
    title: 'Below Average CTR',
    description: 'CTR is 1.8%, below industry average of 3-5%.',
    suggested_action: 'Test new ad copy, add extensions, or refine keyword targeting.',
    metric_name: 'ctr',
    metric_value: 1.8,
    threshold_value: 3.0,
    impact_estimate: 150,
    status: 'active'
  });

  // Add 1-2 opportunities
  insights.push({
    client_id: clientId,
    insight_type: 'opportunity',
    severity: 'medium',
    category: 'impression_share',
    title: 'Lost Impression Share',
    description: 'Losing 35% of impression share due to budget constraints.',
    suggested_action: 'Consider increasing daily budget to capture more traffic.',
    metric_name: 'impression_share',
    metric_value: 65,
    threshold_value: 80,
    impact_estimate: 300,
    status: 'active'
  });

  return insights;
}

function generateHealthScore(dayOffset: number) {
  // Trend: slightly improving over time
  const basScore = 70 + Math.floor(Math.random() * 20) + (dayOffset * 0.2);
  const health_score = Math.min(95, Math.max(60, Math.floor(basScore)));

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

/**
 * DELETE /api/admin/seed-ads-demo-data
 * Clean up all demo data
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    console.log('🧹 [Seed] Cleaning up demo data...');

    const results = {
      campaigns: 0,
      keywords: 0,
      insights: 0,
      healthScores: 0,
      adGroups: 0
    };

    // Delete all ads analysis data
    const { error: campaignError, count: campaignCount } = await supabaseAdmin
      .from('ads_campaign_metrics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    const { error: keywordError, count: keywordCount } = await supabaseAdmin
      .from('ads_keyword_metrics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: insightError, count: insightCount } = await supabaseAdmin
      .from('ads_insights')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: healthError, count: healthCount } = await supabaseAdmin
      .from('ads_account_health')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: adGroupError, count: adGroupCount } = await supabaseAdmin
      .from('ads_ad_group_metrics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    results.campaigns = campaignCount || 0;
    results.keywords = keywordCount || 0;
    results.insights = insightCount || 0;
    results.healthScores = healthCount || 0;
    results.adGroups = adGroupCount || 0;

    console.log('✅ [Seed] Cleanup complete!');

    return NextResponse.json({
      success: true,
      message: 'Demo data cleaned up successfully',
      deleted: results
    });

  } catch (error) {
    return handleAuthError(error);
  }
}
