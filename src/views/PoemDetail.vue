<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePoemsStore, type Poem } from '../stores/poems'
import { fetchComments, postComment } from '../api/comments'

const route = useRoute()
const store = usePoemsStore()
const poem = ref<Poem | null>(null)

/* 评论（后端持久化） */
type Comment = { id: number; author: string; content: string; likes?: number; time?: string }
const comments = ref<Comment[]>([])
const newComment = ref('')

async function addComment() {
  const text = newComment.value.trim()
  if (!text) return
  try {
    const id = Number(route.params.id)
    const created = await postComment({ poemId: id, author: '游客', content: text })
    comments.value.unshift(created)
    newComment.value = ''
  } catch (e) {
    console.error('post comment failed', e)
  }
}

function load() {
  const id = Number(route.params.id)
  poem.value = store.getPoemById(id)
}

onMounted(async () => {
  if (!store.poems.length) await store.fetchPoems()
  load()
  // 加载后端评论
  try {
    const id = Number(route.params.id)
    const res = await fetchComments({ poemId: id })
    comments.value = res.items ?? []
  } catch (e) {
    console.error('load comments failed', e)
  }
})

watch(() => route.params.id, load)
</script>

<template>
  <section v-if="poem" class="layout">
    <!-- 左侧信息卡片 -->
    <aside>
      <div class="card">
        <h3>古诗分类</h3>
        <ul class="menu">
          <li>唐诗</li>
          <li>宋词</li>
          <li>元曲</li>
          <li>山水</li>
          <li>边塞</li>
          <li>咏物</li>
        </ul>
      </div>

      <div class="card">
        <h3>静夜思</h3>
        <p class="muted">“举头望明月，低头思故乡。”</p>
      </div>

      <div class="card">
        <h3>名句</h3>
        <ul class="menu">
          <li v-for="line in poem.famousLines ?? []" :key="line">{{ line }}</li>
        </ul>
      </div>

      <div class="card">
        <h3>注释</h3>
        <p class="content" v-if="poem.notes">{{ poem.notes }}</p>
        <p v-else class="muted">暂无注释</p>
      </div>
    </aside>

    <!-- 右侧主体内容 -->
    <div class="main">
      <!-- 作者信息卡片 -->
      <div class="card author">
        <div class="author-left">
          <div class="avatar">{{ poem.author?.slice(0,1) }}</div>
        </div>
        <div class="author-right">
          <h2 class="author-name">{{ poem.author }}</h2>
          <p class="author-meta">{{ poem.dynasty }}</p>
          <div class="tags">
            <span v-for="t in poem.tags ?? []" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>
      </div>

      <!-- 诗文内容（居中排版） -->
      <div class="card accent poem">
        <h1 class="title">{{ poem.title }}</h1>
        <p class="sub">—— {{ poem.author }} · {{ poem.dynasty }}</p>
        <div class="poem-content">
          <p v-for="(line, idx) in poem.content.split('。').filter(Boolean)" :key="idx">{{ line }}。</p>
        </div>
        <div v-if="poem.translation" class="block">
          <h3>译文</h3>
          <p class="content">{{ poem.translation }}</p>
        </div>
        <div v-if="poem.analysis" class="block">
          <h3>赏析</h3>
          <p class="content">{{ poem.analysis }}</p>
        </div>
        <div v-if="poem.viz?.length" class="block">
          <h3>可视化建议</h3>
          <ul class="menu">
            <li v-for="(tip, i) in poem.viz" :key="i">{{ tip }}</li>
          </ul>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="card">
        <h3>鉴赏评论</h3>
        <div class="comment-editor">
          <div class="comment-avatar">人</div>
          <textarea v-model="newComment" rows="3" placeholder="发表你的观点..." />
          <button class="btn" @click="addComment">发表评论</button>
        </div>
        <ul class="comment-list">
          <li v-for="c in comments" :key="c.id" class="comment-item">
            <div class="comment-head">
              <div class="comment-avatar">人</div>
              <div>
                <strong>{{ c.author }}</strong>
                <div class="muted">{{ c.time }}</div>
              </div>
            </div>
            <p class="content">{{ c.content }}</p>
            <div class="comment-actions">
              <span class="muted">👍 {{ c.likes }}</span>
              <RouterLink class="muted" to="/poems">回复</RouterLink>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section v-else class="empty">
    <p>未找到该诗词。</p>
    <RouterLink class="btn ghost" to="/poems">返回列表</RouterLink>
  </section>
</template>

<style scoped>
.menu { list-style: none; padding-left: 0; margin: 8px 0 0; }
.menu li {
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 6px;
  background: #fffdfa;
}

.main { display: flex; flex-direction: column; gap: 16px; }

.author { display: flex; gap: 16px; align-items: center; }
.author-left .avatar {
  width: 72px; height: 72px; border-radius: 999px;
  background: #fff3d6; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #7a5f1b; font-size: 24px;
}
.author-name { font-size: 22px; font-weight: 800; }
.author-meta { color: var(--muted); margin-top: 4px; }

.poem .title { font-size: 26px; font-weight: 800; text-align: center; }
.poem .sub { text-align: center; color: var(--muted); margin-top: 6px; }
.poem-content {
  margin: 16px auto 0;
  max-width: 520px;
  text-align: center;
  color: #2b2f36;
}
.block { border-top: 1px solid var(--border); padding-top: 12px; margin-top: 14px; }
.content { white-space: pre-wrap; color: #2b2f36; margin-top: 6px; }

.comment-editor {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 10px;
  align-items: start;
  margin: 10px 0 12px;
}
.comment-avatar {
  width: 40px; height: 40px; border-radius: 999px;
  background: #fff3d6; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: #7a5f1b; font-weight: 700;
}
.comment-list { list-style: none; padding: 0; display: grid; gap: 12px; }
.comment-item { border-top: 1px solid var(--border); padding-top: 12px; }
.comment-head { display: flex; gap: 10px; align-items: center; }
.comment-actions { display: flex; gap: 12px; margin-top: 6px; }

.empty { color: var(--muted); }
</style>