import { apiGet } from './client'
import type { Poem } from '../stores/poems'

export async function fetchPoemsApi(params?: { keyword?: string; dynasty?: string; tags?: string }) {
  return apiGet<{ items: Poem[]; total: number }>('/poems', params)
}

export async function fetchPoemByIdApi(id: number) {
  return apiGet<Poem>(`/poems/${id}`)
}