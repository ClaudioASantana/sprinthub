<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>Meu Perfil</h1>
    </div>
    <div class="profile-card glass-panel">
      <div class="profile-header">
        <div class="avatar">{{ userInitial }}</div>
        <div class="profile-info">
          <h2>{{ user?.name || 'Usuário' }}</h2>
          <p>{{ user?.email }}</p>
          <span :class="['role', 'role-' + (user?.role || 'member')]">{{ user?.role || 'member' }}</span>
        </div>
      </div>
      <div class="profile-details">
        <div class="detail-item">
          <label>Empresa:</label>
          <span>{{ user?.companyId || '-' }}</span>
        </div>
        <div class="detail-item">
          <label>ID:</label>
          <span>{{ user?.sub || user?.id || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface User {
  sub: string;
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  profile: string;
}

const user = ref<User | null>(null);

const userInitial = computed(() => {
  const name = user.value?.name || user.value?.email || 'U';
  return name.charAt(0).toUpperCase();
});

onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      user.value = JSON.parse(stored);
    } catch {
      const token = localStorage.getItem('token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          user.value = { ...payload, id: payload.sub };
        }
      }
    }
  }
});
</script>

<style scoped>
.profile-card {
  padding: 24px;
  max-width: 500px;
}

.profile-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #0070F3, #3B82F6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(0, 112, 243, 0.3);
}

.profile-info h2 { margin: 0 0 4px; color: var(--color-text-primary); }
.profile-info p { margin: 0 0 8px; color: var(--color-text-secondary); }

.role {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.role-super_admin { background: rgba(234, 179, 8, 0.1); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.2); }
.role-admin { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
.role-member { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }

.profile-details .detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.profile-details .detail-item:last-child { border-bottom: none; }
.profile-details label { color: var(--color-text-secondary); }
.profile-details span { color: var(--color-text-primary); font-weight: 500; }
</style>