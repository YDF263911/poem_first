import { apiGet, apiPost } from './client'

export type Comment = {
  id: number
  poemId: number
  author: string
  content: string
  likes: number
  time: string
  parentId?: number | null
}

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

export async function postComment(params: { poemId: number; content: string; author?: string; parentId?: number | null }) {
  return apiPost<Comment>('/comments', params)
}

/** 语义化的回复方法，等价于 postComment 但必须带 parentId */
export async function postReply(params: { poemId: number; parentId: number; content: string; author?: string }) {
  return apiPost<Comment>('/comments', params)
}