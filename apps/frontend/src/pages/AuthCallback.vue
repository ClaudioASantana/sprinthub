<template>
  <div class="callback-page">
    <p>Autenticando...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { saveSession } from '../utils/api';

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const code = route.query.code as string;

  if (!code) {
    router.push('/login');
    return;
  }

  try {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/auth/tenant-callback?code=${code}`);

    if (res.ok) {
      const data = await res.json();
      // Story 032: tenant-callback ainda não emite refresh_token próprio —
      // saveSession tolera undefined e fica pronto para quando emitir.
      saveSession(data);
      router.push('/dashboard');
    } else {
      router.push('/login?error=auth_failed');
    }
  } catch (e) {
    router.push('/login?error=auth_failed');
  }
});
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  color: #fff;
}
</style>