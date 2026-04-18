<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>SprintHub</h1>
        <p>Gestão de Projetos Ágeis</p>
      </div>
      <div class="login-card">
        <h2>Bem-vindo</h2>
        <p class="login-subtitle">Entre com sua conta para continuar</p>
        
        <button class="login-btn" @click="login" :disabled="loading">
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar com Gestão de Acesso</span>
        </button>

        <div class="dev-section">
          <p class="dev-label">Desenvolvimento</p>
          <button class="dev-btn" @click="devLoginSuperAdmin">Entrar como Super Admin</button>
          <button class="dev-btn" @click="devLoginMember">Entrar como Membro</button>
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
    const res = await fetch('http://localhost:3000/auth/dev-login', {
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
    const res = await fetch('http://localhost:3000/auth/dev-login', {
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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
  color: #fff;
  margin: 0;
}

.login-header p {
  color: #a0a0b0;
  margin-top: 8px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.login-card h2 {
  margin: 0 0 8px;
  color: #1a1a2e;
}

.login-subtitle {
  color: #666;
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #4338ca;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
}

.dev-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e5e5;
}

.dev-label {
  color: #888;
  font-size: 12px;
  text-align: center;
  margin-bottom: 12px;
}

.dev-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  background: #f3f4f6;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.dev-btn:hover {
  background: #e5e5e5;
}
</style>