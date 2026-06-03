import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api/auth';
import { reserveDocumentNumber } from '@/lib/utils/document-number-reservation';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const result = await reserveDocumentNumber('RFQC', 'rfq-customer', auth.user!.id, 15);
    return NextResponse.json({
      data: {
        nomor: result.nomor,
        reserveId: result.reserveId,
        expiresAt: result.expiresAt,
      },
    });
  } catch (err) {
    console.error('Failed to reserve RFQ Customer number:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to reserve number' },
      { status: 500 }
    );
  }
}