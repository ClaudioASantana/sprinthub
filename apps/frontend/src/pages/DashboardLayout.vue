<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="logo">SprintHub</div>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-link" exact-active-class="active">
          Overview
        </router-link>
        <router-link to="/dashboard/companies" class="nav-link" active-class="active">
          Empresas
        </router-link>
        <router-link to="/dashboard/teams" class="nav-link" active-class="active">
          Equipes
        </router-link>
        <router-link to="/dashboard/sprints" class="nav-link" active-class="active">
          Sprints
        </router-link>
        <router-link to="/dashboard/tasks" class="nav-link" active-class="active">
          Tarefas
        </router-link>
        <router-link to="/dashboard/projects" class="nav-link" active-class="active">
          Projetos
        </router-link>
        <router-link to="/dashboard/settings" class="nav-link" active-class="active">
          Configurações
        </router-link>
      </nav>
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="user-info">
          <span class="user-initial">{{ userInitial }}</span>
          <span class="user-name">{{ userName || 'Administrador' }}</span>
          <button class="logout-btn" @click="logout">Sair</button>
        </div>
      </header>
      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { parseJwt } from '../utils/jwt';
import { useRouter } from 'vue-router';

const router = useRouter();

const userName = ref('');
const userInitial = computed(() => {
  if (!userName.value) return 'A';
  return userName.value.charAt(0).toUpperCase();
});

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = parseJwt(token);
    if (payload) {
      userName.value = payload.name || payload.email || 'Administrador';
    }
  }
});

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: #fff;
  padding: 20px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  padding: 0 12px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  padding: 12px 16px;
  color: #a0a0b0;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-link.active {
  background: #4f46e5;
  color: #fff;
}

.main-content {
  flex: 1;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-initial {
  width: 36px;
  height: 36px;
  background: #4f46e5;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-name {
  color: #333;
  font-weight: 500;
}

.logout-btn {
  background: none;
  border: 1px solid #e5e5e5;
  padding: 6px 12px;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  font-size: 13px;
}

.logout-btn:hover {
  background: #f1f1f1;
  color: #333;
}

.content-area {
  flex: 1;
  padding: 24px;
}
</style>