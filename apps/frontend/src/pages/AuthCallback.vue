<template>
  <div class="callback-page">
    <p>Autenticando...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const code = route.query.code as string;
  
  if (!code) {
    router.push('/login');
    return;
  }

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/auth/callback?code=${code}`);
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
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