<template>
  <div class="backlog-page">
    <div class="page-header" v-if="!embeddedInHub">
      <div>
        <button class="btn-back" @click="$router.push('/dashboard/projects')">← Voltar</button>
        <h1>Product Backlog</h1>
      </div>
    </div>
    <div class="page-header" v-else>
      <h1>Product Backlog</h1>
      <p class="hint">Arraste itens para um sprint ou use “Mover para…”</p>
    </div>

    <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

    <!-- Quick Add Form -->
    <div class="quick-add-container">
      <form @submit.prevent="quickAddTask" class="quick-add-form">
        <select v-model="quickAddForm.type" class="quick-type-select">
          <option value="story">Story</option>
          <option value="epic">Epic</option>
          <option value="bug">Bug</option>
          <option value="task">Task</option>
        </select>
        <input
          v-model="quickAddForm.title"
          type="text"
          placeholder="O que precisa ser construído? (Aperte Enter para salvar)"
          class="quick-input"
          required
        />
        <button type="submit" class="btn btn-primary" :disabled="!quickAddForm.title.trim()">
          Adicionar
        </button>
      </form>
    </div>

    <div class="planning-layout">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Tipo</th>
              <th>Título</th>
              <th>Prioridade</th>
              <th>Pontos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in backlogTasks"
              :key="task.id"
              class="backlog-row"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
              @click="openModal(task)"
            >
              <td class="drag-handle" title="Arrastar para um sprint">⋮⋮</td>
              <td>
                <span :class="['status', 'type-' + task.type]">{{ formatType(task.type) }}</span>
              </td>
              <td class="task-title-cell">{{ task.title }}</td>
              <td>
                <span :class="['status', 'priority-' + task.priority]">{{ formatPriority(task.priority) }}</span>
              </td>
              <td>
                <span class="story-points">{{ task.storyPoints || '-' }} pts</span>
              </td>
              <td class="actions-cell" @click.stop>
                <select
                  class="move-select"
                  :value="''"
                  @change="onMoveSelect(task, ($event.target as HTMLSelectElement).value, $event)"
                >
                  <option value="" disabled>Mover para…</option>
                  <option v-for="s in movableSprints" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
                <button class="btn-icon" type="button" @click="openModal(task)">Editar</button>
                <button class="btn-icon danger" type="button" @click="deleteTask(task.id)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="backlogTasks.length === 0" class="empty-state">
          O backlog está vazio. Adicione uma ideia acima!
        </p>
      </div>

      <aside class="sprint-targets">
        <h3>Sprints destino</h3>
        <p v-if="movableSprints.length === 0" class="empty-state small">
          Nenhum sprint planning/ativo. Crie um na aba Sprints.
        </p>
        <div
          v-for="sprint in movableSprints"
          :key="sprint.id"
          class="sprint-drop glass-panel"
          :class="{ 'drop-active': dropTargetId === sprint.id }"
          @dragover.prevent="dropTargetId = sprint.id"
          @dragleave="onDragLeave(sprint.id)"
          @drop="onDrop($event, sprint.id)"
        >
          <div class="sprint-drop-header">
            <strong>{{ sprint.name }}</strong>
            <span :class="['status', 'status-' + sprint.status]">{{ sprint.status }}</span>
          </div>
          <p class="sprint-drop-goal">{{ sprint.goal || 'Sem objetivo' }}</p>
          <p class="sprint-drop-hint">Solte aqui para incluir no sprint</p>
        </div>
      </aside>
    </div>

    <GlassDrawer :isOpen="showModal" @close="closeModal" title="Editar Tarefa">
      <form @submit.prevent="saveTask" class="drawer-form">
        <div class="form-group">
          <label>Título</label>
          <input v-model="form.title" type="text" required class="dark-input" placeholder="Ex: Ajustar botão de login" />
        </div>

        <div class="form-group">
          <label>Descrição</label>
          <textarea v-model="form.description" rows="3" class="dark-input" placeholder="Detalhes da tarefa..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tipo</label>
            <select v-model="form.type" class="dark-input">
              <option value="story">Story</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="epic">Epic</option>
            </select>
          </div>
          <div class="form-group">
            <label>Prioridade</label>
            <select v-model="form.priority" class="dark-input">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Pontos</label>
            <input
              v-model.number="form.storyPoints"
              type="number"
              min="0"
              class="dark-input"
              placeholder="Ex: 5"
            />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" class="dark-input">
              <option value="todo">A Fazer</option>
              <option value="in_progress">Em Progresso</option>
              <option value="done">Concluído</option>
            </select>
          </div>
        </div>

        <div class="drawer-actions mt-4">
          <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar Tarefa' }}
          </button>
        </div>
      </form>
    </GlassDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import GlassDrawer from '../components/GlassDrawer.vue';
import { useRoute } from 'vue-router';
import { parseJwt } from '../utils/jwt';

const route = useRoute();
const embeddedInHub = computed(() => !!route.params.id && route.path.includes('/app/project/'));
const selectedProjectId = ref<string>(
  (route.params.id as string) || (route.query.projectId as string) || '',
);
const loading = ref(false);
const projects = ref<any[]>([]);
const sprints = ref<any[]>([]);
const errorMsg = ref('');
const draggedTask = ref<Task | null>(null);
const dropTargetId = ref<string | null>(null);

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  storyPoints?: number;
  projectId?: string;
}

const backlogTasks = ref<Task[]>([]);
const showModal = ref(false);
const editingTask = ref<Task | null>(null);

const quickAddForm = ref({
  title: '',
  type: 'story',
});

const form = ref({
  title: '',
  description: '',
  type: 'story',
  priority: 'medium',
  storyPoints: 0 as number | null,
  status: 'todo',
  projectId: '',
});

const movableSprints = computed(() =>
  sprints.value.filter((s) => s.status === 'planning' || s.status === 'active'),
);

const formatType = (type: string) => {
  const map: Record<string, string> = { epic: 'Epic', story: 'História', task: 'Tarefa', bug: 'Bug' };
  return map[type] || type;
};
const formatPriority = (p: string) => {
  const map: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };
  return map[p] || p;
};

const getCompanyId = () => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  const payload = parseJwt(token);
  return payload?.companyId || '';
};

const api = (path: string, init?: RequestInit) => {
  const token = localStorage.getItem('token');
  return fetch((import.meta.env.VITE_API_URL || '') + path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

const fetchBacklog = async () => {
  if (!selectedProjectId.value) return;
  try {
    const companyId = getCompanyId();
    const res = await api(
      `/api/tasks?projectId=${selectedProjectId.value}&companyId=${companyId}&sprintId=null`,
    );
    if (res.ok) backlogTasks.value = await res.json();
  } catch (err) {
    console.error('Failed to fetch backlog', err);
    backlogTasks.value = [];
  }
};

const fetchSprints = async () => {
  if (!selectedProjectId.value) return;
  try {
    const res = await api(`/api/sprints?projectId=${selectedProjectId.value}`);
    if (res.ok) sprints.value = await res.json();
  } catch {
    sprints.value = [];
  }
};

const fetchProjects = async () => {
  try {
    const companyId = getCompanyId();
    const res = await api(`/api/projects?companyId=${companyId}`);
    if (res.ok) {
      projects.value = await res.json();
      if (!selectedProjectId.value && projects.value.length > 0) {
        selectedProjectId.value = projects.value[0].id;
        await Promise.all([fetchBacklog(), fetchSprints()]);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const moveTaskToSprint = async (taskId: string, sprintId: string) => {
  errorMsg.value = '';
  try {
    const res = await api(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sprintId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      errorMsg.value = err.message || `Falha ao mover tarefa (${res.status})`;
      return;
    }
    await fetchBacklog();
  } catch (e) {
    console.error(e);
    errorMsg.value = 'Erro de rede ao mover tarefa.';
  }
};

const onDragStart = (event: DragEvent, task: Task) => {
  draggedTask.value = task;
  event.dataTransfer?.setData('text/plain', task.id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
};

const onDragEnd = () => {
  draggedTask.value = null;
  dropTargetId.value = null;
};

const onDragLeave = (sprintId: string) => {
  if (dropTargetId.value === sprintId) dropTargetId.value = null;
};

const onDrop = async (event: DragEvent, sprintId: string) => {
  event.preventDefault();
  const taskId = event.dataTransfer?.getData('text/plain') || draggedTask.value?.id;
  dropTargetId.value = null;
  draggedTask.value = null;
  if (!taskId) return;
  await moveTaskToSprint(taskId, sprintId);
};

const onMoveSelect = async (task: Task, sprintId: string, event: Event) => {
  const el = event.target as HTMLSelectElement;
  if (!sprintId) return;
  await moveTaskToSprint(task.id, sprintId);
  el.value = '';
};

const quickAddTask = async () => {
  if (!quickAddForm.value.title.trim()) return;

  try {
    const res = await api('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: quickAddForm.value.title,
        type: quickAddForm.value.type,
        projectId: selectedProjectId.value,
        status: 'todo',
        priority: 'medium',
        sprintId: null,
      }),
    });

    if (res.ok) {
      quickAddForm.value.title = '';
      fetchBacklog();
    }
  } catch (e) {
    console.error(e);
  }
};

const openModal = (task?: Task) => {
  if (task) {
    editingTask.value = task;
    form.value = {
      title: task.title,
      description: task.description || '',
      type: task.type || 'story',
      priority: task.priority || 'medium',
      storyPoints: task.storyPoints || null,
      status: task.status || 'todo',
      projectId: task.projectId || '',
    };
  } else {
    editingTask.value = null;
    form.value = {
      title: '',
      description: '',
      type: 'story',
      status: 'todo',
      priority: 'medium',
      storyPoints: null,
      projectId: '',
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveTask = async () => {
  if (!editingTask.value) return;
  loading.value = true;

  try {
    const res = await api(`/api/tasks/${editingTask.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value }),
    });
    if (res.ok) {
      showModal.value = false;
      fetchBacklog();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const deleteTask = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta tarefa do backlog?')) {
    await api(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchBacklog();
  }
};

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      selectedProjectId.value = id as string;
      await Promise.all([fetchBacklog(), fetchSprints()]);
    }
  },
);

onMounted(async () => {
  await fetchProjects();
  if (selectedProjectId.value) {
    await Promise.all([fetchBacklog(), fetchSprints()]);
  }
});
</script>

<style scoped>
.hint {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.error-banner {
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
}

.planning-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .planning-layout {
    grid-template-columns: 1fr;
  }
}

.quick-add-container {
  background: var(--bg-card, #1a1825);
  backdrop-filter: blur(8px);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.quick-add-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.quick-type-select {
  padding: 10px 14px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  background-color: var(--bg-darker, #0d0b14);
  font-weight: 500;
  color: var(--color-text-primary, #fff);
  outline: none;
}

.quick-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  background-color: var(--bg-darker, #0d0b14);
  font-size: 15px;
  color: var(--color-text-primary, #fff);
}

.quick-input:focus {
  outline: none;
  border-color: var(--neon-blue, #0070f3);
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.2);
}

.backlog-row {
  cursor: pointer;
}

.backlog-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.drag-handle {
  color: var(--color-text-secondary);
  user-select: none;
  width: 28px;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.task-title-cell {
  font-weight: 500;
  color: var(--color-text-primary, #fff);
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.move-select {
  max-width: 140px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--bg-darker, #0d0b14);
  color: var(--color-text-primary);
  border: 1px solid var(--border-color);
  font-size: 12px;
}

.story-points {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary, #94a3b8);
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.sprint-targets h3 {
  margin: 0 0 12px;
  font-size: 0.95rem;
}

.sprint-drop {
  padding: 14px;
  margin-bottom: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  transition: border-color 0.15s, background 0.15s;
}

.sprint-drop.drop-active {
  border-color: var(--neon-blue, #5b8def);
  background: rgba(91, 141, 239, 0.08);
}

.sprint-drop-header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.sprint-drop-goal {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.sprint-drop-hint {
  margin: 8px 0 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  opacity: 0.8;
}

.empty-state.small {
  font-size: 0.85rem;
}

.type-story { background: rgba(67, 56, 202, 0.2); color: #818cf8; }
.type-epic { background: rgba(180, 83, 9, 0.2); color: #fbbf24; }
.type-task { background: rgba(21, 128, 61, 0.2); color: #4ade80; }
.type-bug { background: rgba(185, 28, 28, 0.2); color: #f87171; }

.priority-low { background: rgba(255, 255, 255, 0.1); color: #cbd5e1; }
.priority-medium { background: rgba(234, 179, 8, 0.1); color: #fde047; }
.priority-high { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }

.status-planning { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }
.status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; }

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
