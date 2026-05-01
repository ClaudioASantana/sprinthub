<template>
  <div class="overview">
    <div class="page-header">
      <div class="header-text">
        <h1>Bem-vindo{{ companyName ? ', ' + companyName : '' }}!</h1>
        <p class="subtitle">Resumo em tempo real da produtividade do seu time</p>
      </div>
    </div>

    <!-- Cards de stats reais -->
    <div class="stats-grid" v-if="!isLoading">
      <div
        class="stat-card glass-panel"
        v-for="(item, idx) in statCards"
        :key="item.key"
        :style="{ '--accent': item.color, animationDelay: idx * 80 + 'ms' }"
      >
        <div class="stat-icon">{{ item.icon }}</div>
        <span class="stat-value">{{ item.value }}</span>
        <span class="stat-label">{{ item.label }}</span>
      </div>
    </div>

    <!-- Skeletons enquanto carrega -->
    <div class="stats-grid" v-else>
      <div class="stat-card glass-panel skeleton-card" v-for="i in 4" :key="i">
        <div class="skeleton-icon pulse"></div>
        <div class="skeleton-value pulse"></div>
        <div class="skeleton-label pulse"></div>
      </div>
    </div>

    <!-- Mensagem de erro -->
    <div class="error-banner" v-if="hasError">
      <span>⚠️ Não foi possível carregar os dados. Verifique a conexão com o servidor.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { parseJwt } from '../utils/jwt';

const isLoading = ref(true);
const hasError = ref(false);

const stats = ref<Record<string, number>>({
  projects: 0,
  sprints: 0,
  tasks: 0,
  members: 0,
});

// Lê nome da empresa do JWT
const companyName = computed(() => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  const payload = parseJwt(token);
  return payload?.companyName || '';
});

// Mapeamento de chaves para labels, ícones e cores
const STAT_META: Record<string, { label: string; icon: string; color: string }> = {
  projects:  { label: 'Projetos Ativos',   icon: '📁', color: '#0070F3' },
  sprints:   { label: 'Sprints (Ciclos)',   icon: '🔄', color: '#8B5CF6' },
  tasks:     { label: 'Tarefas Criadas',    icon: '✅', color: '#10B981' },
  members:   { label: 'Membros da Equipe',  icon: '👥', color: '#F59E0B' },
  companies: { label: 'Empresas Ativas',    icon: '🏢', color: '#EC4899' },
};

const statCards = computed(() =>
  Object.entries(stats.value).map(([key, value]) => ({
    key,
    value,
    label: STAT_META[key]?.label ?? key,
    icon:  STAT_META[key]?.icon  ?? '📊',
    color: STAT_META[key]?.color ?? '#0070F3',
  }))
);

onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      stats.value = await response.json();
    } else {
      hasError.value = true;
    }
  } catch (err) {
    console.error('Falha ao carregar dashboard', err);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}
.header-text h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.subtitle {
  color: var(--color-text-secondary);
  font-size: 15px;
  margin: 0;
}

/* Grid de cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.stat-card {
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 16px;
  background: rgba(13, 11, 20, 0.4);
  border: 1px solid var(--border-color);
  animation: fadeUp 0.4s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 40px color-mix(in srgb, var(--accent) 20%, transparent);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}

.stat-icon {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 48px;
  font-weight: 800;
  color: var(--accent);
  text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 30%, transparent);
  line-height: 1;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  text-align: center;
}

/* Skeleton Loading */
.skeleton-card {
  height: 172px;
  justify-content: center;
  gap: 14px;
}
.skeleton-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
}
.skeleton-value {
  width: 80px;
  height: 48px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}
.skeleton-label {
  width: 120px;
  height: 14px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
}
.pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

/* Error banner */
.error-banner {
  margin-top: 24px;
  padding: 14px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 14px;
}
</style>