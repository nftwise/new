import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { fetchGBPCalls, fetchGBPPerformanceMetrics } from '@/lib/api/gbp-token-manager';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

const BATCH_SIZE = 3;
const TIMEOUT_MS = 15000;

/**
 * POST /api/admin/run-gbp-backfill
 * Backfill GBP data for all clients
 * Body: { startDate: string, endDate: string, secret?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { startDate, endDate, secret } = body;

    // Auth check
    const cronSecret = process.env.CRON_SECRET;
    if (!secret || secret !== cronSecret) {
      await requireAdmin();
    }

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing startDate or endDate'
      }, { status: 400 });
    }

    return runGBPBackfill(startDate, endDate);
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * GET /api/admin/run-gbp-backfill
 * Get status or run for yesterday (cron job)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      await requireAdmin();
    }

    // Run for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    return runGBPBackfill(dateStr, dateStr);
  } catch (error) {
    return handleAuthError(error);
  }
}

async function runGBPBackfill(startDate: string, endDate: string) {
  const startTime = Date.now();
  const results: any[] = [];
  let totalRecords = 0;

  try {
    console.log(`🌐 [GBP Backfill] Starting for ${startDate} to ${endDate}`);

    // Fetch clients with GBP location IDs
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select(`
        id, name, slug,
        service_configs (gbp_location_id)
      `)
      .eq('is_active', true);

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    const clientsWithGBP = (clients || [])
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        gbpLocationId: c.service_configs?.[0]?.gbp_location_id || c.service_configs?.gbp_location_id
      }))
      .filter((c: any) => c.gbpLocationId);

    console.log(`👥 [GBP Backfill] Found ${clientsWithGBP.length} clients with GBP`);

    if (clientsWithGBP.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No clients with GBP location ID configured',
        processed: 0
      });
    }

    // Generate date range
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    console.log(`📅 [GBP Backfill] Processing ${dates.length} days`);

    // Process each date
    for (const date of dates) {
      console.log(`📆 [GBP Backfill] Processing ${date}...`);
      const metricsToSave: any[] = [];

      // Process clients in batches
      for (let i = 0; i < clientsWithGBP.length; i += BATCH_SIZE) {
        const batch = clientsWithGBP.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (client: any) => {
          try {
            const [calls, performance] = await Promise.all([
              Promise.race([
                fetchGBPCalls(client.gbpLocationId, date, date),
                new Promise<number>((_, reject) =>
                  setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
                )
              ]).catch(() => 0),
              Promise.race([
                fetchGBPPerformanceMetrics(client.gbpLocationId, date, date),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
                )
              ]).catch(() => null)
            ]);

            const perf = performance || {};

            return {
              client_id: client.id,
              date: date,
              period_type: 'daily',

              // GBP calls
              gbp_calls: calls || 0,

              // GBP performance metrics
              gbp_website_clicks: perf.websiteClicks || 0,
              gbp_directions: perf.directionRequests || 0,
              gbp_profile_views: perf.businessProfileViews || 0,
              gbp_searches_direct: perf.searchesDirect || 0,
              gbp_searches_discovery: perf.searchesDiscovery || 0,

              // GBP reviews
              gbp_reviews_count: perf.totalReviews || 0,
              gbp_reviews_new: perf.newReviews || 0,
              gbp_rating_avg: perf.averageRating || 0,
              gbp_q_and_a_count: perf.questionsAnswers || 0,
              days_since_review: perf.daysSinceLastReview || 0,

              // GBP content
              gbp_photos_count: perf.photosCount || 0,
              gbp_posts_count: perf.postsCount || 0,
              gbp_posts_views: perf.postsViews || 0,
              gbp_posts_clicks: perf.postsClicks || 0,
              days_since_post: perf.daysSinceLastPost || 0,

              updated_at: new Date().toISOString(),
            };
          } catch (error) {
            console.log(`[GBP Backfill] Error for ${client.name}:`, (error as Error).message);
            return null;
          }
        });

        const batchResults = await Promise.all(promises);
        batchResults.filter(Boolean).forEach((r: any) => metricsToSave.push(r));

        // Small delay between batches
        if (i + BATCH_SIZE < clientsWithGBP.length) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

      // Upsert GBP metrics only (don't overwrite other metrics)
      if (metricsToSave.length > 0) {
        // First check if records exist
        for (const metric of metricsToSave) {
          const { data: existing } = await supabaseAdmin
            .from('client_metrics_summary')
            .select('id')
            .eq('client_id', metric.client_id)
            .eq('date', metric.date)
            .eq('period_type', 'daily')
            .single();

          if (existing) {
            // Update only GBP fields
            const { error: updateError } = await supabaseAdmin
              .from('client_metrics_summary')
              .update({
                gbp_calls: metric.gbp_calls,
                gbp_website_clicks: metric.gbp_website_clicks,
                gbp_directions: metric.gbp_directions,
                gbp_profile_views: metric.gbp_profile_views,
                gbp_searches_direct: metric.gbp_searches_direct,
                gbp_searches_discovery: metric.gbp_searches_discovery,
                gbp_reviews_count: metric.gbp_reviews_count,
                gbp_reviews_new: metric.gbp_reviews_new,
                gbp_rating_avg: metric.gbp_rating_avg,
                gbp_q_and_a_count: metric.gbp_q_and_a_count,
                days_since_review: metric.days_since_review,
                gbp_photos_count: metric.gbp_photos_count,
                gbp_posts_count: metric.gbp_posts_count,
                gbp_posts_views: metric.gbp_posts_views,
                gbp_posts_clicks: metric.gbp_posts_clicks,
                days_since_post: metric.days_since_post,
                updated_at: metric.updated_at,
              })
              .eq('id', existing.id);

            if (updateError) {
              console.log(`[GBP Backfill] Update error: ${updateError.message}`);
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabaseAdmin
              .from('client_metrics_summary')
              .insert(metric);

            if (insertError) {
              console.log(`[GBP Backfill] Insert error: ${insertError.message}`);
            }
          }

          totalRecords++;
        }

        results.push({ date, clients: metricsToSave.length });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [GBP Backfill] Completed in ${duration}ms, ${totalRecords} records`);

    return NextResponse.json({
      success: true,
      startDate,
      endDate,
      totalDays: dates.length,
      totalClients: clientsWithGBP.length,
      totalRecords,
      duration,
      details: results
    });

  } catch (error: any) {
    console.error('[GBP Backfill] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
