<template>
  <div class="profile-page">
    <h1>Meu Perfil</h1>
    <div class="profile-card">
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
.profile-page h1 { color: #1a1a2e; margin-bottom: 24px; }

.profile-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
}

.profile-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.avatar {
  width: 64px;
  height: 64px;
  background: #4f46e5;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
}

.profile-info h2 { margin: 0 0 4px; color: #1a1a2e; }
.profile-info p { margin: 0 0 8px; color: #666; }

.role {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.role-super_admin { background: #fef3c7; color: #92400e; }
.role-admin { background: #dbeafe; color: #1e40af; }
.role-member { background: #d1fae5; color: #065f46; }

.profile-details .detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f1f1;
}

.profile-details .detail-item:last-child { border-bottom: none; }
.profile-details label { color: #666; }
.profile-details span { color: #333; font-weight: 500; }
</style>