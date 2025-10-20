/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_CHAT_URL: string
  // 在此处按需继续声明更多 VITE_ 前缀环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}