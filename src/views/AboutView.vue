<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="container">
    <div class="card accent">
      <h1>关于「诗词鉴赏」</h1>
      <p class="muted">面向初中生用户，提供古典诗词的阅读、赏析与互动评论。</p>
    </div>

    <div class="grid">
      <article class="card">
        <h2>项目目标</h2>
        <ul class="list">
          <li>精选古诗词的浏览与搜索</li>
          <li>详情页提供译文、注释与赏析</li>
          <li>支持用户发表评论进行交流</li>
        </ul>
      </article>

      <article class="card">
        <h2>技术栈</h2>
        <ul class="list">
          <li>前端：Vue 3 + Vite + TypeScript、Vue Router、Pinia</li>
          <li>后端：Node.js + Express</li>
          <li>数据库：MySQL（通过 Prisma 持久化）</li>
        </ul>
      </article>

      <article class="card">
        <h2>主要功能</h2>
        <ul class="list">
          <li>诗词列表与关键词搜索</li>
          <li>详情页：标题、作者、朝代、原文、译文、赏析、名句、注释</li>
          <li>评论区：查看与发表评论（后端持久化）</li>
        </ul>
      </article>

      <article class="card">
        <h2>数据与存储</h2>
        <ul class="list">
          <li>Poem 表：id、title、author、dynasty、content、translation、tags（JSON）、famousLines（JSON）、analysis、notes</li>
          <li>Comment 表：id、poemId（外键）、author、content、likes、time</li>
          <li>API 基址：<code>http://localhost:3000/api</code></li>
        </ul>
      </article>

      <article class="card">
        <h2>后续规划</h2>
        <ul class="list">
          <li>标签与朝代筛选、分页</li>
          <li>分析页：关键词/意象可视化</li>
          <li>账户与收藏、分享功能</li>
          <li>代码规范与测试（ESLint/Prettier/Vitest）</li>
        </ul>
      </article>
    </div>

    <div class="card">
      <h2>快速入口</h2>
      <div class="actions">
        <RouterLink class="btn" to="/poems">进入诗词列表</RouterLink>
        <RouterLink class="btn ghost" to="/">返回首页</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.list { margin: 6px 0 0; padding-left: 18px; }
.actions { display: flex; gap: 10px; }
code {
  padding: 2px 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
</style>