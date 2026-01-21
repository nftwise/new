/**
 * Direct Database Seeder - Ads Analysis Demo Data
 * Run: npx tsx scripts/seed-ads-demo.ts
 */

import { supabaseAdmin as supabase } from '../src/lib/db/supabase';

async function main() {
  console.log('🌱 [Seed] Starting demo data creation...');

  const clientCount = 3;
  const daysBack = 30;

  // Get active clients
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, business_name, slug, status')
    .limit(clientCount);

  console.log('Debug - All clients:', clients);
  console.log('Debug - Error:', clientsError);

  if (clientsError || !clients || clients.length === 0) {
    console.error('❌ No clients found');
    console.error('Error details:', clientsError);
    process.exit(1);
  }

  console.log(`📊 Found ${clients.length} clients:`, clients.map(c => c.business_name));

  const results = {
    campaigns: 0,
    keywords: 0,
    insights: 0,
    healthScores: 0,
    errors: [] as string[]
  };

  // Generate data for each client
  for (const client of clients) {
    console.log(`\n📊 [Seed] Processing ${client.business_name}...`);

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
          await supabase
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
      const keywordCount = 10;
      for (let k = 0; k < keywordCount; k++) {
        const keyword = getKeywordName(campaignName, k);
        const date = new Date().toISOString().split('T')[0];
        const keywordMetrics = generateKeywordMetrics();

        try {
          await supabase
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
        await supabase
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
        await supabase
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

  console.log('\n✅ [Seed] Demo data created successfully!');
  console.log('\n📊 Results:');
  console.log(`  - Campaigns: ${results.campaigns}`);
  console.log(`  - Keywords: ${results.keywords}`);
  console.log(`  - Insights: ${results.insights}`);
  console.log(`  - Health Scores: ${results.healthScores}`);
  console.log(`  - Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(err => console.log(`  - ${err}`));
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
  const keywords: Record<string, string[]> = {
    'Emergency Services': ['emergency chiropractor', 'urgent back pain', 'same day appointment'],
    'Local SEO Campaign': ['chiropractor near me', 'best chiropractor', 'spine specialist'],
    'Brand Awareness': ['dr smith chiropractor', 'smith chiropractic clinic'],
    'Competitor Targeting': ['alternative to clinic x', 'better than clinic y'],
    'Seasonal Promotions': ['new patient special', 'spring wellness', 'back to school']
  };

  const baseKeywords = keywords[campaignName] || ['keyword 1', 'keyword 2', 'keyword 3'];
  return baseKeywords[index % baseKeywords.length] || `keyword ${index + 1}`;
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

function generateKeywordMetrics() {
  const impressions = 50 + Math.floor(Math.random() * 200);
  const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.08));
  const cost = Number((clicks * (1 + Math.random() * 4)).toFixed(2));
  const conversions = Math.floor(clicks * (0.05 + Math.random() * 0.15));

  return {
    impressions,
    clicks,
    cost,
    conversions,
    ctr: clicks > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
    cpc: clicks > 0 ? Number((cost / clicks).toFixed(2)) : 0,
    cpa: conversions > 0 ? Number((cost / conversions).toFixed(2)) : 0,
    quality_score: 4 + Math.floor(Math.random() * 7)
  };
}

function generateInsights(clientId: string, campaignCount: number) {
  const insights = [];

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

main().catch(console.error);
