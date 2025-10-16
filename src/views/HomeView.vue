<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePoemsStore } from '../stores/poems'

const store = usePoemsStore()

onMounted(async () => {
  if (!store.poems.length) {
    await store.fetchPoems()
  }
})

// 精选前 6 条诗词
const featured = computed(() => store.poems.slice(0, 6))
</script>

<template>
  <section class="container">
    <!-- 诗句横幅 -->
    <div class="hero card accent">
      <div class="hero-text">
        <h1 class="hero-title">举头望明月，低头思故乡</h1>
        <p class="hero-sub">精选古典诗词，读诗知典，品文入心。</p>
        <RouterLink class="btn" to="/poems">进入诗词列表</RouterLink>
      </div>
    </div>

    <!-- 精选诗词 -->
    <div class="section-head">
      <h2>精选诗词</h2>
      <RouterLink class="btn ghost" to="/poems">查看全部</RouterLink>
    </div>

    <div class="grid">
      <article v-for="p in featured" :key="p.id" class="card poem-card">
        <header class="poem-head">
          <h3 class="poem-title">{{ p.title }}</h3>
          <div class="poem-meta">
            <span>{{ p.author }}</span>
            <span class="dot">·</span>
            <span>{{ p.dynasty }}</span>
          </div>
          <div class="tags">
            <span v-for="t in p.tags ?? []" :key="t" class="tag">{{ t }}</span>
          </div>
        </header>

        <div class="poem-preview">
          <p v-for="(line, idx) in (p.content?.split('。').filter(Boolean).slice(0, 2) ?? [])" :key="idx">
            {{ line }}。
          </p>
        </div>

        <footer class="poem-actions">
          <RouterLink class="btn" :to="`/poems/${p.id}`">阅读全文</RouterLink>
        </footer>
      </article>
    </div>

    <!-- 空态 -->
    <div v-if="!featured.length" class="empty card">
      暂无数据，请稍后重试。
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 24px;
  text-align: center;
}
.hero-title {
  font-size: 28px;
  font-weight: 800;
}
.hero-sub {
  color: var(--muted);
  margin: 8px 0 12px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 10px;
}

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.poem-card { display: grid; gap: 8px; }
.poem-head { display: grid; gap: 4px; }
.poem-title { font-size: 18px; font-weight: 700; }
.poem-meta { color: var(--muted); display: flex; gap: 6px; align-items: center; }
.poem-meta .dot { opacity: .6; }

.poem-preview { color: #2b2f36; }
.poem-actions { margin-top: 6px; }

.empty { text-align: center; color: var(--muted); }
</style>