<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { parseJwt } from '../services/api'

const router = useRouter()
const userName = ref('Administrador')
const userInitials = ref('A')

onMounted(() => {
  const token = localStorage.getItem('sprinthub_admin_token')
  if (token) {
    const payload = parseJwt(token)
    if (payload && payload.nome) {
      userName.value = payload.nome
      userInitials.value = payload.nome.substring(0, 1).toUpperCase()
    }
  }
})

const handleLogout = () => {
  localStorage.removeItem('sprinthub_admin_token')
  router.push('/')
}
</script>

<template>
  <div class="dashboard-shell">
    
    <!-- Sidebar Navigation -->
    <aside class="sidebar glass-panel">
      <div class="brand">
        <div class="logo">S</div>
        <h2>SprintHub Admin</h2>
      </div>

      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item" exact-active-class="active">
          <span class="icon">📊</span>
          Visão Geral
        </router-link>
        <router-link to="/dashboard/tenants" class="nav-item" active-class="active">
          <span class="icon">🏢</span>
          Clientes (Tenants)
        </router-link>
        <router-link to="/dashboard/billing" class="nav-item" active-class="active">
          <span class="icon">💳</span>
          Faturamento
        </router-link>
        <router-link to="/dashboard/settings" class="nav-item" active-class="active">
          <span class="icon">⚙️</span>
          Configurações
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="btn btn-outline" @click="handleLogout">Sair</button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <header class="topbar glass-panel">
        <div class="breadcrumb">
          Visão Geral
        </div>
        <div class="user-profile">
          <div class="avatar">{{ userInitials }}</div>
          <span>{{ userName }}</span>
        </div>
      </header>

      <!-- Content Container where nested routes would go -->
      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: flex;
  height: 100vh;
  padding: 1rem;
  gap: 1rem;
}

.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.brand h2 {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: var(--transition-smooth);
}

.nav-item:hover, .nav-item.active {
  background: hsla(0, 0%, 100%, 0.05);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: hsla(230, 100%, 65%, 0.1);
  color: var(--color-primary);
  border-right: 3px solid var(--color-primary);
}

.sidebar-footer {
  margin-top: auto;
}

.btn-outline {
  width: 100%;
  background: transparent;
  border: 1px solid hsla(0,0%,100%,0.1);
  color: var(--color-text-secondary);
}

.btn-outline:hover {
  background: hsla(0,0%,100%,0.05);
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  height: 70px;
}

.breadcrumb {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: hsla(0,0%,100%,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.content-area {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
