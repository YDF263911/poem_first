<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePoemsStore, type Poem } from '../stores/poems'
import { fetchComments, postComment, type Comment } from '../api/comments'
import CommentItem from '../components/CommentItem.vue'

const route = useRoute()
const store = usePoemsStore()
const poem = ref<Poem | null>(null)

/* 评论（后端持久化） */
type Comment = { id: number; author: string; content: string; likes?: number; time?: string }
const comments = ref<Comment[]>([])
const newComment = ref('')
const replyingTo = ref<Comment | null>(null)

/** 将扁平评论转为树状 */
type CommentNode = Comment & { children?: CommentNode[] }
function buildTree(items: Comment[]): CommentNode[] {
  const map = new Map<number, CommentNode>()
  const roots: CommentNode[] = []
  for (const c of items) {
    map.set(c.id, { ...c, children: [] })
  }
  for (const c of items) {
    const node = map.get(c.id)!
    const pid = c.parentId ?? null
    if (pid && map.has(pid)) {
      map.get(pid)!.children!.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}
const tree = ref<CommentNode[]>([])

function setReplyTarget(c: Comment) {
  replyingTo.value = c
  // 给输入框加个 @ 引导，不强制
  if (!newComment.value.startsWith('@')) {
    newComment.value = `@${c.author} ` + newComment.value
  }
}
function cancelReply() {
  replyingTo.value = null
}

async function addComment() {
  const text = newComment.value.trim()
  if (!text) return
  try {
    const id = Number(route.params.id)
    const created = await postComment({
      poemId: id,
      author: '游客',
      content: text,
      parentId: replyingTo.value?.id ?? null
    })
    // 将新评论插入本地列表并重建树
    comments.value.unshift(created)
    tree.value = buildTree(comments.value)
    newComment.value = ''
    replyingTo.value = null
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
    tree.value = buildTree(comments.value)
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
        <div class="poem-actions" style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
          <button class="btn" @click="store.toggleFavorite(poem.id)">
            {{ store.isFavorite(poem.id) ? '取消收藏' : '收藏' }}
          </button>
          <RouterLink class="btn ghost" to="/favorites">查看收藏</RouterLink>
        </div>
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

        <!-- 当前回复目标提示 -->
        <div v-if="replyingTo" class="replying-tip">
          正在回复：<strong>@{{ replyingTo.author }}</strong>
          <button class="btn ghost" @click="cancelReply">取消</button>
        </div>

        <div class="comment-editor">
          <div class="comment-avatar">人</div>
          <textarea v-model="newComment" rows="3" placeholder="发表你的观点..." />
          <button class="btn" @click="addComment">发表评论</button>
        </div>

        <!-- 树状评论列表（递归渲染） -->
        <ul class="comment-list">
          <CommentItem
            v-for="c in tree"
            :key="c.id"
            :node="c"
            @reply="setReplyTarget"
          />
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
.replying-tip {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; background: #fffdfa; border: 1px solid var(--border); border-radius: 10px;
  margin-bottom: 8px;
}
.children { list-style: none; padding-left: 16px; margin-top: 8px; border-left: 2px dashed var(--border); }
.link { background: transparent; border: none; color: var(--brand); cursor: pointer; padding: 0; }
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