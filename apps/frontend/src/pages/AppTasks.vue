<template>
  <div class="tasks-page">
    <h1>Minhas Tarefas</h1>
    <div class="tasks-list">
      <div v-for="task in tasks" :key="task.id" class="task-item" @click="selectTask(task)">
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
    const res = await fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) tasks.value = await res.json();
  } catch { tasks.value = []; }
};

onMounted(fetchTasks);
</script>

<style scoped>
.tasks-page h1 { color: #1a1a2e; margin-bottom: 24px; }

.tasks-list { display: flex; flex-direction: column; gap: 12px; }

.task-item {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.task-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

.task-header { display: flex; gap: 8px; margin-bottom: 8px; }

.task-type, .status, .priority {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.type-story { background: #dbeafe; color: #1e40af; }
.type-bug { background: #fee2e2; color: #991b1b; }
.type-task { background: #d1fae5; color: #065f46; }
.type-epic { background: #fef3c7; color: #92400e; }

.status-todo { background: #f3f4f6; color: #666; }
.status-in_progress { background: #fef3c7; color: #92400e; }
.status-done { background: #d1fae5; color: #065f46; }

.task-item h3 { margin: 0 0 4px; font-size: 16px; color: #1a1a2e; }
.task-item p { margin: 0 0 8px; font-size: 13px; color: #666; }

.task-meta { display: flex; justify-content: space-between; font-size: 12px; }

.project { color: #888; }

.priority-low { background: #e5e5e5; color: #666; }
.priority-medium { background: #fef3c7; color: #92400e; }
.priority-high { background: #fee2e2; color: #991b1b; }

.empty-state { text-align: center; padding: 48px; color: #666; }
</style>