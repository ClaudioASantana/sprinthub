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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GlassDrawer from '../components/GlassDrawer.vue'

const companies = ref<any[]>([])
const showModal = ref(false)
const loading = ref(false)

const form = ref({
  name: '',
  cnpj: '',
  ownerName: '',
  email: ''
})

const fetchCompanies = async () => {
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/companies');
    if (res.ok) {
      companies.value = await res.json()
    }
  } catch (err) {
    console.error('Erro ao buscar empresas', err)
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

    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      await fetchCompanies()
      closeModal()
    } else {
      alert('Erro ao criar empresa')
    }
  } catch (err) {
    console.error('Falha de conexão', err)
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
</style>
