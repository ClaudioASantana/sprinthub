<template>
  <div class="sprints-page">
    <div class="page-header">
      <div>
        <button class="btn-back" @click="$router.push('/dashboard/projects')">← Voltar</button>
        <h1>Sprints - {{ projectName }}</h1>
      </div>
      <button class="btn-primary" @click="openModal()">+ Novo Sprint</button>
    </div>
    <div class="sprints-grid">
      <div v-for="sprint in sprints" :key="sprint.id" class="sprint-card">
        <div class="sprint-header">
          <h3>{{ sprint.name }}</h3>
          <span :class="['status', 'status-' + sprint.status]">
            {{ statusLabels[sprint.status] || sprint.status }}
          </span>
        </div>
        <p class="sprint-goal">{{ sprint.goal || 'Sem objetivo definido' }}</p>
        <div class="sprint-dates">
          <span>{{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}</span>
        </div>
        <div class="sprint-stats">
          <span>{{ sprint.tasks?.length || 0 }} tarefas</span>
        </div>
        <div class="sprint-actions">
          <button class="btn-icon" @click="openModal(sprint)">Editar</button>
          <button class="btn-icon danger" @click="deleteSprint(sprint.id)">Excluir</button>
        </div>
      </div>
      <p v-if="sprints.length === 0" class="empty-state">Nenhum sprint encontrado.</p>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>{{ editingSprint ? 'Editar Sprint' : 'Novo Sprint' }}</h2>
        <form @submit.prevent="saveSprint">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.name" type="text" required placeholder="Ex: Sprint 1" />
          </div>
          <div class="form-group">
            <label>Objetivo</label>
            <textarea v-model="form.goal" rows="2" placeholder="Qual o objetivo deste sprint?"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data Início</label>
              <input v-model="form.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label>Data Fim</label>
              <input v-model="form.endDate" type="date" required />
            </div>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="planning">Planning</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: string;
  tasks?: any[];
}

const route = useRoute();
const projectId = computed(() => route.query.projectId as string || '1');
const projectName = ref('Projeto');
const sprints = ref<Sprint[]>([]);
const showModal = ref(false);
const editingSprint = ref<Sprint | null>(null);
const form = ref({
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  status: 'planning',
});

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  active: 'Ativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

const fetchSprints = async () => {
  try {
    const res = await fetch(`/api/sprints?projectId=${projectId.value}`);
    if (res.ok) sprints.value = await res.json();
  } catch {
    sprints.value = [];
  }
};

const openModal = (sprint?: Sprint) => {
  if (sprint) {
    editingSprint.value = sprint;
    form.value = {
      name: sprint.name,
      goal: sprint.goal || '',
      startDate: sprint.startDate?.split('T')[0] || '',
      endDate: sprint.endDate?.split('T')[0] || '',
      status: sprint.status || 'planning',
    };
  } else {
    editingSprint.value = null;
    form.value = { name: '', goal: '', startDate: '', endDate: '', status: 'planning' };
  }
  showModal.value = true;
};

const saveSprint = async () => {
  try {
    const url = editingSprint.value ? `/api/sprints/${editingSprint.value.id}` : '/api/sprints';
    const method = editingSprint.value ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, projectId: projectId.value }),
    });
    if (res.ok) {
      showModal.value = false;
      fetchSprints();
    }
  } catch (e) {
    console.error(e);
  }
};

const deleteSprint = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir?')) {
    await fetch(`/api/sprints/${id}`, { method: 'DELETE' });
    fetchSprints();
  }
};

onMounted(fetchSprints);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header > div { display: flex; align-items: center; gap: 16px; }
.btn-back {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 14px;
}
.page-header h1 { color: #1a1a2e; margin: 0; }

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

.sprints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.sprint-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
}

.sprint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.sprint-header h3 { margin: 0; color: #1a1a2e; }

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
.status-planning { background: #fef3c7; color: #92400e; }
.status-active { background: #d1fae5; color: #065f46; }
.status-completed { background: #e5e5e5; color: #666; }
.status-cancelled { background: #fee2e2; color: #991b1b; }

.sprint-goal {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.sprint-dates {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.sprint-stats {
  font-size: 12px;
  color: #4f46e5;
  font-weight: 500;
  margin-bottom: 12px;
}

.sprint-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 13px;
}
.btn-icon.danger { color: #dc2626; }

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px;
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
  width: 450px;
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