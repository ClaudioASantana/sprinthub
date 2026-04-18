<template>
  <div class="teams-page">
    <div class="page-header">
      <h1>Equipes</h1>
      <button class="btn-primary" @click="openModal()">+ Nova Equipe</button>
    </div>
    <div class="table-container">
      <table>
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

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>{{ editingTeam ? 'Editar Equipe' : 'Nova Equipe' }}</h2>
        <form @submit.prevent="saveTeam">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>

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
          <button type="button" class="btn-secondary" @click="showMembersModal = false">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

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
const selectedTeam = ref<Team | null>(null);
const editingTeam = ref<Team | null>(null);
const form = ref({ name: '', description: '' });

const availableUsers = ref([
  { id: 'u1', name: 'João Silva' },
  { id: 'u2', name: 'Maria Santos' },
  { id: 'u3', name: 'Pedro Costa' },
  { id: 'u4', name: 'Ana Oliveira' },
  { id: 'u5', name: 'Bruno Lima' },
]);

const fetchTeams = async () => {
  try {
    const res = await fetch('/api/teams?companyId=1');
    if (res.ok) teams.value = await res.json();
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

const saveTeam = async () => {
  try {
    const url = editingTeam.value ? `/api/teams/${editingTeam.value.id}` : '/api/teams';
    const method = editingTeam.value ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, companyId: '1' }),
    });
    if (res.ok) {
      showModal.value = false;
      fetchTeams();
    }
  } catch (e) {
    console.error(e);
  }
};

const deleteTeam = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir?')) {
    await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    fetchTeams();
  }
};

const openMembersModal = (team: Team) => {
  selectedTeam.value = team;
  showMembersModal.value = true;
};

const addMember = async (userId: string) => {
  if (!selectedTeam.value) return;
  await fetch(`/api/teams/${selectedTeam.value.id}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  fetchTeams();
  selectedTeam.value = { ...selectedTeam.value, members: [...(selectedTeam.value.members || []), userId] };
};

const removeMember = async (userId: string) => {
  if (!selectedTeam.value) return;
  await fetch(`/api/teams/${selectedTeam.value.id}/members/${userId}`, {
    method: 'DELETE',
  });
  fetchTeams();
  selectedTeam.value = { ...selectedTeam.value, members: selectedTeam.value.members.filter(m => m !== userId) };
};

onMounted(fetchTeams);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 { color: #1a1a2e; }

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

.table-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
}

table { width: 100%; border-collapse: collapse; }
th, td { padding: 16px; text-align: left; border-bottom: 1px solid #e5e5e5; }
th { background: #f8f9fa; font-weight: 600; }

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
.status.active { background: #d1fae5; color: #065f46; }
.status.inactive { background: #fee2e2; color: #991b1b; }

.btn-icon {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  margin-right: 8px;
}
.btn-icon.danger { color: #dc2626; }

.empty-state {
  text-align: center;
  padding: 24px;
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
  width: 400px;
}

.modal h2 { margin-bottom: 16px; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
.form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.members-list {
  max-height: 300px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e5e5e5;
}

.btn-add, .btn-remove {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.btn-add {
  background: #d1fae5;
  color: #065f46;
}

.btn-remove {
  background: #fee2e2;
  color: #991b1b;
}
</style>