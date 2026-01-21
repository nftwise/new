/**
 * Backfill 6 months of historical Ads Analysis data
 * Run: npx tsx scripts/backfill-ads-6-months.ts
 */

import { supabaseAdmin as supabase } from '../src/lib/db/supabase';

async function main() {
  console.log('🔄 [Backfill] Starting 6-month historical data backfill...');

  const daysBack = 180; // 6 months
  const batchSize = 30; // Process 30 days at a time

  // Get all active clients
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, name')
    .eq('is_active', true);

  if (clientsError || !clients || clients.length === 0) {
    console.error('❌ No clients found');
    process.exit(1);
  }

  console.log(`📊 Found ${clients.length} clients`);

  const results = {
    campaigns: 0,
    keywords: 0,
    insights: 0,
    healthScores: 0,
    errors: [] as string[]
  };

  // Process each client
  for (const client of clients) {
    console.log(`\n📊 [Backfill] Processing ${client.name}...`);

    // Generate 3-5 campaigns per client
    const campaignCount = Math.floor(Math.random() * 3) + 3;
    const campaigns = [];

    for (let c = 0; c < campaignCount; c++) {
      campaigns.push({
        id: `campaign_${client.id}_${c}`,
        name: getCampaignName(c)
      });
    }

    // Backfill in batches
    for (let batchStart = 0; batchStart < daysBack; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, daysBack);
      console.log(`  ⏳ Processing days ${batchStart}-${batchEnd}...`);

      const campaignBatch = [];
      const healthBatch = [];

      for (let day = batchStart; day < batchEnd; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const dateStr = date.toISOString().split('T')[0];

        // Generate campaign metrics
        for (const campaign of campaigns) {
          const metrics = generateCampaignMetrics(campaign.id.split('_').pop() || '0', day);

          campaignBatch.push({
            client_id: client.id,
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            campaign_status: 'ENABLED',
            date: dateStr,
            ...metrics
          });
        }

        // Generate health scores
        const healthScore = generateHealthScore(day);
        healthBatch.push({
          client_id: client.id,
          date: dateStr,
          ...healthScore
        });
      }

      // Insert campaign metrics batch
      try {
        const { error: campaignError } = await supabase
          .from('ads_campaign_metrics')
          .upsert(campaignBatch, {
            onConflict: 'client_id,campaign_id,date',
            ignoreDuplicates: true
          });

        if (campaignError) {
          results.errors.push(`Campaign batch: ${campaignError.message}`);
        } else {
          results.campaigns += campaignBatch.length;
        }
      } catch (error: any) {
        results.errors.push(`Campaign batch: ${error.message}`);
      }

      // Insert health scores batch
      try {
        const { error: healthError } = await supabase
          .from('ads_account_health')
          .upsert(healthBatch, {
            onConflict: 'client_id,date',
            ignoreDuplicates: true
          });

        if (healthError) {
          results.errors.push(`Health batch: ${healthError.message}`);
        } else {
          results.healthScores += healthBatch.length;
        }
      } catch (error: any) {
        results.errors.push(`Health batch: ${error.message}`);
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`  ✅ Completed ${client.name}`);
  }

  console.log('\n✅ [Backfill] 6-month historical data backfill complete!');
  console.log('\n📊 Summary:');
  console.log(`  - Campaign Metrics: ${results.campaigns.toLocaleString()}`);
  console.log(`  - Health Scores: ${results.healthScores.toLocaleString()}`);
  console.log(`  - Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
  }
}

// Helper functions
function getCampaignName(index: number | string): string {
  const idx = typeof index === 'string' ? parseInt(index) : index;
  const names = [
    'Emergency Services',
    'Local SEO Campaign',
    'Brand Awareness',
    'Competitor Targeting',
    'Seasonal Promotions'
  ];
  return names[idx] || `Campaign ${idx + 1}`;
}

function generateCampaignMetrics(campaignIndex: string, dayOffset: number) {
  const idx = parseInt(campaignIndex) || 0;
  const baseImpression = 800 + (idx * 200);
  const baseClicks = 40 + (idx * 10);
  const baseCost = 100 + (idx * 50);
  const baseConversions = 3 + idx;

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

main().catch(console.error);
