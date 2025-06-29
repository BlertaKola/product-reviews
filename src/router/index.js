import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../views/Auth.vue'
import Reviews from '../views/Reviews.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: Reviews,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')
  
  if (to.meta.requiresAuth && !token && !refreshToken) {
    next('/')
    return
  }
  
  next()
})

export default router 