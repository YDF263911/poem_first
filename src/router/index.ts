// Vue Router 配置：基础两页路由
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import PoemsList from '../views/PoemsList.vue'
import PoemDetail from '../views/PoemDetail.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/poems', name: 'poems', component: PoemsList },
  { path: '/poems/:id', name: 'poem-detail', component: PoemDetail },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router