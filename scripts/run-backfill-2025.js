/**
 * BACKFILL SCRIPT - 01/01/2025 to 20/01/2026
 *
 * Run this script to backfill 385 days of data for all clients
 *
 * Usage:
 *   cd ultimate-report-dashboard-main
 *   node scripts/run-backfill-2025.js
 *
 * Or with specific date range:
 *   node scripts/run-backfill-2025.js 2025-06-01 2025-06-30
 */

const START_DATE = process.argv[2] || '2025-01-01';
const END_DATE = process.argv[3] || '2026-01-20';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'backfill-secret-2025-secure-key';
const DELAY_BETWEEN_DAYS_MS = 2000; // 2 seconds between each day

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

async function runRollupForDate(date) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/run-rollup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, secret: CRON_SECRET }),
    });

    const result = await response.json();
    return { date, success: result.success, error: result.error };
  } catch (error) {
    return { date, success: false, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 BACKFILL SCRIPT - 2025 DATA');
  console.log('='.repeat(60));
  console.log(`📅 Date range: ${START_DATE} → ${END_DATE}`);
  console.log(`🌐 API URL: ${BASE_URL}`);
  console.log('');

  const dates = getDateRange(START_DATE, END_DATE);
  console.log(`📊 Total days to process: ${dates.length}`);
  console.log('');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  const errors = [];

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

      const result = await runRollupForDate(date);

      if (result.success) {
        successCount++;
        console.log('✅');
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
  console.log('🏁 BACKFILL COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}/${dates.length}`);
  console.log(`❌ Failed: ${failCount}/${dates.length}`);
  console.log(`⏱️  Total time: ${totalTime} minutes`);

  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.forEach(e => console.log(`   - ${e.date}: ${e.error}`));
  }

  console.log('\n✅ Done!');
}

// Check if running directly
main().catch(console.error);
