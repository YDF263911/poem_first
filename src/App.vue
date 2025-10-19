<script setup lang="ts">
import FloatingChat from './components/FloatingChat.vue'
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <a href="/" class="brand">Poem Vue</a>
      <nav class="nav">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/poems">诗词</RouterLink>
        <RouterLink to="/favorites">收藏</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </div>
  </header>
  <main class="container">
    <RouterView />
  </main>
  <FloatingChat />
</template>

<style scoped>
.app-header {
  background: #fffdfa; /* 暖色浅米背景 */
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
}
.brand {
  font-weight: 800;
  color: #2b2f36;
  text-decoration: none;
}
.nav {
  display: flex;
  gap: 12px;
}
.nav a {
  color: #3a3f46;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 10px;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.nav a:hover {
  background: #fff3d6; /* 悬停浅黄 */
  box-shadow: 0 2px 6px rgba(17,24,39,0.06);
}
.nav a.router-link-active {
  color: var(--brand);
  font-weight: 700;
  background: #ffeec0; /* 激活更暖的浅黄 */
}
.container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 16px;
}
</style>
