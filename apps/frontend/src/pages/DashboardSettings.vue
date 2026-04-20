<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>Configurações</h1>
    </div>
    <div class="settings-card glass-panel">
      <p class="empty-state">Nenhuma configuração disponível.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.settings-card {
  padding: 24px;
}

.empty-state {
  color: var(--color-text-secondary);
  text-align: center;
}

.empty-state {
  color: #666;
  text-align: center;
}
</style>