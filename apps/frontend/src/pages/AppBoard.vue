<template>
  <div class="board-page">
    <div class="page-header">
      <button class="btn-back" @click="$router.push('/app')">← Projetos</button>
      <h1>{{ project?.name || 'Board' }}</h1>
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
            @click="selectTask(task)"
          >
            <span :class="['task-type', 'type-' + task.type]">{{ typeLabels[task.type] }}</span>
            <h4>{{ task.title }}</h4>
            <p>{{ truncate(task.description, 50) }}</p>
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
            @click="selectTask(task)"
          >
            <span :class="['task-type', 'type-' + task.type]">{{ typeLabels[task.type] }}</span>
            <h4>{{ task.title }}</h4>
            <p>{{ truncate(task.description, 50) }}</p>
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
            @click="selectTask(task)"
          >
            <span :class="['task-type', 'type-' + task.type]">{{ typeLabels[task.type] }}</span>
            <h4>{{ task.title }}</h4>
            <p>{{ truncate(task.description, 50) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedTask" class="task-detail-overlay" @click.self="selectedTask = null">
      <div class="task-detail">
        <div class="detail-header">
          <h2>{{ selectedTask.title }}</h2>
          <button class="close-btn" @click="selectedTask = null">×</button>
        </div>
        <div class="detail-body">
          <div class="detail-row">
            <label>Tipo:</label>
            <span :class="['task-type', 'type-' + selectedTask.type]">{{ typeLabels[selectedTask.type] }}</span>
          </div>
          <div class="detail-row">
            <label>Status:</label>
            <select v-model="selectedTask.status" @change="updateTask">
              <option value="todo">A Fazer</option>
              <option value="in_progress">Em Progresso</option>
              <option value="done">Concluído</option>
            </select>
          </div>
          <div class="detail-row">
            <label>Prioridade:</label>
            <span :class="['priority', 'priority-' + selectedTask.priority]">{{ priorityLabels[selectedTask.priority] }}</span>
          </div>
          <div class="detail-description">
            <label>Descrição:</label>
            <p>{{ selectedTask.description || 'Sem descrição' }}</p>
          </div>
        </div>
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
}

const route = useRoute();
const projectId = computed(() => route.params.id as string);
const tasks = ref<Task[]>([]);
const project = ref<any>(null);
const selectedTask = ref<Task | null>(null);

const typeLabels: Record<string, string> = { story: 'Story', bug: 'Bug', task: 'Task', epic: 'Epic' };
const priorityLabels: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };

const truncate = (str: string, len: number) => str?.length > len ? str.slice(0, len) + '...' : str || '';

const getTasksByStatus = (status: string) => tasks.value.filter(t => t.status === status);

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    const [projRes, tasksRes] = await Promise.all([
      fetch(`/api/projects/${projectId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/tasks?projectId=${projectId.value}`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (projRes.ok) project.value = await projRes.json();
    if (tasksRes.ok) tasks.value = await tasksRes.json();
  } catch { }
};

const selectTask = (task: Task) => { selectedTask.value = { ...task }; };

const updateTask = async () => {
  if (!selectedTask.value) return;
  const token = localStorage.getItem('token');
  await fetch(`/api/tasks/${selectedTask.value.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: selectedTask.value.status }),
  });
  fetchData();
};

onMounted(fetchData);
</script>

<style scoped>
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.btn-back { background: none; border: none; color: #4f46e5; cursor: pointer; }
.page-header h1 { color: #1a1a2e; margin: 0; }

.kanban-board { display: flex; gap: 16px; overflow-x: auto; }
.kanban-column { flex: 1; min-width: 280px; background: #f1f3f5; border-radius: 12px; padding: 12px; }
.column-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.column-header h3 { margin: 0; font-size: 14px; }
.count { background: #e5e5e5; padding: 2px 8px; border-radius: 10px; font-size: 12px; }

.task-card { background: #fff; border-radius: 8px; padding: 12px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.task-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.task-type { display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-bottom: 6px; }
.type-story { background: #dbeafe; color: #1e40af; }
.type-bug { background: #fee2e2; color: #991b1b; }
.type-task { background: #d1fae5; color: #065f46; }
.type-epic { background: #fef3c7; color: #92400e; }
.task-card h4 { margin: 0 0 4px; font-size: 14px; }
.task-card p { margin: 0; font-size: 12px; color: #666; }

.task-detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
.task-detail { background: #fff; border-radius: 12px; padding: 24px; width: 400px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.detail-header h2 { margin: 0; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
.detail-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.detail-row label { font-weight: 500; color: #666; }
.priority { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
.priority-low { background: #e5e5e5; color: #666; }
.priority-medium { background: #fef3c7; color: #92400e; }
.priority-high { background: #fee2e2; color: #991b1b; }
.detail-description label { display: block; font-weight: 500; color: #666; margin-bottom: 4px; }
.detail-description p { margin: 0; color: #333; }
</style>