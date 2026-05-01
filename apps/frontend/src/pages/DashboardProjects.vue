<template>
  <div class="projects-page">
    <div class="page-header">
      <h1>Projetos</h1>
      <button class="btn btn-primary" @click="openModal()">+ Novo Projeto</button>
    </div>
    <div class="table-container glass-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Equipe</th>
            <th>Status</th>
            <th>Início</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td>{{ project.name }}</td>
            <td>{{ project.description }}</td>
            <td>{{ getTeamName(project.teamId) }}</td>
            <td>
              <span :class="['status', 'status-' + project.status]">
                {{ statusLabels[project.status] || project.status }}
              </span>
            </td>
            <td>{{ formatDate(project.startDate) }}</td>
            <td>
              <button class="btn-icon" style="color: var(--neon-blue)" @click="$router.push(`/app/project/${project.id}`)">Board</button>
              <button class="btn-icon" @click="openModal(project)">Editar</button>
              <button class="btn-icon danger" @click="deleteProject(project.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="projects.length === 0" class="empty-state">Nenhum projeto encontrado.</p>
    </div>

    <!-- Drawer Novo Projeto -->
    <GlassDrawer :isOpen="showModal" @close="closeModal" title="Criar Novo Projeto">
      <form @submit.prevent="createProject" class="drawer-form">
        <div class="form-group">
          <label>Nome do Projeto</label>
          <input v-model="form.name" type="text" required placeholder="Ex: App Mobile" class="dark-input" />
        </div>
        
        <div class="form-group">
          <label>Equipe Responsável</label>
          <select v-model="form.teamId" class="dark-input select-dark" required>
            <option value="" disabled selected>Selecione uma equipe</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>

        <div class="drawer-actions mt-4">
          <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Criando...' : 'Salvar Projeto' }}
          </button>
        </div>
      </form>
    </GlassDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { parseJwt } from '../utils/jwt';
import GlassDrawer from '../components/GlassDrawer.vue';

interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string;
  teamId: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

interface Team {
  id: string;
  name: string;
}

const projects = ref<Project[]>([]);
const teams = ref<Team[]>([]);
const showModal = ref(false);
const loading = ref(false);
const editingProject = ref<Project | null>(null);
const form = ref({
  name: '',
  description: '',
  teamId: '',
  status: 'active',
  startDate: '',
  endDate: '',
});

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
};

const getCompanyId = () => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  const payload = parseJwt(token);
  return payload?.companyId || '';
};

const getTeamName = (teamId?: string) => {
  if (!teamId) return '-';
  const team = teams.value.find(t => t.id === teamId);
  return team?.name || '-';
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

const fetchData = async () => {
  try {
    const companyId = getCompanyId();
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const [projectsRes, teamsRes] = await Promise.all([
      fetch(`${baseUrl}/api/projects?companyId=${companyId}`),
      fetch(`${baseUrl}/api/teams?companyId=${companyId}`),
    ]);
    if (projectsRes.ok) projects.value = await projectsRes.json();
    if (teamsRes.ok) teams.value = await teamsRes.json();
  } catch {
    projects.value = [];
    teams.value = [];
  }
};

const openModal = (project?: Project) => {
  if (project) {
    editingProject.value = project;
    form.value = {
      name: project.name,
      description: project.description || '',
      teamId: project.teamId || '',
      status: project.status || 'active',
      startDate: project.startDate?.split('T')[0] || '',
      endDate: project.endDate?.split('T')[0] || '',
    };
  } else {
    editingProject.value = null;
    form.value = { name: '', description: '', teamId: '', status: 'active', startDate: '', endDate: '' };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const createProject = async () => {
  loading.value = true;
  const baseUrl = import.meta.env.VITE_API_URL || '';
  try {
    const companyId = getCompanyId();
    const url = editingProject.value ? `${baseUrl}/api/projects/${editingProject.value.id}` : `${baseUrl}/api/projects`;
    const method = editingProject.value ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, companyId }),
    });
    if (res.ok) {
      showModal.value = false;
      fetchData();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const deleteProject = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir?')) {
    await fetch((import.meta.env.VITE_API_URL || '') + `/api/projects/${id}`, { method: 'DELETE' });
    fetchData();
  }
};

onMounted(fetchData);
</script>

<style scoped>
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
.mt-6 { margin-top: 1.5rem; }
.mt-4 { margin-top: 1rem; }

.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>