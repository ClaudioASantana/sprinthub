<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="logo">
        SprintHub
        <div class="company-badge" v-if="companyName">{{ companyName }}</div>
      </div>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-link" exact-active-class="active">
          Overview
        </router-link>

        <router-link to="/dashboard/teams" class="nav-link" active-class="active">
          Equipes
        </router-link>
        <router-link to="/dashboard/users" class="nav-link" active-class="active">
          Membros
        </router-link>
        <router-link to="/dashboard/sprints" class="nav-link" active-class="active">
          Sprints
        </router-link>
        <router-link to="/dashboard/backlog" class="nav-link" active-class="active">
          Backlog
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
const companyName = ref('');

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
      companyName.value = payload.companyName || 'Empresa';
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
  background-color: var(--bg-darker);
  color: var(--color-text-primary);
}

.sidebar {
  width: 240px;
  background: rgba(13, 11, 20, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  color: #fff;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 48px;
  padding: 0 12px;
  background: linear-gradient(135deg, #fff, #a3aac4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.company-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--neon-blue);
  background: rgba(0, 112, 243, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  border: 1px solid rgba(0, 112, 243, 0.2);
  -webkit-text-fill-color: var(--neon-blue);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  padding: 12px 16px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 15px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.nav-link.active {
  background: linear-gradient(135deg, rgba(0, 112, 243, 0.15), rgba(59, 130, 246, 0.15));
  color: #fff;
  border-left: 3px solid var(--neon-blue);
  box-shadow: inset 0 0 20px rgba(0, 112, 243, 0.05);
}

.main-content {
  flex: 1;
  background: radial-gradient(circle at 50% 0%, rgba(30, 30, 40, 0.5) 0%, transparent 60%),
              linear-gradient(135deg, #13111C 0%, #0d0b14 100%);
  display: flex;
  flex-direction: column;
}

.header {
  height: 72px;
  background: rgba(19, 17, 28, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 32px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-initial {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #0070F3, #3B82F6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 2px 10px rgba(0, 112, 243, 0.3);
}

.user-name {
  color: var(--color-text-primary);
  font-weight: 500;
  font-size: 15px;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #ef4444;
  border-color: rgba(220, 38, 38, 0.2);
}

.content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}
</style>