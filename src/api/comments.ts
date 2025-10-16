import { apiGet, apiPost } from './client'

export type Comment = { id: number; poemId: number; author: string; content: string; likes: number; time: string }

export async function getComments(poemId: number) {
  return apiGet<{ items: Comment[] }>('/comments', { poemId })
}

export async function addComment(poemId: number, content: string, author?: string) {
  return apiPost<Comment>('/comments', { poemId, content, author })
}

// 与现有函数等价的别名导出，供 PoemDetail.vue 使用
export async function fetchComments(params: { poemId: number }) {
  return apiGet<{ items: Comment[] }>('/comments', { poemId: params.poemId })
}

export async function postComment(params: { poemId: number; content: string; author?: string }) {
  return apiPost<Comment>('/comments', params)
}