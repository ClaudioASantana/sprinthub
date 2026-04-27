<template>
  <div class="tenants-container">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Clientes (Tenants)</h1>
        <p class="page-subtitle">Gerencie as empresas e seus titulares cadastrados.</p>
      </div>
      <button class="btn btn-primary glow-effect" @click="showModal = true">
        <span class="icon">+</span> Nova Empresa
      </button>
    </div>

    <!-- Tabela de Clientes -->
    <div class="glass-panel table-wrapper mt-6">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Responsável</th>
            <th>E-mail</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in companies" :key="company.id">
            <td class="font-bold text-highlight">{{ company.name }}</td>
            <td class="text-secondary">{{ company.cnpj }}</td>
            <td>{{ company.responsible }}</td>
            <td class="text-secondary">{{ company.email }}</td>
            <td>
              <span class="status-badge" :class="{ active: company.active }">
                {{ company.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
          </tr>
          <tr v-if="companies.length === 0">
            <td colspan="5" class="text-center empty-state">
              Nenhuma empresa cadastrada ainda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Drawer Adicionar Novo Tenant -->
    <GlassDrawer :isOpen="showModal" @close="closeModal" title="Provisionar Novo Cliente">
      <form @submit.prevent="createTenant" class="drawer-form">
        <div class="form-section">
          <p class="section-title">Dados da Empresa</p>
          <div class="form-group">
            <label>Nome Fantasia</label>
            <input v-model="form.name" type="text" required placeholder="Ex: Acme Corp" class="dark-input" />
          </div>
          <div class="form-group">
            <label>CNPJ</label>
            <input v-model="form.cnpj" type="text" required placeholder="00.000.000/0000-00" class="dark-input" />
          </div>
        </div>

        <div class="form-section mt-4">
          <p class="section-title">Titular (Primeiro Acesso)</p>
          <p class="static-password-warning">Senha padrão: <span class="badge">estática (gestao-acesso OAuth)</span></p>
          <div class="form-group">
            <label>Nome do Dono</label>
            <input v-model="form.ownerName" type="text" required placeholder="Ex: João Silva" class="dark-input" />
          </div>
          <div class="form-group">
            <label>E-mail (Login e Cobrança)</label>
            <input v-model="form.email" type="email" required placeholder="joao@acme.com" class="dark-input" />
          </div>
        </div>

        <div class="drawer-actions">
          <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Provisionando...' : 'Criar Empresa' }}
          </button>
        </div>
      </form>
    </GlassDrawer>

    <!-- Toast Notifications -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'error' ? '⚠️' : '✅' }}</span>
        <div class="toast-content">
          <h4 class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click="toast.show = false">×</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GlassDrawer from '../components/GlassDrawer.vue'

const companies = ref<any[]>([])
const showModal = ref(false)
const loading = ref(false)

const toast = ref({
  show: false,
  title: '',
  message: '',
  type: 'success' as 'success' | 'error'
})

let toastTimeout: any = null

const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, title, message, type }
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toast.value.show = false
  }, 5000)
}

const form = ref({
  name: '',
  cnpj: '',
  ownerName: '',
  email: ''
})

const fetchCompanies = async () => {
  try {
    const token = localStorage.getItem('sprinthub_admin_token')
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/companies', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      companies.value = await res.json()
    } else if (res.status === 401 || res.status === 403) {
      showToast('Sessão expirada', 'Sua sessão expirou. Redirecionando para o login...', 'error')
      localStorage.removeItem('sprinthub_admin_token')
      setTimeout(() => { window.location.href = '/' }, 1500)
    }
  } catch (err) {
    console.error('Erro ao buscar empresas', err)
    showToast('Erro', 'Não foi possível carregar a lista de empresas.', 'error')
  }
}

const createTenant = async () => {
  loading.value = true
  try {
    // Constrói payload transacional (Empresa + Owner)
    const payload = {
      name: form.value.name,
      cnpj: form.value.cnpj,
      responsible: form.value.ownerName,
      email: form.value.email,      
      ownerEmail: form.value.email, // Campo que o backend lê para transacionar User
      ownerName: form.value.ownerName
    }

    const token = localStorage.getItem('sprinthub_admin_token')
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      showToast('Sucesso!', 'A nova empresa foi provisionada e o titular criado.', 'success')
      closeModal()
      await fetchCompanies()
    } else {
      const errData = await res.json().catch(() => ({}))
      showToast('Atenção', errData.message || res.statusText, 'error')
    }
  } catch (error: any) {
    showToast('Erro de Conexão', error.message, 'error')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  form.value = { name: '', cnpj: '', ownerName: '', email: '' }
}

onMounted(() => {
  fetchCompanies()
})
</script>

<style scoped>
.tenants-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* Botoes Premium */
.btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}
.btn-primary {
  background: linear-gradient(135deg, #8a4cfc, #bd9dff);
  color: #fff;
  box-shadow: 0 4px 14px rgba(138, 76, 252, 0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(138, 76, 252, 0.4);
}
.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a3aac4;
}
.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

/* Glass & Neon */
.glass-panel {
  background: rgba(25, 37, 64, 0.4);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(163, 170, 196, 0.1);
  border-radius: 12px;
}
.neon-glow {
  box-shadow: 0 0 40px rgba(46, 0, 108, 0.3);
}

/* Tabela */
.table-wrapper {
  overflow-x: auto;
  padding: 1rem;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.data-table th {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #6d758c;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.data-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #dee5ff;
  font-size: 0.9rem;
}
.text-highlight { color: #bd9dff; }
.text-secondary { color: #a3aac4; }

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  color: #a3aac4;
}
.status-badge.active {
  background: rgba(52, 168, 83, 0.1);
  color: #34A853;
  border: 1px solid rgba(52, 168, 83, 0.2);
}

.badge {
  background: rgba(138, 76, 252, 0.2);
  color: #bd9dff;
  padding: 2px 6px;
  border-radius: 4px;
}
.drawer-form {
  display: flex;
  flex-direction: column;
}
.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

/* Dark Forms restored */
.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #bd9dff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}
.form-group label {
  font-size: 0.8rem;
  color: #a3aac4;
  font-weight: 500;
}
.dark-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(163, 170, 196, 0.2);
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.dark-input:focus {
  outline: none;
  border-color: #bd9dff;
  box-shadow: 0 0 0 1px #bd9dff;
}
.static-password-warning {
  font-size: 0.8rem;
  color: #6d758c;
  margin-bottom: 1rem;
}

/* Toast Animations & Styles (Shadcn UI inspired) */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: #0f172a;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5);
  color: #f8fafc;
  min-width: 300px;
  max-width: 400px;
  z-index: 9999;
}
.toast.error {
  border-color: rgba(239, 68, 68, 0.5);
  background: #1a1014;
}
.toast.success {
  border-color: rgba(34, 197, 94, 0.5);
  background: #0f1c16;
}

.toast-icon {
  font-size: 1.2rem;
  margin-top: 2px;
}
.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.toast-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}
.toast-message {
  margin: 0;
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.4;
}
.toast-close {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.toast-close:hover {
  color: #f8fafc;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
