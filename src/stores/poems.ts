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
  const dynasty = ref('')       // 筛选：朝代
  const tag = ref('')           // 筛选：标签
  const page = ref(1)           // 分页：当前页
  const pageSize = ref(10)      // 分页：每页条数
  const total = ref(0)          // 分页：总数

  // 精选诗词：固定 ID 集，首次加载时锁定并持久化到 localStorage
  const featuredIds = ref<number[]>([])
  const FEATURED_KEY = 'featured_poem_ids_v1'

  // 精选快照：用于在当前分页未包含精选ID时补齐展示，保证首屏稳定
  const featuredData = ref<Poem[]>([])
  const FEATURED_DATA_KEY = 'featured_poem_items_v1'

  // 收藏：仅存储收藏的诗词 ID，持久化到 localStorage
  const favoriteIds = ref<number[]>([])
  const FAVORITES_KEY = 'favorite_poem_ids_v1'

  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(FEATURED_KEY) : null
    if (saved) {
      const arr = JSON.parse(saved || '[]')
      featuredIds.value = Array.isArray(arr)
        ? arr.map((x: any) => Number(x)).filter((n: any) => Number.isFinite(n))
        : []
    }
    const savedData = typeof localStorage !== 'undefined' ? localStorage.getItem(FEATURED_DATA_KEY) : null
    if (savedData) {
      const arr = JSON.parse(savedData || '[]')
      featuredData.value = Array.isArray(arr) ? arr : []
    }

    // 恢复收藏
    const favSaved = typeof localStorage !== 'undefined' ? localStorage.getItem(FAVORITES_KEY) : null
    if (favSaved) {
      const arr = JSON.parse(favSaved || '[]')
      favoriteIds.value = Array.isArray(arr)
        ? arr.map((x: any) => Number(x)).filter((n: any) => Number.isFinite(n))
        : []
    }
  } catch {}

  async function fetchPoems() {
    loading.value = true
    error.value = null
    try {
      const { fetchPoemsApi } = await import('../api/poems')
      const res = await fetchPoemsApi({
        keyword: keyword.value || undefined,
        dynasty: dynasty.value || undefined,
        tag: tag.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
      })
      poems.value = res.items
      total.value = (res as any).total ?? res.items?.length ?? 0

      // 若已锁定但快照不完整，则用当前页补齐快照，确保刷新后稳定
      if (featuredIds.value.length > 0 && featuredData.value.length < featuredIds.value.length) {
        const map = new Map(poems.value.map(p => [p.id, p] as const))
        const merged = featuredIds.value.map(id => {
          return featuredData.value.find(p => p.id === id) ?? map.get(id)
        }).filter(Boolean) as Poem[]
        if (merged.length) {
          featuredData.value = merged
          try { localStorage.setItem(FEATURED_DATA_KEY, JSON.stringify(featuredData.value)) } catch {}
        }
      }

      // 若尚未锁定精选，则以当前结果集前 6 条确定精选并持久化
      if (featuredIds.value.length === 0 && poems.value.length > 0) {
        const picked = poems.value.slice(0, 6)
        featuredIds.value = picked.map(p => p.id)
        featuredData.value = picked
        try {
          localStorage.setItem(FEATURED_KEY, JSON.stringify(featuredIds.value))
          localStorage.setItem(FEATURED_DATA_KEY, JSON.stringify(featuredData.value))
        } catch {}
      }
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
    page.value = 1
  }

  function setDynasty(v: string) {
    dynasty.value = v
    page.value = 1
  }

  function setTag(v: string) {
    tag.value = v
    page.value = 1
  }

  function setPage(p: number) {
    page.value = Math.max(1, p)
  }

  function setPageSize(sz: number) {
    pageSize.value = Math.min(100, Math.max(1, sz))
    page.value = 1
  }

  const lastPage = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  // 服务端已完成过滤/分页，这里直接返回结果集
  const filteredPoems = computed(() => poems.value)

  // 精选列表：优先按照锁定的 ID 顺序返回；若未锁定则回退到前 6 条
  const featuredPoems = computed(() => {
    if (featuredIds.value.length) {
      const map = new Map(poems.value.map(p => [p.id, p] as const))
      // 先按ID从当前列表取，缺的用快照补齐，顺序以 featuredIds 为准
      return featuredIds.value.map(id => map.get(id) ?? featuredData.value.find(p => p.id === id)).filter(Boolean) as Poem[]
    }
    // 未锁定前回退为当前结果前6条（同时在 fetch 成功后会锁定并保存快照）
    return poems.value.slice(0, 6)
  })

  // 收藏的诗词：按收藏的 ID 顺序返回；若不在当前页，则尝试用 featuredData 补齐
  const favoritePoems = computed(() => {
    if (favoriteIds.value.length === 0) return []
    const map = new Map(
      [...poems.value, ...featuredData.value].map(p => [p.id, p] as const)
    )
    return favoriteIds.value.map(id => map.get(id)).filter(Boolean) as Poem[]
  })

  // 手动设置/覆盖精选（如未来提供后台或 UI 调整）
  function setFeatured(ids: number[]) {
    const normalized = ids.map((x: any) => Number(x)).filter((n: any) => Number.isFinite(n))
    featuredIds.value = Array.from(new Set(normalized)).slice(0, 6)
    // 同步快照：用当前 store 中可用的数据按顺序生成
    const map = new Map(poems.value.map(p => [p.id, p] as const))
    featuredData.value = featuredIds.value.map(id => map.get(id)).filter(Boolean) as Poem[]
    try {
      localStorage.setItem(FEATURED_KEY, JSON.stringify(featuredIds.value))
      localStorage.setItem(FEATURED_DATA_KEY, JSON.stringify(featuredData.value))
    } catch {}
  }

  // 收藏持久化
  function persistFavorites() {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds.value)) } catch {}
  }

  // 是否已收藏
  function isFavorite(id: number) {
    return favoriteIds.value.includes(id)
  }

  // 切换收藏状态
  function toggleFavorite(id: number) {
    if (isFavorite(id)) {
      favoriteIds.value = favoriteIds.value.filter(x => x !== id)
    } else {
      favoriteIds.value = [...favoriteIds.value, id]
    }
    persistFavorites()
  }

  // 显式设置收藏状态
  function setFavorite(id: number, liked: boolean) {
    const has = isFavorite(id)
    if (liked && !has) {
      favoriteIds.value = [...favoriteIds.value, id]
    } else if (!liked && has) {
      favoriteIds.value = favoriteIds.value.filter(x => x !== id)
    }
    persistFavorites()
  }

  // 清空收藏
  function clearFavorites() {
    favoriteIds.value = []
    persistFavorites()
  }

  return {
    poems, loading, error,
    keyword, dynasty, tag,
    page, pageSize, total, lastPage,
    filteredPoems, featuredPoems,
    favoriteIds, favoritePoems,
    fetchPoems, getPoemById,
    setKeyword, setDynasty, setTag, setPage, setPageSize,
    setFeatured,
    isFavorite, toggleFavorite, setFavorite, clearFavorites
  }
})