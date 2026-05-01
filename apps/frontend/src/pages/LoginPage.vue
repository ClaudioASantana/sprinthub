<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>SprintHub</h1>
        <p>Gestão de Projetos Ágeis</p>
      </div>
      <div class="login-card glass-panel">
        <h2>Bem-vindo</h2>
        <p class="login-subtitle">Entre com sua conta para continuar</p>
        
        <button class="login-btn btn btn-primary" @click="login" :disabled="loading">
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar com Gestão de Acesso</span>
        </button>

        <div class="dev-section">
          <p class="dev-label">Desenvolvimento</p>
          <button class="dev-btn btn btn-outline" @click="devLoginSuperAdmin">Entrar como Super Admin</button>
          <button class="dev-btn btn btn-outline" @click="devLoginMember">Entrar como Membro</button>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { parseJwt } from '../utils/jwt';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const login = () => {
  loading.value = true;
  error.value = '';
  
  const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8081/api/v1';
  const clientId = import.meta.env.VITE_CLIENT_ID || 'sprinthub-frontend';
  const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
  });
  
  window.location.href = `${authUrl}/oauth/authorize?${params.toString()}`;
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = parseJwt(token);
    if (payload) {
      router.push('/dashboard');
    }
  }
});

const devLoginSuperAdmin = async () => {
  loading.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sprinthub.com', role: 'super_admin' }),
    });
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/dashboard');
  } catch (e) {
    error.value = 'Erro ao fazer login';
  }
  loading.value = false;
};

const devLoginMember = async () => {
  loading.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@sprinthub.com', role: 'member' }),
    });
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/app');
  } catch (e) {
    error.value = 'Erro ao fazer login';
  }
  loading.value = false;
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-dark);
  background-image: radial-gradient(circle at top right, rgba(0, 112, 243, 0.1), transparent 40%),
                    radial-gradient(circle at bottom left, rgba(0, 112, 243, 0.05), transparent 40%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 36px;
  color: var(--color-text-primary);
  margin: 0;
}

.login-header p {
  color: var(--color-text-secondary);
  margin-top: 8px;
}

.login-card {
  padding: 32px;
}

.login-card h2 {
  margin: 0 0 8px;
  color: var(--color-text-primary);
}

.login-subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 16px;
}

.error-message {
  color: #ef4444;
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
}

.dev-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.dev-label {
  color: var(--color-text-secondary);
  font-size: 12px;
  text-align: center;
  margin-bottom: 12px;
}

.dev-btn {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 14px;
}
</style>