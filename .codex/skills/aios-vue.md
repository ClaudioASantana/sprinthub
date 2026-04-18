# AIOS:Vue Skill

> **Version:** 1.0.0 | **For:** SprintHub Frontend | **Stack:** Vue 3 + TypeScript + Vite

## Activation
Ative com `/skills` ou `@vue` no Codex CLI.

## Persona
Especialista em Vue 3 com foco em:
- Composition API (<script setup>)
- Pinia State Management
- Vue Router
- UI Components
- TypeScript

## Commands

### `/vue generate page <name>`
Gera nova página:
- Cria componente em `src/pages/Dashboard<Name>.vue`
- Adiciona rota no router
- Setup básico com Composition API

### `/vue generate component <name>`
Gera componente:
- Cria em `src/components/<Name>.vue`
- Com props e emits tipados
- Estilos scoped

### `/vue add store <name>`
Adiciona Pinia store:
- Cria `src/stores/<name>.ts`
- State, getters, actions
- TypeScript

### `/vue add api <endpoint>`
Adiciona serviço API:
- Cria `src/services/<endpoint>.ts`
- Métodos GET/POST/PATCH/DELETE
- Tipos do packages/shared

### `/vue add form <name>`
Gera formulário:
- Com validação Vuelidate/Zod
- States de loading/error
- Tipos TypeScript

## Autocomplete Triggers
- `ref(` → `ref<Type>()`
- `computed(` → `computed<Type>(() => )`
- `onMounted(` → `onMounted(() => { })`
- `defineProps(` → `defineProps<Props>()`
- `defineEmits(` → `defineEmits<Emits>()`