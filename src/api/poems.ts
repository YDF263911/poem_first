import { apiGet } from './client'
import type { Poem } from '../stores/poems'

export async function fetchPoemsApi(params?: { keyword?: string; dynasty?: string; tag?: string; page?: number; pageSize?: number }) {
  // 调用 Supabase Edge Function: poems_search
  // 过滤 undefined/空字符串，仅传入有效参数，避免出现 keyword=undefined 等
  const q: Record<string, string | number> = {}
  if (params) {
    const { keyword, dynasty, tag, page, pageSize } = params
    if (typeof keyword === 'string' && keyword.trim() !== '') q.keyword = keyword.trim()
    if (typeof dynasty === 'string' && dynasty.trim() !== '') q.dynasty = dynasty.trim()
    if (typeof tag === 'string' && tag.trim() !== '') q.tag = tag.trim()
    if (typeof page === 'number' && Number.isFinite(page)) q.page = page
    if (typeof pageSize === 'number' && Number.isFinite(pageSize)) q.pageSize = pageSize
  }
  return apiGet<{ items: Poem[]; total: number }>('/poems_search', q)
}

// 详情页仍从本地 store 获取，若需要服务端可另行实现
export async function fetchPoemByIdApi(id: number) {
  return apiGet<Poem>(`/poems/${id}`)
}