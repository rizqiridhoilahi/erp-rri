import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/utils/rate-limit'

const STATIC_FILE = /\.(png|jpg|jpeg|gif|svg|ico|webp|mp4|webm|pdf|docx?|xlsx?|txt|css|js)$/i

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''

  // Skip rewrite for static files so /public assets keep serving correctly
  if (STATIC_FILE.test(pathname)) {
    return NextResponse.next()
  }

  // Host detection: pt-rri.com → rewrite to public-pages/
  if (host === 'pt-rri.com' || host === 'www.pt-rri.com') {
    const url = new URL('/public-pages' + pathname, request.url)
    url.search = request.nextUrl.search
    return NextResponse.rewrite(url)
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/api/v1/ai/agents/') || pathname.startsWith('/api/v1/cron/automation')) {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous'
    const key = `${ip}:${pathname}`

    let config = { windowMs: 60_000, maxRequests: 100 }
    if (pathname.includes('/vision-agent') || pathname.includes('/ocr')) {
      config = { windowMs: 60_000, maxRequests: 30 }
    }
    if (pathname.includes('/data-agent/chat') || pathname.includes('/chat')) {
      config = { windowMs: 60_000, maxRequests: 50 }
    }

    const { success, headers } = await checkRateLimit(key, config.maxRequests, config.windowMs)
    const response = NextResponse.next()

    for (const [k, v] of Object.entries(headers)) {
      response.headers.set(k, v)
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Silakan coba lagi nanti.', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429, headers: { ...headers, 'Retry-After': headers['X-RateLimit-Reset'] } }
      )
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|login|register).*)',
  ],
}
