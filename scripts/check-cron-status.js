#!/usr/bin/env node

/**
 * CRON JOB STATUS CHECKER
 *
 * Checks:
 * 1. If cron jobs are running on Vercel
 * 2. Latest data in database
 * 3. GBP backfill status
 * 4. API endpoints availability
 *
 * Usage: node scripts/check-cron-status.js
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.API_URL || 'https://ultimate-report-dashboard-main.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET || 'backfill-secret-2025-secure-key';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║        🔍 CRON JOB STATUS CHECKER                          ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`🌐 API URL: ${API_URL}`);
console.log(`⏰ Check Time: ${new Date().toISOString()}`);
console.log('');

// Helper to make HTTP requests
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (url.startsWith('https') ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRON_SECRET}`,
        ...options.headers,
      },
      timeout: 10000,
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function checkCronStatus() {
  const checks = {
    apiHealth: false,
    healthCheck: false,
    rollupAccess: false,
    gbpBackfillAccess: false,
    dbConnectivity: false,
  };

  const results = [];

  // ============================================
  // CHECK 1: API Health
  // ============================================
  console.log('1️⃣  Checking API Health...');
  try {
    const response = await makeRequest(`${API_URL}/api/health`);
    checks.apiHealth = response.status === 200;
    results.push({
      check: 'API Health',
      status: checks.apiHealth ? '✅ OK' : `⚠️  Status ${response.status}`,
      details: response.status
    });
  } catch (error) {
    results.push({
      check: 'API Health',
      status: '❌ Failed',
      details: error.message
    });
  }
  console.log('');

  // ============================================
  // CHECK 2: Health Check Endpoint
  // ============================================
  console.log('2️⃣  Checking Health Check Endpoint...');
  try {
    const response = await makeRequest(`${API_URL}/api/admin/health-check`, {
      headers: { 'Authorization': `Bearer ${CRON_SECRET}` }
    });
    checks.healthCheck = response.status === 200;
    const data = response.data;

    if (checks.healthCheck) {
      console.log(`   Status: ${data.status}`);
      if (data.checks) {
        console.log(`   • Database: ${data.checks.database ? '✅' : '❌'}`);
        console.log(`   • Rollup: ${data.checks.rollup ? '✅' : '❌'}`);
        console.log(`   • Environment: ${data.checks.environment ? '✅' : '❌'}`);
      }
      if (data.issues && data.issues.length > 0) {
        console.log(`   ⚠️  Issues: ${data.issues.join(', ')}`);
      }
      if (data.warnings && data.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${data.warnings.join(', ')}`);
      }
    }

    results.push({
      check: 'Health Check Endpoint',
      status: checks.healthCheck ? '✅ OK' : `⚠️  Status ${response.status}`,
      details: data.status || 'unknown'
    });
  } catch (error) {
    results.push({
      check: 'Health Check Endpoint',
      status: '❌ Failed',
      details: error.message
    });
  }
  console.log('');

  // ============================================
  // CHECK 3: Rollup Endpoint Access
  // ============================================
  console.log('3️⃣  Checking Rollup Endpoint Access...');
  try {
    const response = await makeRequest(`${API_URL}/api/admin/run-rollup`, {
      headers: { 'Authorization': `Bearer ${CRON_SECRET}` }
    });
    checks.rollupAccess = response.status === 200 || response.status === 401;

    if (response.status === 200) {
      console.log('   ✅ Endpoint accessible');
      console.log(`   Last run: ${response.data.timestamp || 'unknown'}`);
    } else {
      console.log(`   ⚠️  Status ${response.status}`);
    }

    results.push({
      check: 'Rollup Endpoint',
      status: checks.rollupAccess ? '✅ OK' : `❌ Status ${response.status}`,
      details: response.status
    });
  } catch (error) {
    results.push({
      check: 'Rollup Endpoint',
      status: '❌ Failed',
      details: error.message
    });
  }
  console.log('');

  // ============================================
  // CHECK 4: GBP Backfill Endpoint Access
  // ============================================
  console.log('4️⃣  Checking GBP Backfill Endpoint...');
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const response = await makeRequest(`${API_URL}/api/admin/run-gbp-backfill`, {
      method: 'POST',
      body: {
        startDate: dateStr,
        endDate: dateStr,
        secret: CRON_SECRET,
      }
    });

    checks.gbpBackfillAccess = response.status === 200 || response.status === 401;

    if (response.status === 200) {
      console.log('   ✅ Endpoint accessible');
      console.log(`   GBP Clients: ${response.data.totalClients || 0}`);
      console.log(`   Records: ${response.data.totalRecords || 0}`);
    } else {
      console.log(`   ⚠️  Status ${response.status}`);
    }

    results.push({
      check: 'GBP Backfill Endpoint',
      status: checks.gbpBackfillAccess ? '✅ OK' : `❌ Status ${response.status}`,
      details: response.status
    });
  } catch (error) {
    results.push({
      check: 'GBP Backfill Endpoint',
      status: '❌ Failed',
      details: error.message
    });
  }
  console.log('');

  // ============================================
  // CHECK 5: Test Data Fetch
  // ============================================
  console.log('5️⃣  Testing Data Fetch (Dashboard API)...');
  try {
    const response = await makeRequest(`${API_URL}/api/admin/overview-fast?period=7days`);
    checks.dbConnectivity = response.status === 200;

    if (response.status === 200) {
      const data = response.data;
      console.log('   ✅ Data accessible');
      console.log(`   Clients: ${data.clients?.length || 0}`);
      console.log(`   Latest Date: ${data.dateRange?.endDate || 'unknown'}`);
    } else {
      console.log(`   ⚠️  Status ${response.status}`);
    }

    results.push({
      check: 'Data Connectivity',
      status: checks.dbConnectivity ? '✅ OK' : `⚠️  Status ${response.status}`,
      details: response.status
    });
  } catch (error) {
    results.push({
      check: 'Data Connectivity',
      status: '❌ Failed',
      details: error.message
    });
  }
  console.log('');

  // ============================================
  // SUMMARY REPORT
  // ============================================
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    📋 SUMMARY REPORT                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const table = results.map(r => ({
    Check: r.check,
    Status: r.status,
    Details: r.details || '-'
  }));

  console.table(table);

  // ============================================
  // OVERALL STATUS
  // ============================================
  const passedChecks = Object.values(checks).filter(v => v).length;
  const totalChecks = Object.keys(checks).length;
  const healthScore = Math.round((passedChecks / totalChecks) * 100);

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log(`║  HEALTH SCORE: ${healthScore}% (${passedChecks}/${totalChecks} checks passed)`);
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  if (healthScore === 100) {
    console.log('✅ All systems operational! Cron jobs should be running.');
  } else if (healthScore >= 80) {
    console.log('⚠️  Most systems operational, but some issues detected.');
  } else if (healthScore >= 50) {
    console.log('❌ Multiple issues detected. Cron jobs may not be working properly.');
  } else {
    console.log('🔴 Critical issues. Cron jobs are likely not running.');
  }

  console.log('');
  console.log('📝 RECOMMENDATIONS:');
  console.log('──────────────────────────────────────────────────────────────');

  if (!checks.rollupAccess) {
    console.log('❌ Rollup endpoint not accessible:');
    console.log('   • Check if /api/admin/run-rollup is implemented');
    console.log('   • Verify CRON_SECRET environment variable');
    console.log('');
  }

  if (!checks.gbpBackfillAccess) {
    console.log('❌ GBP backfill endpoint not accessible:');
    console.log('   • Check if /api/admin/run-gbp-backfill is implemented');
    console.log('   • Verify GBP OAuth tokens are configured');
    console.log('');
  }

  if (!checks.healthCheck) {
    console.log('❌ Health check endpoint not accessible:');
    console.log('   • Check if /api/admin/health-check is implemented');
    console.log('   • Verify authentication headers');
    console.log('');
  }

  if (!checks.dbConnectivity) {
    console.log('❌ Database connectivity issues:');
    console.log('   • Check Supabase connection');
    console.log('   • Verify service role key in environment');
    console.log('   • Check if client_metrics_summary table exists');
    console.log('');
  }

  console.log('');
  console.log('🔗 NEXT STEPS:');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('1. Check Vercel logs: https://vercel.com/dashboard');
  console.log('2. Verify .env variables in Vercel project settings');
  console.log('3. Run manual cron: POST /api/admin/run-rollup');
  console.log('4. Check database for recent records');
  console.log('');
}

// Run the checks
checkCronStatus().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
