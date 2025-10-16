# Poem Vue 项目

面向初中生用户的 Vue 3 + Vite + TypeScript 示例工程，已集成 Vue Router 与 Pinia，遵循 .cursorrules 约定：使用 Composition API、组件化、路由守卫可扩展、状态管理、类型检查与注释。

## 功能与结构

- 前端框架：Vue 3（Composition API）
- 构建工具：Vite
- 语言：TypeScript
- 路由：Vue Router（基础两页：Home、About）
- 状态管理：Pinia（示例 store：counter）
- 目录结构：
  - src/main.ts：应用入口，注册 Pinia 与 Router
  - src/router/index.ts：路由配置
  - src/stores/counter.ts：计数器 store
  - src/views/HomeView.vue：首页示例（使用 HelloWorld 与 counter）
  - src/views/AboutView.vue：关于页
  - src/components/HelloWorld.vue：脚手架自带组件
  - src/assets/ 与样式：脚手架默认资源

## 使用方法

- 开发启动：在项目目录运行
  - npm run dev
- 生产构建：
  - npm run build
- 本地预览构建产物：
  - npm run preview

## 路由说明

- 路由表：
  - / → HomeView（首页）
  - /about → AboutView（关于）
- 扩展路由守卫示例（可选）：
  在 src/router/index.ts 中添加：
  ```ts
  router.beforeEach((to, from) => {
    // 在此编写访问控制或打点逻辑
    return true
  })
  ```

## Pinia 使用示例

- 导入并使用 store：
  ```ts
  import { useCounterStore } from '@/stores/counter'
  const counter = useCounterStore()
  counter.increment()
  ```
- 在模板中：
  ```vue
  <template>
    <p>计数：{{ counter.count }}</p>
  </template>
  ```

## 约定与最佳实践

- 使用 Composition API 与 <script setup>
- 组件尽量保持单一职责，可复用
- 使用 TypeScript 标注 state 与函数签名
- 编写必要注释与错误处理（后续需求增加时补充）
- 可考虑按需引入高级特性（如 Suspense/Teleport）与性能优化（代码分割、懒加载）

## 需求扩展

如需接入诗词鉴赏相关页面与数据源，请告知具体接口或数据结构，我会基于现有路由与状态管理快速扩展页面与逻辑。