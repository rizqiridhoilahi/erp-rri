import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('client_logo')
    .select('file_url, alt_text, urutan')
    .eq('is_active', true)
    .order('urutan', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}
