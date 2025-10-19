<script setup lang="ts">
import { computed } from 'vue'
import { usePoemsStore } from '../stores/poems'

const store = usePoemsStore()
const hasFav = computed(() => store.favoritePoems.length > 0)

function toggle(id: number) {
  store.toggleFavorite(id)
}
</script>

<template>
  <section class="favorites">
    <header class="hero">
      <h1>我的收藏</h1>
      <p class="hero-sub">已收藏的诗词列表（仅本机保存，可随时取消）。</p>
      <div class="actions">
        <RouterLink class="btn ghost" to="/poems">返回诗词列表</RouterLink>
        <button class="btn danger" @click="store.clearFavorites()" :disabled="!hasFav">清空收藏</button>
      </div>
    </header>

    <div v-if="!hasFav" class="empty">
      <p>暂无收藏。</p>
      <RouterLink class="btn" to="/poems">去浏览诗词</RouterLink>
    </div>

    <ul v-else class="poem-grid">
      <li v-for="p in store.favoritePoems" :key="p.id" class="poem-card">
        <header class="poem-head">
          <h3 class="poem-title">{{ p.title }}</h3>
          <div class="meta">{{ p.author }} · {{ p.dynasty }}</div>
        </header>
        <p class="content">{{ p.content }}</p>
        <footer class="poem-actions">
          <RouterLink class="btn ghost" :to="`/poems/${p.id}`">详情</RouterLink>
          <button class="btn" @click="toggle(p.id)">
            取消收藏
          </button>
        </footer>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hero { margin-bottom: 16px; }
.hero-sub { color: #666; margin: 6px 0 12px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.empty { padding: 24px; background: #fffdfa; border: 1px solid var(--border); border-radius: 12px; }

.poem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.poem-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}
.poem-head { margin-bottom: 8px; }
.poem-title { margin: 0; font-size: 18px; }
.meta { color: #777; font-size: 12px; }
.content {
  white-space: pre-wrap;
  color: #333;
  margin: 8px 0 12px;
  max-height: 8.5em;
  overflow: hidden;
}
.poem-actions { display: flex; gap: 8px; }
.btn {
  background: #ffeec0;
  border: 1px solid #ffd977;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
}
.btn.ghost {
  background: #fff;
  border-color: var(--border);
}
.btn.danger {
  background: #ffd6d6;
  border-color: #ffb3b3;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>