/**
 * CAMPAIGN DATA BACKFILL SCRIPT - 01/01/2025 to 21/01/2026
 *
 * Backfills 7 campaign analytics tables:
 * - campaign_settings
 * - campaign_search_terms
 * - campaign_geo_performance
 * - campaign_schedule_performance
 * - campaign_quality_scores
 * - campaign_conversion_actions
 * - campaign_ai_alerts
 *
 * Usage:
 *   cd ultimate-report-dashboard-main
 *   node scripts/run-campaign-backfill.js
 *
 * Or with specific date range:
 *   node scripts/run-campaign-backfill.js 2025-06-01 2025-06-30
 *
 * Run in background:
 *   nohup node scripts/run-campaign-backfill.js > backfill-campaign.log 2>&1 &
 */

const START_DATE = process.argv[2] || '2025-01-01';
const END_DATE = process.argv[3] || '2026-01-21';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ultimate-report-dashboard-main.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET || 'backfill-secret-2025-secure-key';
const DELAY_BETWEEN_DAYS_MS = 3000; // 3 seconds between each day (API rate limit)

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

async function runCampaignRollupForDate(date) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/run-campaign-rollup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, secret: CRON_SECRET }),
    });

    const result = await response.json();
    return {
      date,
      success: result.success,
      data: result.data,
      error: result.error
    };
  } catch (error) {
    return { date, success: false, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 CAMPAIGN DATA BACKFILL SCRIPT');
  console.log('='.repeat(60));
  console.log(`📅 Date range: ${START_DATE} → ${END_DATE}`);
  console.log(`🌐 API URL: ${BASE_URL}`);
  console.log('');
  console.log('📊 Tables being populated:');
  console.log('   - campaign_settings');
  console.log('   - campaign_search_terms');
  console.log('   - campaign_geo_performance');
  console.log('   - campaign_schedule_performance');
  console.log('   - campaign_quality_scores');
  console.log('   - campaign_conversion_actions');
  console.log('   - campaign_ai_alerts');
  console.log('');

  const dates = getDateRange(START_DATE, END_DATE);
  console.log(`📊 Total days to process: ${dates.length}`);
  console.log('');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  const errors = [];
  const totals = {
    settings: 0,
    searchTerms: 0,
    geo: 0,
    schedule: 0,
    quality: 0,
    conversions: 0,
    alerts: 0,
  };

  // Process in batches of 7 days (weekly batches)
  const BATCH_SIZE = 7;

  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const batch = dates.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(dates.length / BATCH_SIZE);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches}: ${batch[0]} → ${batch[batch.length - 1]}`);

    // Process each day in batch sequentially
    for (const date of batch) {
      process.stdout.write(`   ${date}... `);

      const result = await runCampaignRollupForDate(date);

      if (result.success) {
        successCount++;
        const data = result.data || {};
        totals.settings += data.settings || 0;
        totals.searchTerms += data.searchTerms || 0;
        totals.geo += data.geo || 0;
        totals.schedule += data.schedule || 0;
        totals.quality += data.quality || 0;
        totals.conversions += data.conversions || 0;
        totals.alerts += data.alerts || 0;

        const recordCount = Object.values(data).reduce((a, b) => a + (b || 0), 0);
        console.log(`✅ (${recordCount} records)`);
      } else {
        failCount++;
        console.log(`❌ ${result.error || 'Unknown error'}`);
        errors.push({ date, error: result.error });
      }

      // Delay between days
      await sleep(DELAY_BETWEEN_DAYS_MS);
    }

    // Progress update
    const progress = Math.round(((i + batch.length) / dates.length) * 100);
    const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
    const remaining = Math.round(((dates.length - i - batch.length) * DELAY_BETWEEN_DAYS_MS) / 1000 / 60);

    console.log(`   📈 Progress: ${progress}% | Elapsed: ${elapsed}m | Remaining: ~${remaining}m`);
  }

  // Summary
  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);

  console.log('\n' + '='.repeat(60));
  console.log('🏁 CAMPAIGN BACKFILL COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}/${dates.length} days`);
  console.log(`❌ Failed: ${failCount}/${dates.length} days`);
  console.log(`⏱️  Total time: ${totalTime} minutes`);
  console.log('');
  console.log('📊 Total records saved:');
  console.log(`   - Settings: ${totals.settings}`);
  console.log(`   - Search Terms: ${totals.searchTerms}`);
  console.log(`   - Geo Performance: ${totals.geo}`);
  console.log(`   - Schedule Performance: ${totals.schedule}`);
  console.log(`   - Quality Scores: ${totals.quality}`);
  console.log(`   - Conversion Actions: ${totals.conversions}`);
  console.log(`   - AI Alerts: ${totals.alerts}`);

  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.slice(0, 10).forEach(e => console.log(`   - ${e.date}: ${e.error}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more`);
    }
  }

  console.log('\n✅ Done!');
}

// Check if running directly
main().catch(console.error);
