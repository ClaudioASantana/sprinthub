<template>
  <div class="users-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Membros e Colaboradores</h1>
        <p class="page-subtitle">Gerencie o acesso da sua equipe à plataforma.</p>
      </div>
      <button class="btn btn-primary glow-effect" @click="showModal = true">
        <span class="icon">+</span> Convidar Membro
      </button>
    </div>

    <!-- Lista de Membros -->
    <div class="glass-panel table-wrapper mt-6">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Acesso (Role)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="font-bold text-highlight">{{ user.name }}</td>
            <td class="text-secondary">{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ user.role === 'admin' ? 'Administrador' : 'Membro' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="{ active: user.active }">
                {{ user.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="4" class="text-center empty-state">
              Você ainda não convidou nenhum membro para sua equipe.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Drawer Convidar Membro -->
    <GlassDrawer :isOpen="showModal" @close="closeModal" title="Convidar Colaborador">
      <form @submit.prevent="inviteUser" class="drawer-form">
        <p class="static-password-warning">Um e-mail será enviado com as instruções de primeiro acesso (OAuth AuthProvider).</p>
        
        <div class="form-group">
          <label>Nome Completo</label>
          <input v-model="form.name" type="text" required placeholder="Ex: Roberto Alves" class="dark-input" />
        </div>
        
        <div class="form-group">
          <label>E-mail Corporativo</label>
          <input v-model="form.email" type="email" required placeholder="roberto@suaempresa.com" class="dark-input" />
        </div>

        <div class="form-group">
          <label>Nível de Acesso</label>
          <select v-model="form.role" class="dark-input select-dark">
            <option value="member">Membro (Padrão)</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div class="drawer-actions mt-4">
          <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Convidando...' : 'Enviar Convite' }}
          </button>
        </div>
      </form>
    </GlassDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GlassDrawer from '../components/GlassDrawer.vue'

const users = ref<any[]>([])
const showModal = ref(false)
const loading = ref(false)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const form = ref({
  name: '',
  email: '',
  role: 'member'
})

// TODO: In a real app we derive companyId from auth context (JWT).
// For MVP we mock fetching company ID #1 (the tenant id).
const TENANT_COMPANY_ID = '1'

const fetchUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/api/users?companyId=${TENANT_COMPANY_ID}`)
    if (res.ok) {
      users.value = await res.json()
    }
  } catch (err) {
    console.error('Erro ao buscar usuários', err)
  }
}

const inviteUser = async () => {
  loading.value = true
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      role: form.value.role,
      companyId: TENANT_COMPANY_ID
    }

    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      await fetchUsers()
      closeModal()
    } else {
      const respData = await res.json()
      alert(respData.message || 'Erro ao convidar membro')
    }
  } catch (err) {
    console.error('Falha de conexão', err)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  form.value = { name: '', email: '', role: 'member' }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
  margin-bottom: 0.2rem;
}

.page-subtitle {
  color: var(--color-text-secondary, #a3aac4);
  font-size: 0.9rem;
}

.mt-6 { margin-top: 1.5rem; }
.mt-4 { margin-top: 1rem; }

.text-highlight { color: #fff; }
.text-secondary { color: var(--color-text-secondary); }

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
}
.status-badge.active {
  background: rgba(52, 168, 83, 0.1);
  color: #34A853;
  border: 1px solid rgba(52, 168, 83, 0.2);
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.role-badge.admin {
  background: rgba(138, 76, 252, 0.15);
  color: #bd9dff;
  border: 1px solid rgba(138, 76, 252, 0.3);
}
.role-badge.member {
  background: rgba(0, 112, 243, 0.1);
  color: #559ff5;
  border: 1px solid rgba(0, 112, 243, 0.2);
}

.static-password-warning {
  font-size: 0.8rem;
  color: #6d758c;
  margin-bottom: 0.5rem;
}

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
