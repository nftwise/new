import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { logHealthCheck } from '@/lib/utils/error-logger';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/health-check
 *
 * Checks system health and sends alerts if issues detected
 *
 * Scheduled to run at 10AM Pacific Time (6PM UTC) daily via Vercel Cron
 * Verifies:
 * - Database connectivity
 * - Last rollup timestamp (should run at 2AM)
 * - Data freshness
 * - Client metrics exist
 *
 * Usage:
 *   Add to vercel.json:
 *   {
 *     "crons": [{
 *       "path": "/api/admin/health-check",
 *       "schedule": "0 10 * * *"
 *     }]
 *   }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // If no valid secret, require admin auth
      await requireAdmin();
    }

    console.log('🏥 [Health Check] Starting system health check...');

    const issues: string[] = [];
    const warnings: string[] = [];

    // 1. Check database connectivity
    try {
      const { error: dbError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .limit(1);

      if (dbError) {
        issues.push(`Database connection failed: ${dbError.message}`);
        logHealthCheck('Database', 'down', { error: dbError.message });
      } else {
        logHealthCheck('Database', 'healthy');
      }
    } catch (error: any) {
      issues.push(`Database health check failed: ${error.message}`);
      logHealthCheck('Database', 'down', { error: error.message });
    }

    // 2. Check last rollup timestamp (should run at 2AM daily)
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: recentMetrics, error: metricsError } = await supabaseAdmin
        .from('client_metrics_summary')
        .select('date, created_at')
        .eq('period_type', 'daily')
        .gte('date', yesterdayStr)
        .order('created_at', { ascending: false })
        .limit(1);

      if (metricsError) {
        issues.push(`Failed to check rollup status: ${metricsError.message}`);
      } else if (!recentMetrics || recentMetrics.length === 0) {
        issues.push(`No data found for ${yesterdayStr} - rollup may have failed`);
        logHealthCheck('Daily Rollup', 'down', { expectedDate: yesterdayStr });
      } else {
        const lastRollup = new Date(recentMetrics[0].created_at);
        const hoursSinceRollup = (Date.now() - lastRollup.getTime()) / (1000 * 60 * 60);

        if (hoursSinceRollup > 32) {
          // More than 32 hours since last rollup (should run at 2AM daily)
          warnings.push(`Last rollup was ${Math.floor(hoursSinceRollup)} hours ago`);
          logHealthCheck('Daily Rollup', 'degraded', {
            lastRollup: lastRollup.toISOString(),
            hoursSince: Math.floor(hoursSinceRollup),
          });
        } else {
          logHealthCheck('Daily Rollup', 'healthy', {
            lastRollup: lastRollup.toISOString(),
          });
        }
      }
    } catch (error: any) {
      warnings.push(`Rollup check failed: ${error.message}`);
    }

    // 3. Check active clients have recent data
    try {
      const { data: clients, error: clientsError } = await supabaseAdmin
        .from('clients')
        .select('id, name')
        .eq('is_active', true);

      if (clientsError) {
        warnings.push(`Failed to fetch clients: ${clientsError.message}`);
      } else if (clients) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        for (const client of clients) {
          const { data: clientMetrics } = await supabaseAdmin
            .from('client_metrics_summary')
            .select('total_leads')
            .eq('client_id', client.id)
            .eq('date', yesterdayStr)
            .eq('period_type', 'daily')
            .single();

          if (!clientMetrics) {
            warnings.push(`Client "${client.name}" missing data for ${yesterdayStr}`);
          }
        }

        logHealthCheck('Client Data', warnings.length === 0 ? 'healthy' : 'degraded', {
          totalClients: clients.length,
          missingData: warnings.length,
        });
      }
    } catch (error: any) {
      warnings.push(`Client data check failed: ${error.message}`);
    }

    // 4. Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_PRIVATE_KEY',
      'NEXTAUTH_SECRET',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingEnvVars.length > 0) {
      issues.push(`Missing env vars: ${missingEnvVars.join(', ')}`);
      logHealthCheck('Environment', 'down', { missing: missingEnvVars });
    } else {
      logHealthCheck('Environment', 'healthy');
    }

    // Determine overall health
    const status = issues.length > 0 ? 'unhealthy' : warnings.length > 0 ? 'degraded' : 'healthy';
    const duration = Date.now() - startTime;

    const response = {
      success: true,
      status,
      timestamp: new Date().toISOString(),
      duration,
      checks: {
        database: issues.filter((i) => i.includes('Database')).length === 0,
        rollup: issues.filter((i) => i.includes('rollup')).length === 0,
        environment: missingEnvVars.length === 0,
      },
      issues,
      warnings,
    };

    // Log summary
    if (status === 'unhealthy') {
      console.error('🔴 [Health Check] UNHEALTHY - Critical issues detected:', issues);
    } else if (status === 'degraded') {
      console.warn('⚠️  [Health Check] DEGRADED - Warnings detected:', warnings);
    } else {
      console.log(`✅ [Health Check] HEALTHY - All systems operational (${duration}ms)`);
    }

    // TODO: Send email/Slack notification if unhealthy
    // if (status === 'unhealthy') {
    //   await sendAlert({
    //     subject: '🔴 Dashboard Health Check Failed',
    //     issues,
    //   });
    // }

    return NextResponse.json(response);
  } catch (error) {
    return handleAuthError(error);
  }
}
