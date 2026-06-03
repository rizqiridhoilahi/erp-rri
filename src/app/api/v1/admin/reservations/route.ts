import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { supabaseAdmin } from '@/lib/api/supabase-server'

/**
 * GET /api/v1/admin/reservations
 * Get all document number reservations with stats
 * Requires admin role
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return auth.error
  }

  // Check if user is admin
  if (auth.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - admin access required' }, { status: 403 })
  }

  try {
    // Fetch all reservations with user info
    const { data: reservations, error: reservationsError } = await supabaseAdmin
      .from('document_number_reservation')
      .select(`
        *,
        user:users (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (reservationsError) {
      console.error('Failed to fetch reservations:', reservationsError)
      throw reservationsError
    }

    // Calculate stats
    const now = new Date().toISOString()
    const stats = {
      total: reservations?.length || 0,
      active: reservations?.filter(r => !r.used && r.expires_at > now).length || 0,
      expired: reservations?.filter(r => !r.used && r.expires_at < now).length || 0,
      used: reservations?.filter(r => r.used).length || 0,
    }

    // Transform data for frontend
    const transformedData = (reservations || []).map(r => ({
      reserve_id: r.reserve_id,
      kode_dokumen: r.kode_dokumen,
      nomor: r.nomor,
      tahun: r.tahun,
      bulan: r.bulan,
      user_id: r.user_id,
      modul: r.modul,
      expires_at: r.expires_at,
      created_at: r.created_at,
      used: r.used,
      user_name: (r.user as any)?.name || null,
    }))

    return NextResponse.json({
      data: transformedData,
      stats,
    })
  } catch (err) {
    console.error('Failed to fetch reservations:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}