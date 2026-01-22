import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { GoogleAdsServiceAccountConnector } from '@/lib/api/google-ads-service-account';
import { getUSYesterday } from '@/lib/utils/timezone';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

const BATCH_SIZE = 3;

/**
 * GET /api/admin/run-campaign-rollup
 * Called by Vercel cron - runs campaign rollup for yesterday
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      await requireAdmin();
    }

    return runCampaignRollup();
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * POST /api/admin/run-campaign-rollup
 * Fetch and save campaign analytics data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { date, secret } = body;

    const cronSecret = process.env.CRON_SECRET;
    if (!secret || secret !== cronSecret) {
      await requireAdmin();
    }

    return runCampaignRollup(date);
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * Main campaign rollup logic - fetches data for 7 campaign tables
 */
async function runCampaignRollup(date?: string) {
  const startTime = Date.now();

  try {
    const targetDate = date || getUSYesterday();
    console.log(`📊 [Campaign Rollup] Starting for ${targetDate}`);

    // Fetch all active clients with Google Ads config
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select(`
        id, name, slug,
        service_configs (gads_customer_id)
      `)
      .eq('is_active', true);

    if (clientsError) throw new Error(`Failed to fetch clients: ${clientsError.message}`);

    const clientConfigs = (clients || [])
      .map((client: any) => {
        const config = Array.isArray(client.service_configs)
          ? client.service_configs[0]
          : client.service_configs || {};
        return {
          id: client.id,
          name: client.name,
          slug: client.slug,
          adsCustomerId: config.gads_customer_id,
        };
      })
      .filter((c: any) => c.adsCustomerId);

    console.log(`👥 Processing ${clientConfigs.length} clients with Google Ads`);

    const mccId = process.env.GOOGLE_ADS_MCC_ID || '8432700368';
    const adsConnector = new GoogleAdsServiceAccountConnector();

    let totalSettings = 0;
    let totalSearchTerms = 0;
    let totalGeo = 0;
    let totalSchedule = 0;
    let totalQuality = 0;
    let totalConversions = 0;
    let totalAlerts = 0;

    // Process clients in batches
    for (let i = 0; i < clientConfigs.length; i += BATCH_SIZE) {
      const batch = clientConfigs.slice(i, i + BATCH_SIZE);

      const promises = batch.map(async (client: any) => {
        const customerId = client.adsCustomerId.replace(/-/g, '');

        try {
          // Fetch all campaign data in parallel using the connector
          const [settings, searchTerms, geoData, scheduleData, qualityData, conversionData] = await Promise.all([
            fetchCampaignSettings(adsConnector, customerId, mccId).catch(() => []),
            fetchSearchTerms(adsConnector, customerId, mccId, targetDate).catch(() => []),
            fetchGeoPerformance(adsConnector, customerId, mccId, targetDate).catch(() => []),
            fetchSchedulePerformance(adsConnector, customerId, mccId, targetDate).catch(() => []),
            fetchQualityScores(adsConnector, customerId, mccId).catch(() => []),
            fetchConversionActions(adsConnector, customerId, mccId, targetDate).catch(() => []),
          ]);

          // Generate AI alerts based on the data
          const alerts = generateAIAlerts(client.id, targetDate, {
            settings, searchTerms, geoData, scheduleData, qualityData, conversionData
          });

          return {
            clientId: client.id,
            settings,
            searchTerms,
            geoData,
            scheduleData,
            qualityData,
            conversionData,
            alerts,
          };
        } catch (error) {
          console.error(`[Campaign Rollup] Error for ${client.name}:`, error);
          return { clientId: client.id, settings: [], searchTerms: [], geoData: [], scheduleData: [], qualityData: [], conversionData: [], alerts: [] };
        }
      });

      const results = await Promise.all(promises);

      // Save all data to database
      for (const result of results) {
        // 1. Campaign Settings
        if (result.settings.length > 0) {
          const settingsData = result.settings.map((s: any) => ({
            ...s,
            client_id: result.clientId,
            date: targetDate,
          }));
          await supabaseAdmin.from('campaign_settings').upsert(settingsData, { onConflict: 'client_id,campaign_id,date' });
          totalSettings += result.settings.length;
        }

        // 2. Search Terms
        if (result.searchTerms.length > 0) {
          const searchData = result.searchTerms.map((s: any) => ({
            ...s,
            client_id: result.clientId,
            date: targetDate,
          }));
          await supabaseAdmin.from('campaign_search_terms').upsert(searchData, { onConflict: 'client_id,campaign_id,search_term,date' });
          totalSearchTerms += result.searchTerms.length;
        }

        // 3. Geo Performance
        if (result.geoData.length > 0) {
          const geoDataSave = result.geoData.map((g: any) => ({
            ...g,
            client_id: result.clientId,
            date: targetDate,
          }));
          await supabaseAdmin.from('campaign_geo_performance').upsert(geoDataSave, { onConflict: 'client_id,campaign_id,location_type,location_name,date' });
          totalGeo += result.geoData.length;
        }

        // 4. Schedule Performance
        if (result.scheduleData.length > 0) {
          const scheduleDataSave = result.scheduleData.map((s: any) => ({
            ...s,
            client_id: result.clientId,
            date: targetDate,
          }));
          await supabaseAdmin.from('campaign_schedule_performance').upsert(scheduleDataSave, { onConflict: 'client_id,campaign_id,day_of_week,hour_of_day,date' });
          totalSchedule += result.scheduleData.length;
        }

        // 5. Quality Scores
        if (result.qualityData.length > 0) {
          const qualityDataSave = result.qualityData.map((q: any) => ({
            ...q,
            client_id: result.clientId,
            date: targetDate,
          }));
          await supabaseAdmin.from('campaign_quality_scores').upsert(qualityDataSave, { onConflict: 'client_id,campaign_id,keyword_id,date' });
          totalQuality += result.qualityData.length;
        }

        // 6. Conversion Actions
        if (result.conversionData.length > 0) {
          const conversionDataSave = result.conversionData.map((c: any) => ({
            ...c,
            client_id: result.clientId,
            date: targetDate,
          }));
          await supabaseAdmin.from('campaign_conversion_actions').upsert(conversionDataSave, { onConflict: 'client_id,campaign_id,conversion_action_name,date' });
          totalConversions += result.conversionData.length;
        }

        // 7. AI Alerts
        if (result.alerts.length > 0) {
          const alertsData = result.alerts.map((a: any) => ({
            ...a,
            client_id: result.clientId,
            date: targetDate,
          }));
          await supabaseAdmin.from('campaign_ai_alerts').upsert(alertsData, { onConflict: 'client_id,campaign_id,alert_type,date' });
          totalAlerts += result.alerts.length;
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Campaign Rollup] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      date: targetDate,
      processed: clientConfigs.length,
      data: {
        settings: totalSettings,
        searchTerms: totalSearchTerms,
        geo: totalGeo,
        schedule: totalSchedule,
        quality: totalQuality,
        conversions: totalConversions,
        alerts: totalAlerts,
      },
      duration,
    });

  } catch (error: any) {
    console.error('[Campaign Rollup] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// =====================================================
// GOOGLE ADS QUERY FUNCTIONS (using connector)
// =====================================================

// 1. Campaign Settings
async function fetchCampaignSettings(
  connector: GoogleAdsServiceAccountConnector,
  customerId: string,
  mccId: string
): Promise<any[]> {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.bidding_strategy_type,
      campaign.target_cpa.target_cpa_micros,
      campaign.target_roas.target_roas,
      campaign.geo_target_type_setting.positive_geo_target_type,
      campaign.network_settings.target_search_network,
      campaign.network_settings.target_content_network,
      campaign.url_expansion_opt_out
    FROM campaign
    WHERE campaign.status != 'REMOVED'
  `;

  const results = await connector.executeQuery(query, customerId, mccId);

  return results.map((r: any) => ({
    campaign_id: r.campaign?.id?.toString() || '',
    campaign_name: r.campaign?.name || '',
    status: r.campaign?.status || 'UNKNOWN',
    bid_strategy_type: r.campaign?.biddingStrategyType || r.campaign?.bidding_strategy_type || 'MANUAL',
    target_cpa: (r.campaign?.targetCpa?.targetCpaMicros || r.campaign?.target_cpa?.target_cpa_micros || 0) / 1000000,
    target_roas: r.campaign?.targetRoas?.targetRoas || r.campaign?.target_roas?.target_roas || 0,
    location_target_type: r.campaign?.geoTargetTypeSetting?.positiveGeoTargetType || r.campaign?.geo_target_type_setting?.positive_geo_target_type || 'PRESENCE',
    target_search_network: r.campaign?.networkSettings?.targetSearchNetwork ?? r.campaign?.network_settings?.target_search_network ?? true,
    target_content_network: r.campaign?.networkSettings?.targetContentNetwork ?? r.campaign?.network_settings?.target_content_network ?? false,
    final_url_expansion: !(r.campaign?.urlExpansionOptOut ?? r.campaign?.url_expansion_opt_out ?? false),
  }));
}

// 2. Search Terms Report
async function fetchSearchTerms(
  connector: GoogleAdsServiceAccountConnector,
  customerId: string,
  mccId: string,
  date: string
): Promise<any[]> {
  const formattedDate = date.replace(/-/g, '');
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      search_term_view.search_term,
      search_term_view.status,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM search_term_view
    WHERE segments.date = '${formattedDate}'
      AND metrics.impressions > 0
    ORDER BY metrics.cost_micros DESC
    LIMIT 100
  `;

  const results = await connector.executeQuery(query, customerId, mccId);

  return results.map((r: any) => {
    const cost = (r.metrics?.costMicros || r.metrics?.cost_micros || 0) / 1000000;
    const conversions = parseFloat(r.metrics?.conversions || '0');
    const isWasted = cost > 10 && conversions === 0;

    return {
      campaign_id: r.campaign?.id?.toString() || '',
      campaign_name: r.campaign?.name || '',
      search_term: r.searchTermView?.searchTerm || r.search_term_view?.search_term || '',
      match_type: r.searchTermView?.status || r.search_term_view?.status || 'UNSPECIFIED',
      impressions: parseInt(r.metrics?.impressions || '0'),
      clicks: parseInt(r.metrics?.clicks || '0'),
      cost: cost,
      conversions: conversions,
      is_wasted_spend: isWasted,
    };
  });
}

// 3. Geographic Performance
async function fetchGeoPerformance(
  connector: GoogleAdsServiceAccountConnector,
  customerId: string,
  mccId: string,
  date: string
): Promise<any[]> {
  const formattedDate = date.replace(/-/g, '');
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      geographic_view.country_criterion_id,
      geographic_view.location_type,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM geographic_view
    WHERE segments.date = '${formattedDate}'
      AND metrics.impressions > 0
    ORDER BY metrics.impressions DESC
    LIMIT 50
  `;

  const results = await connector.executeQuery(query, customerId, mccId);

  return results.map((r: any) => ({
    campaign_id: r.campaign?.id?.toString() || '',
    campaign_name: r.campaign?.name || '',
    location_type: r.geographicView?.locationType || r.geographic_view?.location_type || 'COUNTRY',
    location_name: String(r.geographicView?.countryCriterionId || r.geographic_view?.country_criterion_id || 'Unknown'),
    impressions: parseInt(r.metrics?.impressions || '0'),
    clicks: parseInt(r.metrics?.clicks || '0'),
    cost: (r.metrics?.costMicros || r.metrics?.cost_micros || 0) / 1000000,
    conversions: parseFloat(r.metrics?.conversions || '0'),
  }));
}

// 4. Schedule Performance (Hour/Day)
async function fetchSchedulePerformance(
  connector: GoogleAdsServiceAccountConnector,
  customerId: string,
  mccId: string,
  date: string
): Promise<any[]> {
  const formattedDate = date.replace(/-/g, '');
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      segments.day_of_week,
      segments.hour,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE segments.date = '${formattedDate}'
      AND metrics.impressions > 0
  `;

  const results = await connector.executeQuery(query, customerId, mccId);

  return results.map((r: any) => ({
    campaign_id: r.campaign?.id?.toString() || '',
    campaign_name: r.campaign?.name || '',
    day_of_week: r.segments?.dayOfWeek || r.segments?.day_of_week || 'MONDAY',
    hour_of_day: parseInt(r.segments?.hour || '0'),
    impressions: parseInt(r.metrics?.impressions || '0'),
    clicks: parseInt(r.metrics?.clicks || '0'),
    cost: (r.metrics?.costMicros || r.metrics?.cost_micros || 0) / 1000000,
    conversions: parseFloat(r.metrics?.conversions || '0'),
  }));
}

// 5. Quality Scores (Keyword level)
async function fetchQualityScores(
  connector: GoogleAdsServiceAccountConnector,
  customerId: string,
  mccId: string
): Promise<any[]> {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      ad_group.name,
      ad_group_criterion.keyword.text,
      ad_group_criterion.criterion_id,
      ad_group_criterion.quality_info.quality_score,
      ad_group_criterion.quality_info.creative_quality_score,
      ad_group_criterion.quality_info.post_click_quality_score,
      ad_group_criterion.quality_info.search_predicted_ctr
    FROM keyword_view
    WHERE ad_group_criterion.status != 'REMOVED'
      AND ad_group_criterion.quality_info.quality_score IS NOT NULL
    ORDER BY ad_group_criterion.quality_info.quality_score ASC
    LIMIT 50
  `;

  const results = await connector.executeQuery(query, customerId, mccId);

  return results.map((r: any) => ({
    campaign_id: r.campaign?.id?.toString() || '',
    campaign_name: r.campaign?.name || '',
    ad_group_name: r.adGroup?.name || r.ad_group?.name || '',
    keyword_id: r.adGroupCriterion?.criterionId?.toString() || r.ad_group_criterion?.criterion_id?.toString() || '',
    keyword_text: r.adGroupCriterion?.keyword?.text || r.ad_group_criterion?.keyword?.text || '',
    quality_score: r.adGroupCriterion?.qualityInfo?.qualityScore || r.ad_group_criterion?.quality_info?.quality_score || 0,
    landing_page_experience: r.adGroupCriterion?.qualityInfo?.postClickQualityScore || r.ad_group_criterion?.quality_info?.post_click_quality_score || 'UNSPECIFIED',
    ad_relevance: r.adGroupCriterion?.qualityInfo?.creativeQualityScore || r.ad_group_criterion?.quality_info?.creative_quality_score || 'UNSPECIFIED',
    expected_ctr: r.adGroupCriterion?.qualityInfo?.searchPredictedCtr || r.ad_group_criterion?.quality_info?.search_predicted_ctr || 'UNSPECIFIED',
  }));
}

// 6. Conversion Actions
async function fetchConversionActions(
  connector: GoogleAdsServiceAccountConnector,
  customerId: string,
  mccId: string,
  date: string
): Promise<any[]> {
  const formattedDate = date.replace(/-/g, '');
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      segments.conversion_action_name,
      segments.conversion_action_category,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_per_conversion
    FROM campaign
    WHERE segments.date = '${formattedDate}'
      AND metrics.conversions > 0
  `;

  const results = await connector.executeQuery(query, customerId, mccId);

  return results.map((r: any) => {
    const actionName = r.segments?.conversionActionName || r.segments?.conversion_action_name || '';

    let conversionType = 'OTHER';
    const lowerName = actionName.toLowerCase();
    if (lowerName.includes('call') || lowerName.includes('phone')) conversionType = 'PHONE_CALL';
    else if (lowerName.includes('form') || lowerName.includes('submit') || lowerName.includes('lead')) conversionType = 'FORM_SUBMIT';
    else if (lowerName.includes('click')) conversionType = 'WEBSITE_CLICK';
    else if (lowerName.includes('direction') || lowerName.includes('map')) conversionType = 'DIRECTIONS';

    return {
      campaign_id: r.campaign?.id?.toString() || '',
      campaign_name: r.campaign?.name || '',
      conversion_action_name: actionName,
      conversion_type: conversionType,
      conversions: parseFloat(r.metrics?.conversions || '0'),
      conversion_value: parseFloat(r.metrics?.conversionsValue || r.metrics?.conversions_value || '0'),
      cost_per_conversion: (r.metrics?.costPerConversion || r.metrics?.cost_per_conversion || 0) / 1000000,
    };
  });
}

// 7. Generate AI Alerts
function generateAIAlerts(
  clientId: string,
  date: string,
  data: {
    settings: any[];
    searchTerms: any[];
    geoData: any[];
    scheduleData: any[];
    qualityData: any[];
    conversionData: any[];
  }
): any[] {
  const alerts: any[] = [];

  const campaignIds = new Set([
    ...data.settings.map((s: any) => s.campaign_id),
    ...data.qualityData.map((q: any) => q.campaign_id),
    ...data.searchTerms.map((s: any) => s.campaign_id),
  ]);

  for (const campaignId of campaignIds) {
    const campaignName = data.settings.find((s: any) => s.campaign_id === campaignId)?.campaign_name || 'Unknown';

    // Alert 1: Low Quality Score Keywords
    const lowQSKeywords = data.qualityData.filter(
      (q: any) => q.campaign_id === campaignId && q.quality_score > 0 && q.quality_score <= 5
    );
    if (lowQSKeywords.length > 0) {
      alerts.push({
        campaign_id: campaignId,
        campaign_name: campaignName,
        alert_type: 'LOW_QUALITY_SCORE',
        severity: lowQSKeywords.some((k: any) => k.quality_score <= 3) ? 'high' : 'medium',
        message: `${lowQSKeywords.length} keywords with Quality Score ≤5`,
        recommendation: 'Review ad relevance and landing page experience. Consider pausing keywords with QS ≤3.',
        affected_items: lowQSKeywords.slice(0, 5).map((k: any) => k.keyword_text),
      });
    }

    // Alert 2: Wasted Spend on Search Terms
    const wastedTerms = data.searchTerms.filter(
      (s: any) => s.campaign_id === campaignId && s.is_wasted_spend
    );
    if (wastedTerms.length > 0) {
      const wastedAmount = wastedTerms.reduce((sum: number, t: any) => sum + t.cost, 0);
      alerts.push({
        campaign_id: campaignId,
        campaign_name: campaignName,
        alert_type: 'WASTED_SPEND',
        severity: wastedAmount > 50 ? 'high' : 'medium',
        message: `$${wastedAmount.toFixed(2)} spent on ${wastedTerms.length} search terms with 0 conversions`,
        recommendation: 'Add these search terms as negative keywords to prevent future wasted spend.',
        affected_items: wastedTerms.slice(0, 10).map((t: any) => t.search_term),
      });
    }

    // Alert 3: Campaign Settings Check
    const settings = data.settings.find((s: any) => s.campaign_id === campaignId);
    if (settings) {
      if (settings.location_target_type === 'PRESENCE_OR_INTEREST') {
        alerts.push({
          campaign_id: campaignId,
          campaign_name: campaignName,
          alert_type: 'BROAD_LOCATION_TARGETING',
          severity: 'medium',
          message: 'Campaign uses broad location targeting (Presence or Interest)',
          recommendation: 'Switch to "Presence: People in or regularly in your targeted locations" for local businesses.',
          affected_items: [],
        });
      }

      if (settings.target_content_network) {
        alerts.push({
          campaign_id: campaignId,
          campaign_name: campaignName,
          alert_type: 'DISPLAY_NETWORK_ENABLED',
          severity: 'low',
          message: 'Campaign is showing on Display Network',
          recommendation: 'For Search campaigns, disable Display Network to focus budget on search intent.',
          affected_items: [],
        });
      }
    }
  }

  return alerts;
}
