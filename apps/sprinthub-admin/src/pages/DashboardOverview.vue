<template>
  <div>
    <h1>Bem-vindo ao Backoffice</h1>
    <p class="subtitle">Selecione uma opção no menu lateral para gerenciar o SprintHub.</p>

    <!-- Dummy stats cards to showcase aesthetics -->
    <div class="stats-grid">
      <div class="stat-card glass-panel">
        <span class="stat-label">Total de Empresas</span>
        <span class="stat-value">124</span>
      </div>
      <div class="stat-card glass-panel">
        <span class="stat-label">Usuários Ativos</span>
        <span class="stat-value">3,192</span>
      </div>
      <div class="stat-card glass-panel">
        <span class="stat-label">MRR (Mensal)</span>
        <span class="stat-value text-primary">R$ 48k</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.text-primary {
  color: var(--color-primary);
}
</style>
