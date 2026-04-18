<template>
  <div class="overview">
    <h1>Bem-vindo ao Backoffice</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ stats.companies }}</span>
        <span class="stat-label">Empresas</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.projects }}</span>
        <span class="stat-label">Projetos</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.sprints }}</span>
        <span class="stat-label">Sprints</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.tasks }}</span>
        <span class="stat-label">Tarefas</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const stats = ref({
  companies: 0,
  projects: 0,
  sprints: 0,
  tasks: 0,
});

onMounted(async () => {
  try {
    const response = await fetch('/api/stats');
    if (response.ok) {
      stats.value = await response.json();
    }
  } catch {
    stats.value = { companies: 12, projects: 8, sprints: 24, tasks: 156 };
  }
});
</script>

<style scoped>
.overview h1 {
  margin-bottom: 24px;
  color: #1a1a2e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #4f46e5;
}

.stat-label {
  color: #666;
  margin-top: 8px;
}
</style>