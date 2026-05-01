<template>
  <div class="tasks-page">
    <div class="page-header">
      <h1>Minhas Tarefas</h1>
    </div>
    <div class="tasks-list">
      <div v-for="task in tasks" :key="task.id" class="task-item glass-panel" @click="selectTask(task)">
        <div class="task-header">
          <span :class="['task-type', 'type-' + task.type]">{{ typeLabels[task.type] }}</span>
          <span :class="['status', 'status-' + task.status]">{{ statusLabels[task.status] }}</span>
        </div>
        <h3>{{ task.title }}</h3>
        <p v-if="task.description">{{ truncate(task.description, 80) }}</p>
        <div class="task-meta">
          <span class="project">{{ task.project?.name || 'Sem projeto' }}</span>
          <span :class="['priority', 'priority-' + task.priority]">{{ priorityLabels[task.priority] }}</span>
        </div>
      </div>
      <p v-if="tasks.length === 0" class="empty-state">Nenhuma tarefa encontrada.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  project?: { name: string };
}

const tasks = ref<Task[]>([]);

const typeLabels: Record<string, string> = { story: 'Story', bug: 'Bug', task: 'Task', epic: 'Epic' };
const statusLabels: Record<string, string> = { todo: 'A Fazer', in_progress: 'Em Progresso', done: 'Concluído' };
const priorityLabels: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };

const truncate = (str: string, len: number) => str?.length > len ? str.slice(0, len) + '...' : str || '';

const selectTask = (task: Task) => {
  console.log('View task', task.id);
};

const fetchTasks = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) tasks.value = await res.json();
  } catch { tasks.value = []; }
};

onMounted(fetchTasks);
</script>

<style scoped>
.tasks-list { display: flex; flex-direction: column; gap: 12px; }

.task-item {
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.task-item:hover { 
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 112, 243, 0.15);
}

.task-header { display: flex; gap: 8px; margin-bottom: 8px; }

.task-type, .status, .priority {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}

.type-story { background: rgba(67, 56, 202, 0.2); color: #818cf8; }
.type-bug { background: rgba(185, 28, 28, 0.2); color: #f87171; }
.type-task { background: rgba(21, 128, 61, 0.2); color: #4ade80; }
.type-epic { background: rgba(180, 83, 9, 0.2); color: #fbbf24; }

.status-todo { background: rgba(255, 255, 255, 0.1); color: #cbd5e1; }
.status-in_progress { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.status-done { background: rgba(16, 185, 129, 0.1); color: #34d399; }

.task-item h3 { margin: 0 0 4px; font-size: 16px; color: var(--color-text-primary); }
.task-item p { margin: 0 0 8px; font-size: 13px; color: var(--color-text-secondary); }

.task-meta { display: flex; justify-content: space-between; font-size: 12px; }

.project { color: var(--color-text-secondary); }

.priority-low { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }
.priority-medium { background: rgba(234, 179, 8, 0.1); color: #fde047; }
.priority-high { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }

.empty-state { text-align: center; padding: 48px; color: var(--color-text-secondary); }
</style>