<template>
  <div class="sprints-page">
    <div class="page-header">
      <div>
        <button
          v-if="!embeddedInHub"
          class="btn-back"
          @click="$router.push('/dashboard/projects')"
        >← Voltar</button>
        <h1>Sprints<span v-if="!embeddedInHub"> - {{ projectName }}</span></h1>
      </div>
      <button class="btn btn-primary" @click="openModal()">+ Novo Sprint</button>
    </div>
    <div class="sprints-grid">
      <div v-for="sprint in sprints" :key="sprint.id" class="sprint-card glass-panel">
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
          <span v-if="sprintPoints(sprint) != null">
            {{ sprintPoints(sprint) }} pts
            <template v-if="sprint.capacityPoints != null"> / {{ sprint.capacityPoints }} cap</template>
          </span>
        </div>
        <div class="sprint-actions">
          <button class="btn-icon" @click="openModal(sprint)">Editar</button>
          <button class="btn-icon danger" @click="deleteSprint(sprint.id)">Excluir</button>
        </div>
      </div>
      <p v-if="sprints.length === 0" class="empty-state">Nenhum sprint encontrado.</p>
    </div>

    <!-- Drawer Nova Sprint -->
    <GlassDrawer :isOpen="showModal" @close="closeModal" title="Criar Nova Sprint">
      <form @submit.prevent="saveSprint" class="drawer-form">
        <div class="form-group">
          <label>Nome da Sprint</label>
          <input v-model="form.name" type="text" required placeholder="Ex: Sprint 42" class="dark-input" />
        </div>
        
        <div class="form-group">
          <label>Objetivo</label>
          <textarea v-model="form.goal" rows="2" class="dark-input" placeholder="Qual o objetivo deste sprint?"></textarea>
        </div>
        
        <div class="form-group">
          <label>Data de Início</label>
          <input v-model="form.startDate" type="date" required class="dark-input" />
        </div>
        
        <div class="form-group">
          <label>Data de Fim</label>
          <input v-model="form.endDate" type="date" required class="dark-input" />
        </div>

        <div class="form-group">
          <label>Status</label>
          <select v-model="form.status" class="dark-input">
            <option value="planning">Planning</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div class="form-group">
          <label>Capacidade (story points)</label>
          <input
            v-model.number="form.capacityPoints"
            type="number"
            min="0"
            class="dark-input"
            placeholder="Ex: 40"
          />
        </div>

        <div class="drawer-actions mt-4">
          <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar Sprint</button>
        </div>
      </form>
    </GlassDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import GlassDrawer from '../components/GlassDrawer.vue';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: string;
  capacityPoints?: number | null;
  tasks?: any[];
}

const route = useRoute();
const embeddedInHub = computed(() => !!route.params.id && route.path.includes('/app/project/'));
const projectId = computed(
  () => (route.params.id as string) || (route.query.projectId as string) || '',
);
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
  capacityPoints: null as number | null,
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

const sprintPoints = (sprint: Sprint) => {
  if (!sprint.tasks?.length) return 0;
  return sprint.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
};

const fetchSprints = async () => {
  if (!projectId.value) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/sprints?projectId=${projectId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) sprints.value = await res.json();

    const projRes = await fetch((import.meta.env.VITE_API_URL || '') + `/api/projects/${projectId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (projRes.ok) {
      const proj = await projRes.json();
      projectName.value = proj.name || 'Projeto';
    }
  } catch {
    sprints.value = [];
  }
};

watch(projectId, fetchSprints);

const openModal = (sprint?: Sprint) => {
  if (sprint) {
    editingSprint.value = sprint;
    form.value = {
      name: sprint.name,
      goal: sprint.goal || '',
      startDate: sprint.startDate?.split('T')[0] || '',
      endDate: sprint.endDate?.split('T')[0] || '',
      status: sprint.status || 'planning',
      capacityPoints: sprint.capacityPoints ?? null,
    };
  } else {
    editingSprint.value = null;
    form.value = {
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      capacityPoints: null,
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveSprint = async () => {
  try {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || '';
    const url = editingSprint.value
      ? `${base}/api/sprints/${editingSprint.value.id}`
      : `${base}/api/sprints`;
    const method = editingSprint.value ? 'PATCH' : 'POST';
    const payload = {
      ...form.value,
      capacityPoints:
        form.value.capacityPoints === null || form.value.capacityPoints === ('' as any)
          ? null
          : Number(form.value.capacityPoints),
      projectId: projectId.value,
    };
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showModal.value = false;
      fetchSprints();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`Erro: ${err.message || res.statusText}`);
    }
  } catch (e) {
    console.error(e);
    alert('Erro ao salvar sprint');
  }
};

const deleteSprint = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir?')) {
    const token = localStorage.getItem('token');
    await fetch((import.meta.env.VITE_API_URL || '') + `/api/sprints/${id}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchSprints();
  }
};

onMounted(fetchSprints);
</script>

<style scoped>
.sprints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.sprint-card {
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.sprint-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
  border-color: rgba(255, 255, 255, 0.2);
}

.sprint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.sprint-header h3 { margin: 0; color: var(--color-text-primary); font-size: 18px; font-weight: 600; }

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}
.status-planning { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border-color: rgba(245, 158, 11, 0.2); }
.status-active { background: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.2); }
.status-completed { background: rgba(148, 163, 184, 0.1); color: #94a3b8; border-color: rgba(148, 163, 184, 0.2); }
.status-cancelled { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }

.sprint-goal {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.sprint-dates {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sprint-stats {
  font-size: 13px;
  color: var(--neon-blue);
  font-weight: 500;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(0, 112, 243, 0.1);
  border-radius: 8px;
  display: inline-block;
}

.sprint-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

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