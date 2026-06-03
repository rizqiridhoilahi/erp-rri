import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/api/supabase-server';

/**
 * Cron job untuk cleanup expired document number reservations
 * Dipanggil setiap 6 jam via Vercel Cron
 * 
 * Request harus menyertakan Authorization header dengan Bearer token
 * yang sama dengan CRON_SECRET environment variable
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('Unauthorized cron job attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('cleanup_expired_reservations');
    
    if (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
    
    const cleanedCount = data as number;
    
    console.log(`Cleanup successful: ${cleanedCount} expired reservations marked as used`);
    
    return NextResponse.json({
      success: true,
      cleanedCount,
      timestamp: new Date().toISOString(),
      message: `Successfully cleaned up ${cleanedCount} expired reservations`,
    });
  } catch (err) {
    console.error('Cleanup failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cleanup failed' },
      { status: 500 }
    );
  }
}