import { supabaseAdmin } from '@/lib/api/supabase-server'

export async function getConfigValue(key: string, defaultValue: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? defaultValue
}

export async function getConfigNumber(key: string, defaultValue: number): Promise<number> {
  const val = await getConfigValue(key, String(defaultValue))
  const num = parseFloat(val)
  return isNaN(num) ? defaultValue : num
}
