import { supabase } from '@/lib/db/client'

export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
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
  let json: Record<string, unknown>
  try {
    json = await res.json()
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Gagal menghubungi server')
    return { data: null as T }
  }
  if (!res.ok) throw new Error((json.error as string) || 'Gagal menghubungi server')
  return json as { data: T } & { message?: string }
}

export async function apiFetchFormData<T = unknown>(url: string, body: FormData, options?: RequestInit): Promise<{ data: T } & { message?: string }> {
  const token = await getAuthToken()
  const res = await fetch(url, {
    ...options,
    method: options?.method ?? 'POST',
    body,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  let json: Record<string, unknown>
  try {
    json = await res.json()
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Gagal menghubungi server')
    return { data: null as T }
  }
  if (!res.ok) throw new Error((json.error as string) || 'Gagal menghubungi server')
  return json as { data: T } & { message?: string }
}
