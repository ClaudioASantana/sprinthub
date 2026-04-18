<template>
  <div class="settings-page">
    <h1>Configurações</h1>
    <div class="settings-card">
      <p class="empty-state">Nenhuma configuração disponível.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.settings-page h1 {
  color: #1a1a2e;
  margin-bottom: 24px;
}

.settings-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}

.empty-state {
  color: #666;
  text-align: center;
}
</style>