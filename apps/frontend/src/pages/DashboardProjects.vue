<template>
  <div class="projects-page">
    <div class="page-header">
      <h1>Projetos</h1>
      <button class="btn-primary" @click="openModal()">+ Novo Projeto</button>
    </div>
    <div class="table-container">
      <table>
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
              <button class="btn-icon" @click="openModal(project)">Editar</button>
              <button class="btn-icon danger" @click="deleteProject(project.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="projects.length === 0" class="empty-state">Nenhum projeto encontrado.</p>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>{{ editingProject ? 'Editar Projeto' : 'Novo Projeto' }}</h2>
        <form @submit.prevent="saveProject">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Equipe</label>
            <select v-model="form.teamId">
              <option value="">Selecione...</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data Início</label>
              <input v-model="form.startDate" type="date" />
            </div>
            <div class="form-group">
              <label>Data Fim</label>
              <input v-model="form.endDate" type="date" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

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
    const [projectsRes, teamsRes] = await Promise.all([
      fetch('/api/projects?companyId=1'),
      fetch('/api/teams?companyId=1'),
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

const saveProject = async () => {
  try {
    const url = editingProject.value ? `/api/projects/${editingProject.value.id}` : '/api/projects';
    const method = editingProject.value ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, companyId: '1' }),
    });
    if (res.ok) {
      showModal.value = false;
      fetchData();
    }
  } catch (e) {
    console.error(e);
  }
};

const deleteProject = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir?')) {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    fetchData();
  }
};

onMounted(fetchData);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h1 { color: #1a1a2e; }

.btn-primary {
  background: #4f46e5;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-secondary {
  background: #e5e5e5;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.table-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
}

table { width: 100%; border-collapse: collapse; }
th, td { padding: 16px; text-align: left; border-bottom: 1px solid #e5e5e5; }
th { background: #f8f9fa; font-weight: 600; }

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
.status-active { background: #d1fae5; color: #065f46; }
.status-inactive { background: #fee2e2; color: #991b1b; }
.status-archived { background: #e5e5e5; color: #666; }

.btn-icon {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  margin-right: 8px;
}
.btn-icon.danger { color: #dc2626; }

.empty-state {
  text-align: center;
  padding: 24px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 { margin-bottom: 16px; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
}
.form-row .form-group { flex: 1; }

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>