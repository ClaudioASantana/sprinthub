<template>
  <div class="overview">
    <div class="page-header">
      <h1>Bem-vindo ao Backoffice</h1>
      <p class="subtitle">Resumo em tempo real da produtividade do seu time</p>
    </div>
    
    <div class="stats-grid" v-if="!isLoading">
      <div class="stat-card glass-panel" v-for="(value, key) in stats" :key="key">
        <span class="stat-value">{{ value }}</span>
        <span class="stat-label">{{ formatLabel(key) }}</span>
      </div>
    </div>

    <!-- Skeletons enquanto carrega -->
    <div class="stats-grid" v-else>
      <div class="stat-card glass-panel skeleton-card" v-for="i in 4" :key="i">
        <div class="skeleton-value pulse"></div>
        <div class="skeleton-label pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isLoading = ref(true);

const stats = ref({
  companies: 0,
  projects: 0,
  sprints: 0,
  tasks: 0,
});

const formatLabel = (key: string | number) => {
  const map: Record<string, string> = {
    companies: 'Empresas Abertas',
    projects: 'Projetos Ativos',
    sprints: 'Sprints (Ciclos)',
    tasks: 'Tarefas Criadas'
  };
  return map[key.toString()] || key;
};

onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      stats.value = await response.json();
    }
  } catch (err) {
    console.error('Falha ao carregar dashboard', err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.page-header h1 {
  margin: 0 0 8px 0;
}
.subtitle {
  color: var(--color-text-secondary);
  font-size: 15px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.stat-card {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 16px;
  background: rgba(13, 11, 20, 0.4);
  border: 1px solid var(--border-color);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 40px rgba(0, 112, 243, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 48px;
  font-weight: 800;
  color: var(--neon-blue);
  text-shadow: 0 0 20px rgba(0, 112, 243, 0.3);
  line-height: 1;
  margin-bottom: 12px;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Skeleton Loading */
.skeleton-card {
  height: 160px;
  justify-content: center;
  gap: 16px;
}
.skeleton-value {
  width: 80px;
  height: 48px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}
.skeleton-label {
  width: 120px;
  height: 16px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
}
.pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
</style>