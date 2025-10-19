export const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '')

/** 拼接为 BASE + '/' + path，避免 new URL 覆盖掉 BASE 的路径 */
function buildUrl(path: string, params?: Record<string, string | number>) {
  const full = `${API_BASE}/${path.replace(/^\/+/, '')}`
  const url = new URL(full)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  return url
}

export async function apiGet<T>(path: string, params?: Record<string, string | number>) {
  const url = buildUrl(path, params)
  const isSupabaseFn = API_BASE.includes('supabase.co/functions/v1')
  const headers: Record<string, string> = {}
  if (isSupabaseFn && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY
  }
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return (await res.json()) as T
}

export async function apiPost<T>(path: string, body: unknown) {
  const url = buildUrl(path)
  const isSupabaseFn = API_BASE.includes('supabase.co/functions/v1')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (isSupabaseFn && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY
  }
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`)
  return (await res.json()) as T
}