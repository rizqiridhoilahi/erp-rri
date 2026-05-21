import { NextResponse } from 'next/server'

export function badRequest(message = 'Invalid request') {
  return NextResponse.json({ error: message, code: 'BAD_REQUEST' }, { status: 400 })
}

export function unauthorized(message = 'Authentication required') {
  return NextResponse.json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 })
}

export function notFound(message = 'Resource not found') {
  return NextResponse.json({ error: message, code: 'NOT_FOUND' }, { status: 404 })
}

export function conflict(message = 'Resource already exists') {
  return NextResponse.json({ error: message, code: 'CONFLICT' }, { status: 409 })
}

export function internalError(error: unknown) {
  console.error('Internal server error:', error)
  return NextResponse.json({ error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }, { status: 500 })
}
