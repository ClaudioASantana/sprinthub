<template>
  <div class="tasks-page">
    <div class="page-header">
      <div>
        <button class="btn-back" @click="$router.push('/dashboard/projects')">← Voltar</button>
        <h1>Backlog de Tarefas</h1>
      </div>
      <button class="btn-primary" @click="openModal()">+ Nova Tarefa</button>
    </div>

    <div class="kanban-board">
      <div class="kanban-column">
        <div class="column-header">
          <h3>A Fazer</h3>
          <span class="count">{{ getTasksByStatus('todo').length }}</span>
        </div>
        <div class="column-content">
          <div 
            v-for="task in getTasksByStatus('todo')" 
            :key="task.id" 
            class="task-card"
            @click="openModal(task)"
          >
            <span :class="['task-type', 'type-' + task.type]">{{ typeLabels[task.type] }}</span>
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ truncate(task.description, 60) }}</p>
            <div class="task-meta">
              <span :class="['priority', 'priority-' + task.priority]">{{ priorityLabels[task.priority] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="kanban-column">
        <div class="column-header">
          <h3>Em Progresso</h3>
          <span class="count">{{ getTasksByStatus('in_progress').length }}</span>
        </div>
        <div class="column-content">
          <div 
            v-for="task in getTasksByStatus('in_progress')" 
            :key="task.id" 
            class="task-card"
            @click="openModal(task)"
          >
            <span :class="['task-type', 'type-' + task.type]">{{ typeLabels[task.type] }}</span>
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ truncate(task.description, 60) }}</p>
            <div class="task-meta">
              <span :class="['priority', 'priority-' + task.priority]">{{ priorityLabels[task.priority] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="kanban-column">
        <div class="column-header">
          <h3>Concluído</h3>
          <span class="count">{{ getTasksByStatus('done').length }}</span>
        </div>
        <div class="column-content">
          <div 
            v-for="task in getTasksByStatus('done')" 
            :key="task.id" 
            class="task-card"
            @click="openModal(task)"
          >
            <span :class="['task-type', 'type-' + task.type]">{{ typeLabels[task.type] }}</span>
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ truncate(task.description, 60) }}</p>
            <div class="task-meta">
              <span :class="['priority', 'priority-' + task.priority]">{{ priorityLabels[task.priority] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>{{ editingTask ? 'Editar Tarefa' : 'Nova Tarefa' }}</h2>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Título</label>
            <input v-model="form.title" type="text" required />
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Tipo</label>
              <select v-model="form.type">
                <option value="story">Story</option>
                <option value="bug">Bug</option>
                <option value="task">Task</option>
                <option value="epic">Epic</option>
              </select>
            </div>
            <div class="form-group">
              <label>Prioridade</label>
              <select v-model="form.priority">
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Progresso</option>
                <option value="done">Concluído</option>
              </select>
            </div>
            <div class="form-group">
              <label>Sprint</label>
              <select v-model="form.sprintId">
                <option value="">Nenhum</option>
                <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
                  {{ sprint.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button v-if="editingTask" type="button" class="btn-danger" @click="deleteTask">Excluir</button>
            <div class="spacer"></div>
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

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  projectId: string;
  sprintId?: string;
}

interface Sprint {
  id: string;
  name: string;
}

const route = useRoute();
const projectId = computed(() => route.query.projectId as string || '1');
const tasks = ref<Task[]>([]);
const sprints = ref<Sprint[]>([]);
const showModal = ref(false);
const editingTask = ref<Task | null>(null);
const form = ref({
  title: '',
  description: '',
  type: 'task',
  status: 'todo',
  priority: 'medium',
  sprintId: '',
});

const typeLabels: Record<string, string> = {
  story: 'Story', bug: 'Bug', task: 'Task', epic: 'Epic',
};
const priorityLabels: Record<string, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta',
};

const truncate = (str: string, len: number) => 
  str.length > len ? str.slice(0, len) + '...' : str;

const getTasksByStatus = (status: string) => 
  tasks.value.filter(t => t.status === status);

const fetchData = async () => {
  try {
    const [tasksRes, sprintsRes] = await Promise.all([
      fetch(`/api/tasks?projectId=${projectId.value}`),
      fetch(`/api/sprints?projectId=${projectId.value}`),
    ]);
    if (tasksRes.ok) tasks.value = await tasksRes.json();
    if (sprintsRes.ok) sprints.value = await sprintsRes.json();
  } catch { tasks.value = []; }
};

const openModal = (task?: Task) => {
  if (task) {
    editingTask.value = task;
    form.value = {
      title: task.title,
      description: task.description || '',
      type: task.type || 'task',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      sprintId: task.sprintId || '',
    };
  } else {
    editingTask.value = null;
    form.value = { title: '', description: '', type: 'task', status: 'todo', priority: 'medium', sprintId: '' };
  }
  showModal.value = true;
};

const saveTask = async () => {
  try {
    const url = editingTask.value ? `/api/tasks/${editingTask.value.id}` : '/api/tasks';
    const method = editingTask.value ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, projectId: projectId.value }),
    });
    if (res.ok) { showModal.value = false; fetchData(); }
  } catch (e) { console.error(e); }
};

const deleteTask = async () => {
  if (!editingTask.value) return;
  if (confirm('Excluir esta tarefa?')) {
    await fetch(`/api/tasks/${editingTask.value.id}`, { method: 'DELETE' });
    showModal.value = false;
    fetchData();
  }
};

onMounted(fetchData);
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header > div { display: flex; align-items: center; gap: 16px; }
.btn-back { background: none; border: none; color: #4f46e5; cursor: pointer; }
.page-header h1 { color: #1a1a2e; margin: 0; }

.btn-primary { background: #4f46e5; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
.btn-secondary { background: #e5e5e5; color: #333; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
.btn-danger { background: #dc2626; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }

.kanban-board { display: flex; gap: 16px; overflow-x: auto; }
.kanban-column { flex: 1; min-width: 280px; background: #f1f3f5; border-radius: 12px; padding: 12px; }
.column-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.column-header h3 { margin: 0; font-size: 14px; color: #333; }
.count { background: #e5e5e5; padding: 2px 8px; border-radius: 10px; font-size: 12px; }

.task-card { background: #fff; border-radius: 8px; padding: 12px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.task-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.task-type { display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-bottom: 6px; }
.type-story { background: #dbeafe; color: #1e40af; }
.type-bug { background: #fee2e2; color: #991b1b; }
.type-task { background: #d1fae5; color: #065f46; }
.type-epic { background: #fef3c7; color: #92400e; }
.task-card h4 { margin: 0 0 4px; font-size: 14px; color: #333; }
.task-card p { margin: 0; font-size: 12px; color: #666; }
.task-meta { margin-top: 8px; }
.priority { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
.priority-low { background: #e5e5e5; color: #666; }
.priority-medium { background: #fef3c7; color: #92400e; }
.priority-high { background: #fee2e2; color: #991b1b; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
.modal { background: #fff; padding: 24px; border-radius: 12px; width: 450px; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin-bottom: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 8px; border: 1px solid #e5e5e5; border-radius: 6px; }
.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
.spacer { flex: 1; }
</style>