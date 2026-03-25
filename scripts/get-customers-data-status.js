#!/usr/bin/env node

/**
 * GET CUSTOMERS DATA STATUS
 * Shows all customers + APIs configured + latest data date
 *
 * Usage:
 *   node scripts/get-customers-data-status.js
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║          👥 DANH SÁCH KHÁCH HÀNG & TRẠNG THÁI DỮ LIỆU                          ║');
console.log('║          (Full List of Customers & Data Status)                                 ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
console.log('');

async function getCustomersStatus() {
  try {
    // Fetch all active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id, name, slug, city, is_active,
        service_configs (
          ga_property_id,
          gads_customer_id,
          gsc_site_url,
          gbp_location_id
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    // Fetch latest data dates
    const { data: latestData, error: dataError } = await supabase
      .from('client_metrics_summary')
      .select('client_id, date, google_ads_conversions, form_fills, top_keywords, gbp_calls, gbp_website_clicks')
      .eq('period_type', 'daily')
      .order('date', { ascending: false });

    if (dataError) {
      throw new Error(`Failed to fetch data: ${dataError.message}`);
    }

    // Group data by client
    const latestByClient = {};
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    latestData.forEach(record => {
      if (!latestByClient[record.client_id]) {
        latestByClient[record.client_id] = {
          latestDate: record.date,
          hasAdsData: false,
          hasGAData: false,
          hasGSCData: false,
          hasGBPData: false,
          recordCount: 0,
          yesterdayAds: false,
          yesterdayGA: false,
          yesterdayGSC: false,
          yesterdayGBP: false,
        };
      }
      latestByClient[record.client_id].recordCount++;

      if (record.google_ads_conversions > 0) {
        latestByClient[record.client_id].hasAdsData = true;
        if (record.date === yesterdayStr) {
          latestByClient[record.client_id].yesterdayAds = true;
        }
      }
      if (record.form_fills > 0) {
        latestByClient[record.client_id].hasGAData = true;
        if (record.date === yesterdayStr) {
          latestByClient[record.client_id].yesterdayGA = true;
        }
      }
      if (record.top_keywords > 0) {
        latestByClient[record.client_id].hasGSCData = true;
        if (record.date === yesterdayStr) {
          latestByClient[record.client_id].yesterdayGSC = true;
        }
      }
      if (record.gbp_calls > 0 || record.gbp_website_clicks > 0) {
        latestByClient[record.client_id].hasGBPData = true;
        if (record.date === yesterdayStr) {
          latestByClient[record.client_id].yesterdayGBP = true;
        }
      }
    });

    // Build output table
    const today = new Date();
    const tableData = [];

    clients.forEach((client, index) => {
      const config = Array.isArray(client.service_configs)
        ? client.service_configs[0]
        : client.service_configs || {};

      const latestInfo = latestByClient[client.id] || {
        latestDate: 'NO DATA',
        recordCount: 0,
        yesterdayAds: false,
        yesterdayGA: false,
        yesterdayGSC: false,
        yesterdayGBP: false,
      };

      let daysOld = '❌';
      if (latestInfo.latestDate && latestInfo.latestDate !== 'NO DATA') {
        const latestDate = new Date(latestInfo.latestDate);
        const diff = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
        daysOld = diff === 0 ? '✅ Today' : diff === 1 ? '✅ 1 day' : `⚠️  ${diff} days`;
      }

      tableData.push({
        'STT': index + 1,
        'Khách hàng': client.name,
        'Slug': client.slug,
        'Thành phố': client.city || '-',
        'GA': config.ga_property_id ? '✅' : '❌',
        'Ads': config.gads_customer_id ? '✅' : '❌',
        'GSC': config.gsc_site_url ? '✅' : '❌',
        'GBP': config.gbp_location_id ? '✅' : '❌',
        'Ngày mới nhất': latestInfo.latestDate || '❌',
        'Tuổi': daysOld,
        'Ads Data ✅': latestInfo.yesterdayAds ? '✅' : latestInfo.hasAdsData ? '⚠️' : '❌',
        'GA Data ✅': latestInfo.yesterdayGA ? '✅' : latestInfo.hasGAData ? '⚠️' : '❌',
        'GSC Data ✅': latestInfo.yesterdayGSC ? '✅' : latestInfo.hasGSCData ? '⚠️' : '❌',
        'GBP Data ✅': latestInfo.yesterdayGBP ? '✅' : latestInfo.hasGBPData ? '⚠️' : '❌',
      });
    });

    // Print table
    console.table(tableData);

    // Print summary
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                          📊 SUMMARY STATISTICS                                 ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
    console.log('');

    const summary = {
      'Tổng khách hàng': clients.length,
      'Có GA': clients.filter(c => {
        const cfg = Array.isArray(c.service_configs) ? c.service_configs[0] : c.service_configs;
        return cfg?.ga_property_id;
      }).length,
      'Có Google Ads': clients.filter(c => {
        const cfg = Array.isArray(c.service_configs) ? c.service_configs[0] : c.service_configs;
        return cfg?.gads_customer_id;
      }).length,
      'Có GSC': clients.filter(c => {
        const cfg = Array.isArray(c.service_configs) ? c.service_configs[0] : c.service_configs;
        return cfg?.gsc_site_url;
      }).length,
      'Có GBP': clients.filter(c => {
        const cfg = Array.isArray(c.service_configs) ? c.service_configs[0] : c.service_configs;
        return cfg?.gbp_location_id;
      }).length,
    };

    console.log(JSON.stringify(summary, null, 2));

    // Print status indicators
    console.log('');
    console.log('Legend / Huyền:');
    console.log('  ✅ = Configured & Has recent data (yesterday)');
    console.log('  ⚠️  = Has data but not yesterday');
    console.log('  ❌ = Not configured or no data');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getCustomersStatus();
