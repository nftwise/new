import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

export async function POST(_request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    // User creation disabled - using manual JSON file authentication
    // To add users, manually edit src/data/clients.json

    return NextResponse.json(
      {
        success: false,
        error: 'User creation disabled. This system uses manual JSON file authentication. Please edit src/data/clients.json to add users.'
      },
      { status: 501 }
    );

  } catch (error) {
    return handleAuthError(error);
  }
}