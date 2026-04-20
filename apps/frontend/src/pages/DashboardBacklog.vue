<template>
  <div class="backlog-page">
    <div class="page-header">
      <div>
        <button class="btn-back" @click="$router.push('/dashboard/projects')">← Voltar</button>
        <h1>Product Backlog</h1>
      </div>
    </div>

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

    <!-- Tabela do Backlog -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Título</th>
            <th>Prioridade</th>
            <th>Pontos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in backlogTasks" :key="task.id">
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
            <td>
              <button class="btn-icon" @click="openModal(task)">Editar</button>
              <button class="btn-icon danger" @click="deleteTask(task.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="backlogTasks.length === 0" class="empty-state">O backlog está vazio. Adicione uma ideia acima!</p>
    </div>

    <!-- Drawer Nova Tarefa -->
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
import { ref, onMounted, computed } from 'vue'
import GlassDrawer from '../components/GlassDrawer.vue';
import { useRoute } from 'vue-router';
import { parseJwt } from '../utils/jwt';

const route = useRoute();
const projectId = computed(() => route.query.projectId as string || '1');
const loading = ref(false);
const projects = ref<any[]>([]);

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
  type: 'story'
});

const form = ref({
  title: '',
  description: '',
  type: 'story',
  priority: 'medium',
  storyPoints: 0 as number | null,
  status: 'todo',
  projectId: ''
});

// Formatadores
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

const fetchBacklog = async () => {
  try {
    const companyId = getCompanyId();
    const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/tasks?projectId=${projectId.value}&companyId=${companyId}&sprintId=null`);
    if (res.ok) {
      backlogTasks.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch backlog', err);
    backlogTasks.value = [];
  }
};

const fetchProjects = async () => {
  try {
    const companyId = getCompanyId();
    const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/projects?companyId=${companyId}`);
    if (res.ok) {
      projects.value = await res.json();
    }
  } catch (e) {
    console.error(e);
  }
};

const quickAddTask = async () => {
  if (!quickAddForm.value.title.trim()) return;
  
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: quickAddForm.value.title,
        type: quickAddForm.value.type,
        projectId: projectId.value,
        status: 'todo',
        priority: 'medium',
        sprintId: null
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
      projectId: task.projectId || ''
    };
  } else {
    editingTask.value = null;
    form.value = { title: '', description: '', type: 'story', status: 'todo', priority: 'medium', storyPoints: null, projectId: '' };
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
    const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/tasks/${editingTask.value.id}`, {
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
    await fetch((import.meta.env.VITE_API_URL || '') + `/api/tasks/${id}`, { method: 'DELETE' });
    fetchBacklog();
  }
};

onMounted(() => {
  fetchProjects();
  fetchBacklog();
});
</script>

<style scoped>
.quick-add-container {
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.quick-add-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.quick-type-select {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  font-weight: 500;
  color: #475569;
  outline: none;
}

.quick-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  font-size: 15px;
  transition: all 0.2s;
}

.quick-input:focus {
  outline: none;
  border-color: #4f46e5;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.task-title-cell {
  font-weight: 500;
  color: #0f172a;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-points {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.type-story { background: #dbf4ff; color: #0070f3; }
.type-epic { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.type-task { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.type-bug { background: #fee2e2; color: #dc2626; }

.priority-low { background: #f1f5f9; color: #64748b; }
.priority-medium { background: #fef9c3; color: #a16207; }
.priority-high { background: #fecaca; color: #dc2626; }

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
