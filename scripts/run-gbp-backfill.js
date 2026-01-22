#!/usr/bin/env node

/**
 * GBP Backfill Script
 * Runs GBP backfill for a date range via the API
 *
 * Usage: node scripts/run-gbp-backfill.js [startDate] [endDate]
 * Example: node scripts/run-gbp-backfill.js 2025-01-01 2026-01-21
 */

const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.API_URL || 'https://ultimate-report-dashboard-main.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET || 'backfill-secret-2025-secure-key';

// Default date range
const defaultEndDate = new Date();
defaultEndDate.setDate(defaultEndDate.getDate() - 1);

const defaultStartDate = new Date('2025-01-01');

const args = process.argv.slice(2);
const startDate = args[0] || defaultStartDate.toISOString().split('T')[0];
const endDate = args[1] || defaultEndDate.toISOString().split('T')[0];

console.log('='.repeat(60));
console.log('🌐 GBP BACKFILL SCRIPT');
console.log('='.repeat(60));
console.log(`📅 Date Range: ${startDate} to ${endDate}`);
console.log(`🔗 API: ${API_URL}/api/admin/run-gbp-backfill`);
console.log('');

async function makeRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (url.startsWith('https') ? 443 : 80),
      path: urlObj.pathname,
      method: options.method || 'POST',
      headers: options.headers || {},
      timeout: 300000, // 5 minutes timeout
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runBackfill() {
  const start = Date.now();

  try {
    console.log('📤 Sending request to API...');
    console.log('⏳ This may take several minutes for large date ranges...');
    console.log('');

    const response = await makeRequest(
      `${API_URL}/api/admin/run-gbp-backfill`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        startDate,
        endDate,
        secret: CRON_SECRET,
      }
    );

    const duration = ((Date.now() - start) / 1000).toFixed(1);

    if (response.status === 200 && response.data?.success) {
      console.log('✅ BACKFILL COMPLETED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log(`📊 Total Days: ${response.data.totalDays}`);
      console.log(`👥 Total Clients: ${response.data.totalClients}`);
      console.log(`📈 Total Records: ${response.data.totalRecords}`);
      console.log(`⏱️  Duration: ${duration}s`);

      if (response.data.details && response.data.details.length > 0) {
        console.log('');
        console.log('📋 Daily Summary:');
        response.data.details.forEach(d => {
          console.log(`   ${d.date}: ${d.clients} clients`);
        });
      }
    } else {
      console.log('❌ BACKFILL FAILED');
      console.log('='.repeat(60));
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${response.data?.error || JSON.stringify(response.data)}`);
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

// Run
runBackfill();
