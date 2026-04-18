<template>
  <div class="projects-page">
    <h1>Meus Projetos</h1>
    <div class="projects-grid">
      <div v-for="project in projects" :key="project.id" class="project-card" @click="goToProject(project.id)">
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
    const res = await fetch('/api/projects', {
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
.projects-page h1 {
  color: #1a1a2e;
  margin-bottom: 24px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.project-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-card h3 {
  margin: 0 0 8px;
  color: #1a1a2e;
}

.project-card p {
  color: #666;
  font-size: 14px;
  margin: 0 0 12px;
}

.project-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-active { background: #d1fae5; color: #065f46; }
.status-inactive { background: #fee2e2; color: #991b1b; }
.status-archived { background: #e5e5e5; color: #666; }

.team {
  font-size: 12px;
  color: #888;
}

.project-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #4f46e5;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: #666;
  grid-column: 1 / -1;
}
</style>