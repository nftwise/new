#!/usr/bin/env node

/**
 * GBP Backfill Script - Local Version
 * Runs GBP backfill directly using environment variables
 *
 * Usage: node scripts/run-gbp-backfill-local.js [startDate] [endDate]
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Default dates
const args = process.argv.slice(2);
const startDate = args[0] || '2025-01-01';
const endDate = args[1] || new Date(Date.now() - 86400000).toISOString().split('T')[0];

console.log('='.repeat(60));
console.log('🌐 GBP BACKFILL SCRIPT (LOCAL)');
console.log('='.repeat(60));
console.log(`📅 Date Range: ${startDate} to ${endDate}`);
console.log('');

// GBP Token Manager
async function getGBPToken() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'gbp_agency_master')
    .single();

  if (error || !data) {
    console.log('❌ No GBP token found in database');
    return null;
  }

  const token = JSON.parse(data.value);

  // Check if expired
  if (token.expiry_date < Date.now()) {
    console.log('⚠️ Token expired, attempting refresh...');
    return await refreshGBPToken(token);
  }

  return token.access_token;
}

async function refreshGBPToken(storedToken) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: storedToken.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    console.log('❌ Token refresh failed');
    return null;
  }

  const data = await response.json();

  // Save new token
  const newToken = {
    access_token: data.access_token,
    refresh_token: storedToken.refresh_token,
    expiry_date: Date.now() + (data.expires_in * 1000),
    email: storedToken.email,
  };

  await supabase
    .from('system_settings')
    .upsert({
      key: 'gbp_agency_master',
      value: JSON.stringify(newToken),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

  console.log('✅ Token refreshed');
  return data.access_token;
}

// Fetch GBP metrics
async function fetchGBPMetrics(locationId, token, date) {
  const start = new Date(date);
  const end = new Date(date);

  // Normalize location ID
  let normalizedId = locationId;
  if (locationId.includes('/locations/')) {
    normalizedId = `locations/${locationId.split('/locations/')[1]}`;
  } else if (!locationId.startsWith('locations/')) {
    normalizedId = `locations/${locationId}`;
  }

  const metrics = [
    'WEBSITE_CLICKS',
    'BUSINESS_DIRECTION_REQUESTS',
    'CALL_CLICKS',
    'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
    'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
    'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
    'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
  ];

  const result = {
    gbp_calls: 0,
    gbp_website_clicks: 0,
    gbp_directions: 0,
    gbp_profile_views: 0,
  };

  for (const metric of metrics) {
    try {
      const url = new URL(`https://businessprofileperformance.googleapis.com/v1/${normalizedId}:getDailyMetricsTimeSeries`);
      url.searchParams.set('dailyMetric', metric);
      url.searchParams.set('dailyRange.start_date.year', start.getFullYear().toString());
      url.searchParams.set('dailyRange.start_date.month', (start.getMonth() + 1).toString());
      url.searchParams.set('dailyRange.start_date.day', start.getDate().toString());
      url.searchParams.set('dailyRange.end_date.year', end.getFullYear().toString());
      url.searchParams.set('dailyRange.end_date.month', (end.getMonth() + 1).toString());
      url.searchParams.set('dailyRange.end_date.day', end.getDate().toString());

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const value = (data.timeSeries?.datedValues || [])
        .reduce((sum, d) => sum + (parseInt(d.value) || 0), 0);

      switch (metric) {
        case 'CALL_CLICKS':
          result.gbp_calls = value;
          break;
        case 'WEBSITE_CLICKS':
          result.gbp_website_clicks = value;
          break;
        case 'BUSINESS_DIRECTION_REQUESTS':
          result.gbp_directions = value;
          break;
        case 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS':
        case 'BUSINESS_IMPRESSIONS_MOBILE_MAPS':
        case 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH':
        case 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH':
          result.gbp_profile_views += value;
          break;
      }
    } catch (e) {
      // Ignore individual metric errors
    }
  }

  return result;
}

// Main backfill function
async function runBackfill() {
  const startTime = Date.now();

  try {
    // Get GBP token
    const token = await getGBPToken();
    if (!token) {
      console.log('❌ No valid GBP token available');
      process.exit(1);
    }
    console.log('✅ GBP token retrieved');

    // Fetch clients with GBP
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`id, name, slug, service_configs (gbp_location_id)`)
      .eq('is_active', true);

    if (error) throw new Error(`Failed to fetch clients: ${error.message}`);

    const clientsWithGBP = clients
      .map(c => ({
        id: c.id,
        name: c.name,
        gbpLocationId: c.service_configs?.[0]?.gbp_location_id || c.service_configs?.gbp_location_id
      }))
      .filter(c => c.gbpLocationId);

    console.log(`👥 Found ${clientsWithGBP.length} clients with GBP`);

    if (clientsWithGBP.length === 0) {
      console.log('⚠️ No clients with GBP location ID');
      process.exit(0);
    }

    // Generate dates
    const dates = [];
    const current = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (current <= endDateObj) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    console.log(`📅 Processing ${dates.length} days`);
    console.log('');

    let totalRecords = 0;

    // Process each date
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const progress = Math.round((i / dates.length) * 100);
      process.stdout.write(`\r📆 Processing ${date} (${progress}%)...`);

      // Process each client
      for (const client of clientsWithGBP) {
        try {
          const metrics = await fetchGBPMetrics(client.gbpLocationId, token, date);

          // Check if record exists
          const { data: existing } = await supabase
            .from('client_metrics_summary')
            .select('id')
            .eq('client_id', client.id)
            .eq('date', date)
            .eq('period_type', 'daily')
            .single();

          if (existing) {
            // Update
            await supabase
              .from('client_metrics_summary')
              .update({
                ...metrics,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);
          } else {
            // Insert
            await supabase
              .from('client_metrics_summary')
              .insert({
                client_id: client.id,
                date: date,
                period_type: 'daily',
                ...metrics,
                updated_at: new Date().toISOString(),
              });
          }

          totalRecords++;
        } catch (e) {
          // Skip errors for individual clients
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('');
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ BACKFILL COMPLETED');
    console.log('='.repeat(60));
    console.log(`📊 Total Records: ${totalRecords}`);
    console.log(`⏱️  Duration: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

// Run
runBackfill();
