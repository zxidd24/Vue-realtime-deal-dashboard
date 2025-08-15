import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import SSOLogin from '../views/SSOLogin.vue'
import TestSSO from '../views/TestSSO.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/sso',
    name: 'SSOLogin',
    component: SSOLogin
  },
  {
    path: '/test-sso',
    name: 'TestSSO',
    component: TestSSO
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
