<template>
  <div class="project-hub" v-if="project || loading">
    <div class="hub-header">
      <button class="btn-back" type="button" @click="$router.push('/app')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Projetos
      </button>
      <div class="hub-titles" v-if="project">
        <h1>{{ project.name }}</h1>
        <p class="subtitle" v-if="project.description">{{ project.description }}</p>
        <p class="sprint-hint" v-if="activeSprint">
          Sprint ativo: <strong>{{ activeSprint.name }}</strong>
          <span v-if="activeSprint.goal"> — {{ activeSprint.goal }}</span>
        </p>
        <p class="sprint-hint muted" v-else>Nenhum sprint ativo</p>
      </div>
      <div class="hub-titles" v-else-if="loading">
        <h1>Carregando projeto…</h1>
      </div>
      <div class="hub-titles" v-else>
        <h1>Projeto não encontrado</h1>
      </div>
    </div>

    <nav class="hub-tabs" v-if="project">
      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="hub-tab"
        active-class="active"
      >
        {{ tab.label }}
      </router-link>
    </nav>

    <div class="hub-body" v-if="project">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const projectId = computed(() => route.params.id as string);
const project = ref<any>(null);
const sprints = ref<any[]>([]);
const loading = ref(true);
const error = ref(false);

const activeSprint = computed(() => {
  const active = sprints.value.find((s) => s.status === 'active');
  if (active) return active;
  const now = Date.now();
  return (
    sprints.value.find((s) => {
      const start = new Date(s.startDate).getTime();
      const end = new Date(s.endDate).getTime();
      return start <= now && now <= end;
    }) || null
  );
});

const tabs = computed(() => {
  const base = `/app/project/${projectId.value}`;
  return [
    { label: 'Overview', to: `${base}/overview` },
    { label: 'Backlog', to: `${base}/backlog` },
    { label: 'Board', to: `${base}/board` },
    { label: 'Sprints', to: `${base}/sprints` },
  ];
});

provide('projectHub', {
  project,
  sprints,
  activeSprint,
  projectId,
  refresh: () => loadProject(),
});

async function loadProject() {
  loading.value = true;
  error.value = false;
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || '';
  try {
    const [projRes, sprintsRes] = await Promise.all([
      fetch(`${base}/api/projects/${projectId.value}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${base}/api/sprints?projectId=${projectId.value}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    if (!projRes.ok) {
      project.value = null;
      error.value = true;
      return;
    }
    project.value = await projRes.json();
    if (sprintsRes.ok) sprints.value = await sprintsRes.json();
  } catch {
    project.value = null;
    error.value = true;
  } finally {
    loading.value = false;
  }
}

watch(projectId, loadProject);
onMounted(loadProject);
</script>

<style scoped>
.project-hub {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.hub-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px 0;
  font-size: 14px;
}

.btn-back:hover {
  color: var(--color-text-primary);
}

.hub-titles h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.subtitle {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.sprint-hint {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.sprint-hint.muted {
  opacity: 0.7;
}

.hub-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0;
  overflow-x: auto;
}

.hub-tab {
  padding: 10px 16px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
}

.hub-tab:hover {
  color: var(--color-text-primary);
}

.hub-tab.active {
  color: var(--neon-blue, #5b8def);
  border-bottom-color: var(--neon-blue, #5b8def);
}

.hub-body {
  flex: 1;
  min-height: 0;
}
</style>
