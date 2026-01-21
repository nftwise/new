import { NextResponse } from 'next/server';

/**
 * Clear all cached data
 * DEPRECATED: Cache removed in KISS refactor
 */
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Cache clearing disabled (KISS refactor - database-only approach)',
    itemsCleared: 0
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cache system disabled (KISS refactor)'
  });
}
