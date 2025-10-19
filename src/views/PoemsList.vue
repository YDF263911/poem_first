<script setup lang="ts">
import { onMounted } from 'vue'
import { usePoemsStore } from '../stores/poems'
const store = usePoemsStore()

onMounted(() => {
  if (!store.poems.length) store.fetchPoems()
})

/** 分类与匹配规则（dynasty：按朝代；tag：按标签） */
const categories = [
  { key: '唐诗', type: 'dynasty', value: '唐' },
  { key: '宋词', type: 'dynasty', value: '宋' },
  { key: '元曲', type: 'dynasty', value: '元' },
  { key: '山水', type: 'tag', value: '山水' },
  { key: '边塞', type: 'tag', value: '边塞' },
  { key: '咏物', type: 'tag', value: '咏物' },
] as const

function samplePoem(catKey: string) {
  const cat = categories.find(c => c.key === catKey)
  if (!cat) return null
  if (cat.type === 'dynasty') {
    return store.poems.find(p => p.dynasty?.includes(cat.value)) ?? null
  }
  return store.poems.find(p => (p.tags ?? []).includes(cat.value)) ?? null
}
</script>

<template>
  <section class="container">
    <h1 class="page-title">诗词列表</h1>

    <div class="layout">
      <!-- 左侧分类侧栏 -->
      <aside>
        <div class="card">
          <h3>古诗分类</h3>
          <ul class="menu">
            <li v-for="c in categories" :key="c.key">
              <div class="cat-line">{{ c.key }}</div>
              <div v-if="samplePoem(c.key)" class="cat-sample">
                <strong class="title">{{ samplePoem(c.key)?.title }}</strong>
                <small class="meta">· {{ samplePoem(c.key)?.author }}</small>
                <p class="sample-content">
                  {{ (samplePoem(c.key)?.content ?? '').split('。').filter(Boolean)[0] }}。
                </p>
              </div>
              <div v-else class="muted">暂无该类样例</div>
            </li>
          </ul>
        </div>
      </aside>

      <!-- 右侧列表内容 -->
      <div>
        <div class="toolbar">
          <input
            class="input"
            type="text"
            placeholder="搜索标题/作者/内容/标签"
            v-model="store.keyword"
          />
          <button class="btn" @click="store.fetchPoems">刷新数据</button>
        </div>

        <div v-if="store.loading" class="muted">正在加载...</div>
        <div v-else-if="store.error" class="error">加载失败：{{ store.error }}</div>

        <ul v-else class="grid">
          <li v-for="p in store.filteredPoems" :key="p.id" class="card">
            <header class="card-header">
              <div>
                <strong class="title">{{ p.title }}</strong>
                <small class="meta">{{ p.author }} · {{ p.dynasty }}</small>
              </div>
              <RouterLink class="btn ghost" :to="`/poems/${p.id}`">详情</RouterLink>
              <button class="btn" @click="store.toggleFavorite(p.id)">
                {{ store.isFavorite(p.id) ? '取消收藏' : '收藏' }}
              </button>
            </header>
            <p class="content">{{ p.content }}</p>
            <div v-if="p.tags?.length" class="tags">
              <span v-for="t in p.tags" :key="t" class="tag">#{{ t }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
.toolbar { margin: 14px 0; display: flex; gap: 10px; }
.input {
  flex: 1; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px;
  outline: none; transition: border 0.2s ease, box-shadow 0.2s ease; background: #fffdfa;
}
.input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(66,184,131,0.15); }
.grid { list-style: none; padding: 0; display: grid; gap: 14px; }
.card {
  border: 1px solid var(--border); border-radius: 14px; padding: 14px; background: #fff;
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.05);
}
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 18px; }
.meta { margin-left: 8px; color: #6b7280; }
.content { white-space: pre-wrap; margin-top: 8px; color: #2b2f36; }
.tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.tag { font-size: 12px; padding: 4px 8px; background: #fff3d6; border: 1px solid var(--border); border-radius: 999px; color: #7a5f1b; }
.menu { list-style: none; padding-left: 0; margin: 8px 0 0; }
.menu li {
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 6px;
  background: #fffdfa;
}
.cat-line { font-weight: 600; }
.cat-sample {
  margin-top: 6px;
  padding: 8px;
  border: 1px dashed var(--border);
  border-radius: 8px;
  background: #fff;
}
.sample-content { color: #2b2f36; margin-top: 4px; }
</style>