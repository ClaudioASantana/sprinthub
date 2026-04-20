<template>
  <div class="teams-page">
    <div class="page-header">
      <h1>Equipes</h1>
      <button class="btn btn-primary" @click="openModal()">+ Nova Equipe</button>
    </div>
    <div class="table-container glass-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Membros</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams" :key="team.id">
            <td>{{ team.name }}</td>
            <td>{{ team.description }}</td>
            <td>{{ team.members?.length || 0 }}</td>
            <td>
              <span :class="['status', team.active ? 'active' : 'inactive']">
                {{ team.active ? 'Ativa' : 'Inativa' }}
              </span>
            </td>
            <td>
              <button class="btn-icon" @click="openMembersModal(team)">Membros</button>
              <button class="btn-icon" @click="openModal(team)">Editar</button>
              <button class="btn-icon danger" @click="deleteTeam(team.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="teams.length === 0" class="empty-state">Nenhuma equipe encontrada.</p>
    </div>

    <!-- Drawer de Nova Equipe -->
    <GlassDrawer :isOpen="showModal" @close="closeModal" title="Criar Nova Equipe">
      <form @submit.prevent="createTeam" class="drawer-form">
        <div class="form-group">
          <label>Nome da Equipe</label>
          <input v-model="form.name" type="text" required placeholder="Ex: Produto e Design" class="dark-input" />
        </div>
        <div class="drawer-actions mt-4">
          <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Criando...' : 'Salvar Equipe' }}
          </button>
        </div>
      </form>
    </GlassDrawer>

    <div v-if="showMembersModal" class="modal-overlay" @click.self="showMembersModal = false">
      <div class="modal">
        <h2>Membros - {{ selectedTeam?.name }}</h2>
        <div class="members-list">
          <div v-for="user in availableUsers" :key="user.id" class="member-item">
            <span>{{ user.name }}</span>
            <button 
              v-if="selectedTeam?.members?.includes(user.id)"
              class="btn-remove" 
              @click="removeMember(user.id)"
            >-</button>
            <button 
              v-else 
              class="btn-add"
              @click="addMember(user.id)"
            >+</button>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" @click="showMembersModal = false">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import GlassDrawer from '../components/GlassDrawer.vue';
import { parseJwt } from '../utils/jwt';

interface Team {
  id: string;
  name: string;
  description: string;
  companyId: string;
  active: boolean;
  members: string[];
}

const teams = ref<Team[]>([]);
const showModal = ref(false);
const showMembersModal = ref(false);
const loading = ref(false);
const selectedTeam = ref<Team | null>(null);
const editingTeam = ref<Team | null>(null);
const form = ref({ name: '', description: '' });

const availableUsers = ref<any[]>([]);

const getCompanyId = () => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  const payload = parseJwt(token);
  return payload?.companyId || '';
};

const fetchTeams = async () => {
  try {
    const companyId = getCompanyId();
    const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/teams?companyId=${companyId}`);
    if (res.ok) {
      const rawTeams = await res.json();
      teams.value = rawTeams.map((t: any) => ({
        ...t,
        members: t.members ? t.members.map((m: any) => m.id || m) : []
      }));
    }
  } catch {
    teams.value = [];
  }
};

const openModal = (team?: Team) => {
  if (team) {
    editingTeam.value = team;
    form.value = { name: team.name, description: team.description };
  } else {
    editingTeam.value = null;
    form.value = { name: '', description: '' };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const createTeam = async () => {
  loading.value = true;
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = editingTeam.value ? `${baseUrl}/api/teams/${editingTeam.value.id}` : `${baseUrl}/api/teams`;
    const method = editingTeam.value ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, companyId: getCompanyId() }),
    });
    if (res.ok) {
      showModal.value = false;
      fetchTeams();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const deleteTeam = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir?')) {
    await fetch((import.meta.env.VITE_API_URL || '') + `/api/teams/${id}`, { method: 'DELETE' });
    fetchTeams();
  }
};

const openMembersModal = (team: Team) => {
  selectedTeam.value = team;
  showMembersModal.value = true;
};

const addMember = async (userId: string) => {
  if (!selectedTeam.value) return;
  await fetch((import.meta.env.VITE_API_URL || '') + `/api/teams/${selectedTeam.value.id}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  fetchTeams();
  selectedTeam.value = { ...selectedTeam.value, members: [...(selectedTeam.value.members || []), userId] };
};

const removeMember = async (userId: string) => {
  if (!selectedTeam.value) return;
  await fetch((import.meta.env.VITE_API_URL || '') + `/api/teams/${selectedTeam.value.id}/members/${userId}`, {
    method: 'DELETE',
  });
  fetchTeams();
  selectedTeam.value = { ...selectedTeam.value, members: selectedTeam.value.members.filter(m => m !== userId) };
};

const fetchUsers = async () => {
  try {
    const companyId = getCompanyId();
    const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/users?companyId=${companyId}`);
    if (res.ok) availableUsers.value = await res.json();
  } catch {
    availableUsers.value = [];
  }
};

onMounted(() => {
  fetchTeams();
  fetchUsers();
});
</script>

<style scoped>
.status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status.active { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.status.inactive { background: rgba(239, 68, 68, 0.1); color: #f87171; }

.members-list {
  max-height: 300px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid var(--border-color);
  color: var(--color-text-primary);
}

.btn-add, .btn-remove {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-add {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}
.btn-add:hover { background: rgba(16, 185, 129, 0.2); }

.btn-remove {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}
.btn-remove:hover { background: rgba(239, 68, 68, 0.2); }

.mt-6 { margin-top: 1.5rem; }
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