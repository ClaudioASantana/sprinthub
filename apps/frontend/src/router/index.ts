import { createRouter, createWebHistory } from 'vue-router';
import { parseJwt } from '../utils/jwt';

import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

const requireAuth = (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const token = localStorage.getItem('token');
  if (!token) {
    next('/login');
    return;
  }
  const payload = parseJwt(token);
  if (!payload) {
    localStorage.removeItem('token');
    next('/login');
    return;
  }
  next();
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/auth/callback',
      component: () => import('../pages/AuthCallback.vue'),
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      component: () => import('../pages/DashboardLayout.vue'),
      beforeEnter: requireAuth,
      children: [
        {
          path: '',
          name: 'Overview',
          component: () => import('../pages/DashboardOverview.vue'),
        },
        {
          path: 'companies',
          name: 'Companies',
          component: () => import('../pages/DashboardCompanies.vue'),
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('../pages/DashboardProjects.vue'),
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../pages/DashboardSettings.vue'),
        },
        {
          path: 'teams',
          name: 'Teams',
          component: () => import('../pages/DashboardTeams.vue'),
        },
        {
          path: 'sprints',
          name: 'Sprints',
          component: () => import('../pages/DashboardSprints.vue'),
        },
{
      path: 'tasks',
          name: 'Tasks',
          component: () => import('../pages/DashboardTasks.vue'),
        },
      ],
    },
    {
      path: '/app',
      component: () => import('../pages/AppLayout.vue'),
      beforeEnter: requireAuth,
      children: [
        {
          path: '',
          name: 'AppProjects',
          component: () => import('../pages/AppProjects.vue'),
        },
        {
          path: 'tasks',
          name: 'AppTasks',
          component: () => import('../pages/AppTasks.vue'),
        },
        {
          path: 'profile',
          name: 'AppProfile',
          component: () => import('../pages/AppProfile.vue'),
        },
        {
          path: 'project/:id',
          name: 'AppProjectBoard',
          component: () => import('../pages/AppBoard.vue'),
        },
      ],
    },
  ],
});

export default router;