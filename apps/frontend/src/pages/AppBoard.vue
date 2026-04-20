<template>
  <div class="board-page">
    <div class="page-header">
      <button class="btn-back" @click="$router.push('/app')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Projetos
      </button>
      <div class="header-titles">
        <div class="title-with-filter">
          <h1>{{ project?.name || 'Carregando Board...' }}</h1>
          <select v-model="selectedSprintId" @change="fetchData" class="sprint-filter">
            <option value="all">Todas as Tarefas</option>
            <option value="backlog">Product Backlog</option>
            <option v-for="s in sprints" :key="s.id" :value="s.id">
              {{ s.name }} ({{ s.status }})
            </option>
          </select>
        </div>
        <p class="subtitle" v-if="project?.description">{{ truncate(project.description, 80) }}</p>
      </div>
    </div>
    
    <div class="kanban-board">
      <div 
        class="kanban-column"
        @dragover.prevent
        @dragenter.prevent
        @drop="onDrop($event, 'todo')"
      >
        <div class="column-header">
          <div class="column-title">
            <span class="status-dot status-todo"></span>
            <h3>A Fazer</h3>
            <span class="count">{{ getTasksByStatus('todo').length }}</span>
          </div>
          <button class="btn-add-task" @click="openCreatePanel('todo')" title="Criar Nova Tarefa">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
        <div class="column-content">
          <div 
            v-for="task in getTasksByStatus('todo')" 
            :key="task.id" 
            class="task-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @click="selectTask(task)"
          >
            <div class="card-badges">
              <span :class="['badge-type', 'type-' + task.type]">{{ typeLabels[task.type] || task.type }}</span>
              <span :class="['badge-priority', 'priority-' + task.priority]">{{ priorityLabels[task.priority] || task.priority }}</span>
              <span v-if="task.assignee" class="card-avatar" :title="task.assignee.name">{{ task.assignee.name.charAt(0).toUpperCase() }}</span>
            </div>
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ truncate(task.description, 60) }}</p>
          </div>
        </div>
      </div>

      <div 
        class="kanban-column"
        @dragover.prevent
        @dragenter.prevent
        @drop="onDrop($event, 'in_progress')"
      >
        <div class="column-header">
          <div class="column-title">
            <span class="status-dot status-progress"></span>
            <h3>Em Progresso</h3>
            <span class="count">{{ getTasksByStatus('in_progress').length }}</span>
          </div>
          <button class="btn-add-task" @click="openCreatePanel('in_progress')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
        <div class="column-content">
          <div 
            v-for="task in getTasksByStatus('in_progress')" 
            :key="task.id" 
            class="task-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @click="selectTask(task)"
          >
            <div class="card-badges">
              <span :class="['badge-type', 'type-' + task.type]">{{ typeLabels[task.type] || task.type }}</span>
              <span :class="['badge-priority', 'priority-' + task.priority]">{{ priorityLabels[task.priority] || task.priority }}</span>
              <span v-if="task.assignee" class="card-avatar" :title="task.assignee.name">{{ task.assignee.name.charAt(0).toUpperCase() }}</span>
            </div>
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ truncate(task.description, 60) }}</p>
          </div>
        </div>
      </div>

      <div 
        class="kanban-column"
        @dragover.prevent
        @dragenter.prevent
        @drop="onDrop($event, 'done')"
      >
        <div class="column-header">
          <div class="column-title">
            <span class="status-dot status-done"></span>
            <h3>Concluído</h3>
            <span class="count">{{ getTasksByStatus('done').length }}</span>
          </div>
          <button class="btn-add-task" @click="openCreatePanel('done')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
        <div class="column-content">
          <div 
            v-for="task in getTasksByStatus('done')" 
            :key="task.id" 
            class="task-card done-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @click="selectTask(task)"
          >
            <div class="card-badges">
              <span :class="['badge-type', 'type-' + task.type]">{{ typeLabels[task.type] || task.type }}</span>
              <span :class="['badge-priority', 'priority-' + task.priority]">{{ priorityLabels[task.priority] || task.priority }}</span>
              <span v-if="task.assignee" class="card-avatar" :title="task.assignee.name">{{ task.assignee.name.charAt(0).toUpperCase() }}</span>
            </div>
            <h4 class="strikethrough">{{ task.title }}</h4>
            <p v-if="task.description">{{ truncate(task.description, 60) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay de Escurecimento -->
    <Transition name="fade">
      <div v-if="selectedTask || isCreating" class="side-overlay" @click="closePanel"></div>
    </Transition>

    <!-- Side Panel Lateral -->
    <Transition name="slide">
      <div v-if="selectedTask || isCreating" class="side-panel">
        <div class="panel-header">
          <h2>{{ isCreating ? 'Nova Tarefa' : activeTaskData?.title }}</h2>
          <button class="btn-close" @click="closePanel">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div class="panel-body">
          <div class="form-group" v-if="isCreating || editMode">
            <label>Título</label>
            <input type="text" v-model="activeTaskData.title" placeholder="Descreva brevemente a tarefa" class="form-control" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Responsável</label>
              <select v-model="activeTaskData.assigneeId" class="form-control" :disabled="!isCreating && !editMode">
                <option :value="undefined">Não atribuído</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Sprint</label>
              <select v-model="activeTaskData.sprintId" class="form-control" :disabled="!isCreating && !editMode">
                <option :value="null">Product Backlog</option>
                <option v-for="s in sprints" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo</label>
              <select v-model="activeTaskData.type" class="form-control" :disabled="!isCreating && !editMode">
                <option value="story">História</option>
                <option value="task">Tarefa</option>
                <option value="bug">Erro</option>
                <option value="epic">Épico</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Prioridade</label>
              <select v-model="activeTaskData.priority" class="form-control" :disabled="!isCreating && !editMode">
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Status da Tarefa</label>
            <div class="status-selector">
              <button 
                :class="['status-btn', activeTaskData.status === 'todo' ? 'active status-todo' : '']"
                @click="updateStatusInline('todo')"
              >A Fazer</button>
              <button 
                :class="['status-btn', activeTaskData.status === 'in_progress' ? 'active status-progress' : '']"
                @click="updateStatusInline('in_progress')"
              >Em Progresso</button>
              <button 
                :class="['status-btn', activeTaskData.status === 'done' ? 'active status-done' : '']"
                @click="updateStatusInline('done')"
              >Concluído</button>
            </div>
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea 
              v-model="activeTaskData.description" 
              class="form-control desc-area" 
              rows="5"
              placeholder="Adicione mais detalhes a esta tarefa..."
              :disabled="!isCreating && !editMode"
            ></textarea>
          </div>
        </div>

        <div class="panel-footer">
          <button class="btn-cancel" @click="closePanel">Cancelar</button>
          <button class="btn-save" @click="saveTask" :disabled="isSaving" v-if="isCreating || editMode">
             {{ isSaving ? 'Salvando...' : 'Salvar Tarefa' }}
          </button>
          <button class="btn-edit-toggle" @click="editMode = true" v-else>Editar Tarefa</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { parseJwt } from '../utils/jwt';

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  projectId?: string;
  sprintId?: string | null;
  assigneeId?: string | null;
  assignee?: { id: string, name: string };
}

const route = useRoute();
const projectId = computed(() => route.params.id as string);
const tasks = ref<Task[]>([]);
const project = ref<any>(null);
const sprints = ref<any[]>([]);
const users = ref<any[]>([]);
const selectedSprintId = ref<string>('all');

// Panel states
const selectedTask = ref<Task | null>(null);
const isCreating = ref(false);
const editMode = ref(false);
const isSaving = ref(false);
const activeTaskData = ref<Partial<Task>>({});

// Dragging ref
const draggedTask = ref<Task | null>(null);

// Mapeamento PT-BR para Badges Visuais
const typeLabels: Record<string, string> = { story: 'História', bug: 'Erro', task: 'Tarefa', epic: 'Épico' };
const priorityLabels: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };

const truncate = (str: string, len: number) => (str && str.length > len) ? str.slice(0, len) + '...' : str || '';

const getTasksByStatus = (status: string) => tasks.value.filter(t => t.status === status);

const getCompanyId = () => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  const payload = parseJwt(token);
  return payload?.companyId || '';
};

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    const companyId = getCompanyId();
    let taskUrl = `/api/tasks?projectId=${projectId.value}&companyId=${companyId}`;
    if (selectedSprintId.value === 'backlog') taskUrl += '&sprintId=null';
    else if (selectedSprintId.value !== 'all') taskUrl += `&sprintId=${selectedSprintId.value}`;

    const [projRes, tasksRes, sprintsRes, usersRes] = await Promise.all([
      fetch((import.meta.env.VITE_API_URL || '') + `/api/projects/${projectId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch((import.meta.env.VITE_API_URL || '') + taskUrl, { headers: { Authorization: `Bearer ${token}` } }),
      fetch((import.meta.env.VITE_API_URL || '') + `/api/sprints?projectId=${projectId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch((import.meta.env.VITE_API_URL || '') + `/api/users?companyId=1`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (projRes.ok) project.value = await projRes.json();
    if (tasksRes.ok) tasks.value = await tasksRes.json();
    if (sprintsRes.ok) sprints.value = await sprintsRes.json();
    if (usersRes.ok) users.value = await usersRes.json();
  } catch (err) {
    console.error(err);
  }
};

// --- DRAG AND DROP NATIVO ---
const onDragStart = (e: DragEvent, task: Task) => {
  draggedTask.value = task;
  if(e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.dropEffect = 'move';
    // Opcional: imagem fantasma customizada e opacidade
  }
};

const onDrop = async (_e: DragEvent, targetStatus: string) => {
  if (draggedTask.value && draggedTask.value.status !== targetStatus) {
    const task = draggedTask.value;
    // Otimista (update visual imediato)
    const oldStatus = task.status;
    task.status = targetStatus;
    
    // Atualiza remota
    const token = localStorage.getItem('token');
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: targetStatus }),
      });
      if(!res.ok) throw new Error();
    } catch {
      // Reverter se falhar
      task.status = oldStatus;
      console.error('Falha ao mover tarefa');
    }
  }
  draggedTask.value = null; // reseta
};

// --- SIDE PANEL E AÇÕES ---
const selectTask = (task: Task) => { 
  activeTaskData.value = { ...task };
  selectedTask.value = task; 
  isCreating.value = false;
  editMode.value = false;
};

const openCreatePanel = (initialStatus: string = 'todo') => {
  activeTaskData.value = { 
    title: '', description: '', type: 'task', priority: 'medium', status: initialStatus,
    sprintId: selectedSprintId.value !== 'all' && selectedSprintId.value !== 'backlog' ? selectedSprintId.value : null,
    assigneeId: undefined
  };
  isCreating.value = true;
  selectedTask.value = null;
  editMode.value = true;
};

const closePanel = () => {
  selectedTask.value = null;
  isCreating.value = false;
  editMode.value = false;
};

const updateStatusInline = async (newStatus: string) => {
  if (!activeTaskData.value) return;
  activeTaskData.value.status = newStatus;
  
  // Se for editando uma já existente (não criação), salva auto
  if(!isCreating.value && selectedTask.value) {
    const token = localStorage.getItem('token');
    await fetch((import.meta.env.VITE_API_URL || '') + `/api/tasks/${selectedTask.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData(); // resync
  }
};

const saveTask = async () => {
  if (!activeTaskData.value.title) return; // Validação básica
  
  isSaving.value = true;
  const token = localStorage.getItem('token');
  const payload = { ...activeTaskData.value, projectId: projectId.value };

  try {
    let method = isCreating.value ? 'POST' : 'PATCH';
    let url = isCreating.value ? `/api/tasks` : `/api/tasks/${selectedTask.value?.id}`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchData();
      closePanel();
    }
  } catch(err) {
    console.error('Erro ao salvar tarefa', err);
  } finally {
    isSaving.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
/* CORES base para os status e tema */
:root {
  --todo-color: #64748b;
  --progress-color: #3b82f6;
  --done-color: #10b981;
}

.board-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 24px 32px;
  background-color: transparent;
  box-sizing: border-box;
}

.page-header { 
  margin-bottom: 24px;
}
.header-titles h1 { 
  color: var(--color-text-primary); 
  margin: 12px 0 4px 0; 
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.title-with-filter {
  display: flex;
  align-items: center;
  gap: 16px;
}
.sprint-filter {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  color: var(--color-text-primary);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  margin-top: 8px;
}
.sprint-filter:focus {
  border-color: var(--neon-blue);
}
.header-titles .subtitle {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0;
}

/* Kanban Estrutura */
.kanban-board { 
  display: flex; 
  gap: 20px; 
  overflow-x: auto; 
  flex: 1;
  padding-bottom: 12px;
}
.kanban-column { 
  flex: 1; 
  min-width: 320px; 
  background: rgba(13, 11, 20, 0.4); 
  border-radius: 12px; 
  padding: 16px; 
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  transition: border 0.3s;
}

.kanban-column:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.column-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 16px; 
}
.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.status-todo { background-color: #94a3b8; }
.status-progress { background-color: #3b82f6; }
.status-done { background-color: #10b981; }

.column-title h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.count { background: rgba(255, 255, 255, 0.1); padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; color: var(--color-text-secondary);}

.btn-add-task {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-add-task:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  min-height: 100px;
}

/* CARDS */
.task-card { 
  background: var(--bg-card); 
  backdrop-filter: blur(8px);
  border-radius: 10px; 
  padding: 14px; 
  margin-bottom: 12px; 
  cursor: pointer; 
  box-shadow: var(--shadow-sm); 
  transition: all 0.2s ease-out; 
  border: 1px solid var(--border-color);
}
.task-card:hover { 
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 112, 243, 0.15);
}
.task-card[draggable="true"]:active {
  opacity: 0.8;
  cursor: grabbing;
}

.card-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.badge-type, .badge-priority { 
  font-size: 10px; 
  font-weight: 600;
  padding: 3px 8px; 
  border-radius: 20px; 
}
.type-story { background: rgba(67, 56, 202, 0.2); color: #818cf8; }
.type-bug { background: rgba(185, 28, 28, 0.2); color: #f87171; }
.type-task { background: rgba(21, 128, 61, 0.2); color: #4ade80; }
.type-epic { background: rgba(180, 83, 9, 0.2); color: #fbbf24; }

.priority-low { background: rgba(255, 255, 255, 0.1); color: #cbd5e1; }
.priority-medium { background: rgba(234, 179, 8, 0.1); color: #fde047; }
.priority-high { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }

.card-avatar {
  background: var(--neon-blue);
  color: white;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  margin-left: auto;
}

.task-card h4 { margin: 0 0 6px; font-size: 14px; color: var(--color-text-primary); line-height: 1.4; }
.task-card p { margin: 0; font-size: 12px; color: var(--color-text-secondary); line-height: 1.5; }

.done-card h4 {
  color: #64748b;
  text-decoration: line-through;
}

/* SIDE PANEL */
.side-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 40;
}

.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 100%;
  background: #1a1825;
  border-left: 1px solid var(--border-color);
  z-index: 50;
  box-shadow: -4px 0 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}
.btn-close {
  background: none; border: none; color: var(--color-text-secondary); cursor: pointer; padding: 4px; transition: color 0.2s;
}
.btn-close:hover { color: #fff; }

.panel-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.form-group { margin-bottom: 20px; }
.form-row { display: flex; gap: 16px; margin-bottom: 20px; }
.form-row .form-group { flex: 1; margin: 0; }

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}
.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--bg-darker);
  color: #fff;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.2s;
}
.form-control:focus {
  outline: none;
  border-color: var(--neon-blue);
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.2);
}
.form-control:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}
.desc-area { resize: vertical; }

.status-selector {
  display: flex;
  gap: 8px;
  background: var(--bg-darker);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.status-btn {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.status-btn.active {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-sm);
  color: #fff;
}
.status-btn.active.status-todo { color: #cbd5e1; }
.status-btn.active.status-progress { color: #60a5fa; }
.status-btn.active.status-done { color: #34d399; }

.panel-footer {
  padding: 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
}

.btn-cancel {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
.btn-save, .btn-edit-toggle {
  padding: 10px 24px;
  background: linear-gradient(135deg, #0070F3, #3B82F6);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(0, 112, 243, 0.3);
}
.btn-save:hover, .btn-edit-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 112, 243, 0.4);
}
.btn-save:disabled {
  background: rgba(0, 112, 243, 0.3);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>