import { supabase } from '@/lib/db/client'

let cachedToken: string | null = null

export async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken
  const { data } = await supabase.auth.getSession()
  cachedToken = data.session?.access_token ?? null
  return cachedToken
}

export function clearToken() {
  cachedToken = null
}

export async function apiFetch<T = unknown>(url: string, options?: RequestInit): Promise<{ data: T } & { message?: string }> {
  const token = await getAuthToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Gagal menghubungi server')
  return json
}
