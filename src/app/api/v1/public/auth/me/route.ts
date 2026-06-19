import { NextRequest, NextResponse } from 'next/server'
import { verifyPublicAuth } from '@/lib/api/public-auth'

export async function GET(request: NextRequest) {
  const { user, profile, error } = await verifyPublicAuth(request)
  if (error) return error

  return NextResponse.json({
    data: {
      user: { id: user!.id, email: user!.email },
      profile,
    },
  })
}
