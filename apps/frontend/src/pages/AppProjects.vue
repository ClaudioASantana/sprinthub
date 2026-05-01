<template>
  <div class="projects-page">
    <div class="page-header">
      <h1>Meus Projetos</h1>
    </div>
    <div class="projects-grid">
      <div v-for="project in projects" :key="project.id" class="project-card glass-panel" @click="goToProject(project.id)">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description || 'Sem descrição' }}</p>
        <div class="project-meta">
          <span :class="['status', 'status-' + project.status]">
            {{ statusLabels[project.status] || project.status }}
          </span>
          <span class="team">{{ project.team?.name || 'Sem equipe' }}</span>
        </div>
        <div class="project-stats">
          <span>{{ project.sprints?.length || 0 }} sprints</span>
          <span>{{ project.tasks?.length || 0 }} tarefas</span>
        </div>
      </div>
      <p v-if="projects.length === 0" class="empty-state">Nenhum projeto encontrado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  team?: { name: string };
  sprints?: any[];
  tasks?: any[];
}

const router = useRouter();
const projects = ref<Project[]>([]);

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
};

const fetchProjects = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/projects', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) projects.value = await res.json();
  } catch {
    projects.value = [];
  }
};

const goToProject = (id: string) => {
  router.push(`/app/project/${id}`);
};

onMounted(fetchProjects);
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  padding: 24px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
  border-color: rgba(255, 255, 255, 0.2);
}

.project-card h3 {
  margin: 0 0 12px;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

.project-card p {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0 0 16px;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.status-inactive { background: rgba(239, 68, 68, 0.1); color: #f87171; }
.status-archived { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

.team {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.project-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--neon-blue);
  font-weight: 500;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}
</style>