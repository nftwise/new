import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

/**
 * POST /api/admin/seed-mock-data
 *
 * Seeds client_metrics_summary with 30 days of mock data for testing
 *
 * Usage:
 *   curl -X POST http://localhost:3000/api/admin/seed-mock-data \
 *     -H "Content-Type: application/json" \
 *     -d '{"secret": "your-cron-secret"}'
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const { secret, days = 30 } = body;

    // Verify secret (optional)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && secret !== cronSecret) {
      // If no valid secret, require admin auth
      await requireAdmin();
    }

    console.log(`🌱 [Seed] Creating ${days} days of mock data`);

    // Get all active clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name, slug')
      .eq('is_active', true)
      .limit(5); // Limit to 5 clients for testing

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active clients found. Please create clients first.',
      }, { status: 404 });
    }

    console.log(`👥 Found ${clients.length} clients to seed`);

    // Generate mock data for last 30 days
    const mockMetrics: any[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (const client of clients) {
        // Generate realistic mock data with some variance
        const baseLeads = 15 + Math.floor(Math.random() * 20); // 15-35 leads
        const baseSpend = 500 + Math.random() * 1000; // $500-$1500
        const baseSessions = 200 + Math.floor(Math.random() * 300); // 200-500 sessions

        mockMetrics.push({
          client_id: client.id,
          date: dateStr,
          period_type: 'daily',

          // Core metrics
          google_ads_conversions: Math.floor(baseLeads * 0.4), // 40% from ads
          ad_spend: Math.round(baseSpend * 100) / 100,
          form_fills: Math.floor(baseLeads * 0.35), // 35% from forms
          gbp_calls: Math.floor(baseLeads * 0.25), // 25% from GBP
          google_rank: 3 + Math.random() * 7, // Rank 3-10
          top_keywords: 25 + Math.floor(Math.random() * 25), // 25-50 keywords
          total_leads: baseLeads,
          cpl: Math.round((baseSpend / (baseLeads * 0.4)) * 100) / 100,

          // Traffic metrics
          sessions: baseSessions,
          users: Math.floor(baseSessions * 0.7),
          new_users: Math.floor(baseSessions * 0.5),
          traffic_organic: Math.floor(baseSessions * 0.4),
          traffic_paid: Math.floor(baseSessions * 0.35),
          traffic_direct: Math.floor(baseSessions * 0.15),
          traffic_referral: Math.floor(baseSessions * 0.1),
          traffic_ai: Math.floor(baseSessions * 0.05),
          sessions_mobile: Math.floor(baseSessions * 0.6),
          sessions_desktop: Math.floor(baseSessions * 0.4),

          // SEO metrics
          seo_impressions: 5000 + Math.floor(Math.random() * 5000),
          seo_clicks: 200 + Math.floor(Math.random() * 200),
          seo_ctr: 3 + Math.random() * 2, // 3-5% CTR
          branded_traffic: 50 + Math.floor(Math.random() * 50),
          non_branded_traffic: 100 + Math.floor(Math.random() * 100),
          keywords_improved: Math.floor(Math.random() * 5),
          keywords_declined: Math.floor(Math.random() * 3),

          // Ads advanced
          ads_impressions: 10000 + Math.floor(Math.random() * 10000),
          ads_clicks: 300 + Math.floor(Math.random() * 200),
          ads_phone_calls: Math.floor(Math.random() * 10),
          ads_ctr: 2.5 + Math.random() * 1.5, // 2.5-4% CTR
          ads_avg_cpc: 5 + Math.random() * 10, // $5-$15 CPC
          ads_impression_share: 60 + Math.random() * 30, // 60-90%
          ads_search_lost_budget: Math.random() * 20, // 0-20%
          ads_quality_score: 6 + Math.random() * 3, // 6-9 quality score
          ads_conversion_rate: 8 + Math.random() * 4, // 8-12%
          ads_top_impression_rate: 40 + Math.random() * 40, // 40-80%

          // GBP performance
          gbp_website_clicks: 30 + Math.floor(Math.random() * 30),
          gbp_directions: 15 + Math.floor(Math.random() * 15),
          gbp_profile_views: 200 + Math.floor(Math.random() * 200),
          gbp_searches_direct: 100 + Math.floor(Math.random() * 100),
          gbp_searches_discovery: 80 + Math.floor(Math.random() * 80),

          // GBP reviews
          gbp_reviews_count: 50 + Math.floor(Math.random() * 50),
          gbp_reviews_new: Math.floor(Math.random() * 3),
          gbp_rating_avg: 4.2 + Math.random() * 0.7, // 4.2-4.9 stars
          gbp_q_and_a_count: 5 + Math.floor(Math.random() * 10),
          days_since_review: Math.floor(Math.random() * 30),

          // GBP content
          gbp_photos_count: 20 + Math.floor(Math.random() * 30),
          gbp_posts_count: 2 + Math.floor(Math.random() * 5),
          gbp_posts_views: 100 + Math.floor(Math.random() * 200),
          gbp_posts_clicks: 10 + Math.floor(Math.random() * 30),
          days_since_post: Math.floor(Math.random() * 14),

          // Account Manager metrics
          health_score: 70 + Math.floor(Math.random() * 25), // 70-95
          mom_leads_change: -10 + Math.random() * 30, // -10% to +20%
          alerts_count: Math.floor(Math.random() * 3),
          budget_utilization: 60 + Math.floor(Math.random() * 35), // 60-95%

          // Content metrics
          blog_sessions: Math.floor(baseSessions * 0.1),
          content_conversions: Math.floor(Math.random() * 5),
          engagement_rate: 40 + Math.random() * 30, // 40-70%
          returning_users: Math.floor(baseSessions * 0.3),
          conversion_rate: 5 + Math.random() * 5, // 5-10%

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    console.log(`📊 Inserting ${mockMetrics.length} mock records...`);

    // Insert mock data (upsert to avoid duplicates)
    const { error: insertError } = await supabaseAdmin
      .from('client_metrics_summary')
      .upsert(mockMetrics, { onConflict: 'client_id,date,period_type' });

    if (insertError) {
      throw new Error(`Failed to insert mock data: ${insertError.message}`);
    }

    const duration = Date.now() - startTime;

    console.log(`✅ [Seed] Successfully seeded ${mockMetrics.length} records in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: `Seeded ${days} days of data for ${clients.length} clients`,
      records: mockMetrics.length,
      clients: clients.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
      duration,
    });

  } catch (error) {
    return handleAuthError(error);
  }
}
