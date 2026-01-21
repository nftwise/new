import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

export async function POST() {
  try {
    // Verify admin access
    await requireAdmin();
    // Activate all clients
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({ is_active: true })
      .eq('is_active', false)
      .select('id, name, slug');

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Activated ${data?.length || 0} clients`,
      activated: data
    });

  } catch (error) {
    return handleAuthError(error);
  }
}
