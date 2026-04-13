import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../pages/LoginView.vue'
import DashboardLayout from '../pages/DashboardLayout.vue'

import DashboardOverview from '../pages/DashboardOverview.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        name: 'DashboardOverview',
        component: DashboardOverview
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('sprinthub_admin_token')
  
  if (to.name !== 'Login' && !token) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && token) {
    next({ name: 'DashboardOverview' })
  } else {
    next()
  }
})

export default router
