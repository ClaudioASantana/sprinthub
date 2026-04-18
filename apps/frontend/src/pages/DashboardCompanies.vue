<template>
  <div class="companies-page">
    <div class="page-header">
      <h1>Empresas Clientes</h1>
      <button class="btn-primary" @click="showModal = true">+ Nova Empresa</button>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Responsável</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in companies" :key="company.id">
            <td>{{ company.name }}</td>
            <td>{{ company.cnpj }}</td>
            <td>{{ company.responsible }}</td>
            <td>
              <span :class="['status', company.active ? 'active' : 'inactive']">
                {{ company.active ? 'Ativa' : 'Inativa' }}
              </span>
            </td>
            <td>
              <button class="btn-icon" @click="editCompany(company)">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Company {
  id: string;
  name: string;
  cnpj: string;
  responsible: string;
  email: string;
  active: boolean;
}

const companies = ref<Company[]>([]);
const showModal = ref(false);

const editCompany = (company: Company) => {
  console.log('Edit', company);
};

onMounted(async () => {
  try {
    const response = await fetch('/api/companies');
    if (response.ok) {
      companies.value = await response.json();
    }
  } catch {
    companies.value = [];
  }
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  color: #1a1a2e;
}

.btn-primary {
  background: #4f46e5;
  color: #fff;
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

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e5e5e5;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.status.active {
  background: #d1fae5;
  color: #065f46;
}

.status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.btn-icon {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
}
</style>