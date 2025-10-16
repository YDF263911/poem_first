import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Poem {
  id: number
  title: string
  author: string
  dynasty: string
  content: string
  translation?: string
  tags?: string[]
  famousLines?: string[]
  analysis?: string
  viz?: string[]
  notes?: string
}

export const usePoemsStore = defineStore('poems', () => {
  const poems = ref<Poem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const keyword = ref('')

  async function fetchPoems() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/poems.json')
      const data = (await res.json()) as Poem[]
      poems.value = data
    } catch (e: any) {
      error.value = e?.message ?? '未知错误'
    } finally {
      loading.value = false
    }
  }

  function getPoemById(id: number) {
    const hit = poems.value.find(p => p.id === id)
    if (hit) return hit
    // 回退：直接请求详情
    return null
  }

  function setKeyword(k: string) {
    keyword.value = k
  }

  const filteredPoems = computed(() => {
    const k = keyword.value.trim()
    if (!k) return poems.value
    const lower = k.toLowerCase()
    return poems.value.filter(p =>
      [p.title, p.author, p.dynasty, p.content, p.translation ?? '', (p.tags ?? []).join(',')]
        .some(field => field?.toLowerCase().includes(lower))
    )
  })

  return { poems, loading, error, keyword, filteredPoems, fetchPoems, getPoemById, setKeyword }
})