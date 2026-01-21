import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { requireAdmin, handleAuthError } from '@/lib/auth/api-auth';

export async function GET() {
  try {
    // Verify admin access
    await requireAdmin();
    // Get all clients from the database
    const { data: allClients, error: allError } = await supabaseAdmin
      .from('clients')
      .select('id, name, slug, is_active')
      .order('name', { ascending: true });

    // Get active clients only
    const { data: activeClients, error: activeError } = await supabaseAdmin
      .from('clients')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (allError || activeError) {
      return NextResponse.json({
        success: false,
        error: allError?.message || activeError?.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      total: allClients?.length || 0,
      active: activeClients?.length || 0,
      inactive: (allClients?.length || 0) - (activeClients?.length || 0),
      clients: allClients
    });

  } catch (error) {
    return handleAuthError(error);
  }
}
