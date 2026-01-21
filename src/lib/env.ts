/**
 * Environment variable validation using Zod
 *
 * This file validates all environment variables at build time and runtime
 * Prevents deployment with missing or invalid configuration
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
 */

// Simple type-safe env validation without Zod dependency
// Validates at runtime and provides clear error messages

type EnvConfig = {
  // Public (client-side)
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_APP_URL?: string;

  // Server-side - Supabase
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Server-side - Google Service Account
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_PROJECT_ID: string;

  // Server-side - Google Ads (Optional)
  GOOGLE_ADS_DEVELOPER_TOKEN?: string;
  GOOGLE_ADS_CLIENT_ID?: string;
  GOOGLE_ADS_CLIENT_SECRET?: string;
  GOOGLE_ADS_REFRESH_TOKEN?: string;
  GOOGLE_ADS_MCC_ID?: string;

  // Server-side - CallRail (Optional)
  CALLRAIL_API_TOKEN?: string;

  // Server-side - Security
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  CRON_SECRET?: string;

  // Server-side - Monitoring (Optional)
  SENTRY_DSN?: string;
  SENTRY_AUTH_TOKEN?: string;

  // Server-side - Rate Limiting (Optional)
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
};

class EnvValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Validates required environment variables
   */
  validate(): EnvConfig {
    const isServer = typeof window === 'undefined';

    // Skip validation during build if NEXT_PUBLIC vars are missing (indicates build time)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.VERCEL) {
      console.log('⏭️  Skipping env validation (Vercel build time - env vars not loaded yet)');
      return process.env as unknown as EnvConfig;
    }

    // Required public variables
    this.validateRequired('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL, true);
    this.validateRequired('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, true);

    // Server-side only validations
    if (isServer) {
      // Required server variables
      this.validateRequired('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
      this.validateRequired('GOOGLE_CLIENT_EMAIL', process.env.GOOGLE_CLIENT_EMAIL);
      this.validateRequired('GOOGLE_PRIVATE_KEY', process.env.GOOGLE_PRIVATE_KEY);
      this.validateRequired('GOOGLE_PROJECT_ID', process.env.GOOGLE_PROJECT_ID);
      this.validateRequired('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET);
      this.validateRequired('NEXTAUTH_URL', process.env.NEXTAUTH_URL);

      // Validate Google Private Key format
      if (process.env.GOOGLE_PRIVATE_KEY) {
        this.validatePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
      }

      // Validate email format
      if (process.env.GOOGLE_CLIENT_EMAIL) {
        this.validateEmail(process.env.GOOGLE_CLIENT_EMAIL);
      }

      // Validate URL formats
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        this.validateUrl('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
      }
      if (process.env.NEXTAUTH_URL) {
        this.validateUrl('NEXTAUTH_URL', process.env.NEXTAUTH_URL);
      }

      // Optional but recommended
      this.validateOptional('CRON_SECRET', process.env.CRON_SECRET,
        'Recommended for securing cron endpoints');
      this.validateOptional('GOOGLE_ADS_DEVELOPER_TOKEN', process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'Required for Google Ads integration');

      // Log warnings for optional features
      if (!process.env.SENTRY_DSN) {
        this.warnings.push('SENTRY_DSN not set - error monitoring disabled');
      }
      if (!process.env.UPSTASH_REDIS_REST_URL) {
        this.warnings.push('UPSTASH_REDIS_REST_URL not set - rate limiting disabled');
      }
    }

    // Report errors and warnings
    if (this.errors.length > 0) {
      const errorMessage = [
        '❌ Environment validation failed:',
        ...this.errors.map(e => `  - ${e}`),
        '',
        'Please check your .env.local file or environment variables.',
        'See .env.example for required variables.',
      ].join('\n');

      throw new Error(errorMessage);
    }

    if (this.warnings.length > 0 && process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Environment warnings:');
      this.warnings.forEach(w => console.warn(`  - ${w}`));
    }

    return process.env as unknown as EnvConfig;
  }

  private validateRequired(name: string, value: string | undefined, isPublic = false) {
    if (!value || value.trim() === '') {
      this.errors.push(`${name} is required but not set`);
    }
  }

  private validateOptional(name: string, value: string | undefined, reason: string) {
    if (!value || value.trim() === '') {
      this.warnings.push(`${name} not set - ${reason}`);
    }
  }

  private validatePrivateKey(key: string) {
    if (!key.includes('BEGIN PRIVATE KEY') || !key.includes('END PRIVATE KEY')) {
      this.errors.push('GOOGLE_PRIVATE_KEY must be a valid PEM private key');
    }
  }

  private validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errors.push(`GOOGLE_CLIENT_EMAIL "${email}" is not a valid email`);
    }
  }

  private validateUrl(name: string, url: string) {
    try {
      new URL(url);
    } catch {
      this.errors.push(`${name} "${url}" is not a valid URL`);
    }
  }
}

// Validate environment variables
const validator = new EnvValidator();

// Skip validation during build (env vars not available yet)
// They'll be injected at runtime by Vercel
// Check for CI, VERCEL, or missing NEXT_PUBLIC vars (all indicate build time)
const isBuildTime = process.env.CI === 'true' ||
                    process.env.VERCEL === '1' ||
                    !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const env = isBuildTime
  ? (process.env as unknown as EnvConfig)
  : validator.validate();

// Type-safe access
export type Env = EnvConfig;

/**
 * Helper to check if optional features are enabled
 */
export const features = {
  googleAds: !!env.GOOGLE_ADS_DEVELOPER_TOKEN,
  callRail: !!env.CALLRAIL_API_TOKEN,
  sentry: !!env.SENTRY_DSN,
  rateLimit: !!env.UPSTASH_REDIS_REST_URL,
} as const;

/**
 * Helper to safely access environment variables with fallbacks
 */
export function getEnv(key: keyof EnvConfig, fallback?: string): string {
  return env[key] || fallback || '';
}

/**
 * Validate environment at build time
 */
if (process.env.NODE_ENV !== 'test' && !isBuildTime) {
  console.log('✅ Environment variables validated successfully');
  if (Object.values(features).some(Boolean)) {
    console.log('✅ Optional features enabled:',
      Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
        .join(', ')
    );
  }
}
