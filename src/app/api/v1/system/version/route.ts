import { NextResponse } from 'next/server'
import pkg from '@/../package.json'

export async function GET() {
  return NextResponse.json({
    data: {
      version: pkg.version,
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString(),
    },
  })
}
