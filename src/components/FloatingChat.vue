<template>
  <div>
    <button
      class="floating-btn"
      @click="open = !open"
      aria-label="打开古诗词助手"
    >
      {{ open ? '关闭助手' : '古诗词助手' }}
    </button>

    <div v-if="open" class="chat-panel">
      <div class="chat-header">
        <span>古诗词助手</span>
        <button class="close" @click="open = false">×</button>
      </div>

      <div class="presets">
        <button
          v-for="(q, i) in presets"
          :key="i"
          class="preset-chip"
          type="button"
          :disabled="loading"
          @click="quickAsk(q)"
          :title="q"
        >
          {{ q }}
        </button>
      </div>
      <div class="chat-body" ref="bodyEl">
        <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
          <div class="bubble">
            <div class="text">{{ m.text }}</div>
          </div>
        </div>
        <div v-if="loading" class="loading">正在思考...</div>
      </div>

      <form class="chat-input" @submit.prevent="send">
        <input
          v-model="input"
          type="text"
          placeholder="请输入诗人、诗句或风格问题..."
          :disabled="loading"
        />
        <button type="submit" :disabled="loading || !input.trim()">发送</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

type ChatMessage = { role: 'user' | 'assistant'; text: string }

const open = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref<ChatMessage[]>([
  { role: 'assistant', text: '你好，我是古诗词助手。你可以问我关于诗人、诗句、意境赏析等问题。' }
])

const presets = ref<string[]>([
  '推荐一首描写思乡的唐诗，并简述其意境与背景',
  '李白与杜甫的诗风有何不同？请各举一例说明',
  '解析《登鹳雀楼》“白日依山尽，黄河入海流”的艺术手法',
  '以“春夜、雨、细柳”为意象，仿写两句近体诗',
  '介绍王维的山水田园诗风格，并列出代表作与特点',
  '“采菊东篱下，悠然见南山”表达了怎样的审美与人生观？',
  '“大江东去，浪淘尽”出自何处？作者其人其事与创作背景',
  '请推荐三首怀古伤今主题的诗词，并比较其情感差异'
])

function quickAsk(q: string) {
  if (loading.value) return
  input.value = q
  send()
}

const bodyEl = ref<HTMLDivElement | null>(null)
function scrollToBottom() {
  nextTick(() => {
    const el = bodyEl.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

const N8N_URL = (import.meta.env.VITE_N8N_CHAT_URL || '').trim()

async function send() {
  const text = input.value.trim()
  if (!text) return
  messages.value.push({ role: 'user', text })
  input.value = ''
  scrollToBottom()

  if (!N8N_URL) {
    messages.value.push({
      role: 'assistant',
      text: '未配置后端地址：请设置环境变量 VITE_N8N_CHAT_URL 为 n8n 的 Webhook 地址。'
    })
    scrollToBottom()
    return
  }

  loading.value = true
  try {
    const res = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    if (!res.ok) throw new Error('请求失败：' + res.status)
    const data = await res.json().catch(() => ({}))
    const reply =
      (data && (data.reply || data.message || data.text)) ||
      '（后端未返回 reply 字段，请检查 n8n 工作流输出）'
    messages.value.push({ role: 'assistant', text: String(reply) })
  } catch (err: any) {
    messages.value.push({
      role: 'assistant',
      text:
        '调用失败：' +
        (err?.message || '未知错误') +
        '。请检查 n8n Webhook 可用性与 CORS。'
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

onMounted(scrollToBottom)
</script>

<style scoped>
.floating-btn {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
  background: #2f5cff;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 10px 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  cursor: pointer;
}
.floating-btn:hover { filter: brightness(1.1); }

.chat-panel {
  position: fixed;
  right: 16px;
  bottom: 70px;
  width: 320px;
  height: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f7fb;
  border-bottom: 1px solid #e6e8ef;
  padding: 10px 12px;
  font-weight: 600;
}
.chat-header .close {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid #e6e8ef;
  background: #fff;
}
.preset-chip {
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 12px;
  line-height: 1;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid #e6e8ef;
  background: #f7f9ff;
  color: #2f5cff;
  cursor: pointer;
}
.preset-chip:hover { background: #eef3ff; }
.preset-chip:disabled { opacity: .6; cursor: not-allowed; }

.chat-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #fafbff;
}

.msg { margin-bottom: 10px; display: flex; }
.msg.user { justify-content: flex-end; }
.msg.assistant { justify-content: flex-start; }

.bubble {
  max-width: 80%;
  border-radius: 12px;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.msg.user .bubble { background: #e8f0ff; }
.msg.assistant .bubble { background: #fff; border: 1px solid #eaeaea; }

.loading {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 4px 0;
}

.chat-input {
  display: flex;
  border-top: 1px solid #e6e8ef;
}
.chat-input input {
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
}
.chat-input button {
  width: 80px;
  border: none;
  background: #2f5cff;
  color: #fff;
  cursor: pointer;
}
.chat-input button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>