<template>
  <Teleport to="body">
    <transition name="drawer-fade">
      <div v-if="isOpen" class="drawer-overlay" @click="close">
      </div>
    </transition>

    <transition name="drawer-slide">
      <div v-if="isOpen" class="glass-drawer neon-glow">
        <div class="drawer-header">
          <h2>{{ title }}</h2>
          <button class="close-btn" @click="close">×</button>
        </div>
        <div class="drawer-body">
          <slot></slot>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, required: true }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

// Prevent background scroll when opened
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.glass-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 450px;
  height: 100vh;
  z-index: 1001;
  background: rgba(13, 11, 20, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid var(--border-color);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color);
}

.drawer-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px;
}

.close-btn:hover {
  color: #ef4444;
}

.drawer-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

/* Transitions */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
