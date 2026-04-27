<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL, parseJwt, type LoginResponse } from '../services/api'

const router = useRouter()
const isConnecting = ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Preencha todos os campos."
    return
  }

  isConnecting.value = true
  errorMessage.value = ""

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, senha: password.value })
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.error || errData.message || "Erro de autenticação")
    }

    const data: LoginResponse = await response.json()
    localStorage.setItem('sprinthub_admin_token', data.token)

    // Decode JWT e valide o perfil
    const decoded = parseJwt(data.token)
    
    // Supondo que usamos um identificador 'sprinthub' para o nosso sistema
    if (!decoded.roles || decoded.roles['sprinthub'] !== 'super_admin') {
       throw new Error("Acesso Negado: Perfil de Super Admin requerido.")
    }

    router.push('/dashboard')

  } catch (err: any) {
    errorMessage.value = err.message
  } finally {
    isConnecting.value = false
  }
}

const handleDevLogin = async () => {
  isConnecting.value = true
  errorMessage.value = ""
  try {
    const res = await fetch(`${API_BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sprinthub.com', role: 'super_admin' }),
    });
    
    if (!res.ok) {
      throw new Error("Erro no Dev Login (Backend indisponível?)")
    }

    const data = await res.json();
    localStorage.setItem('sprinthub_admin_token', data.access_token)
    router.push('/dashboard')
  } catch (err: any) {
    errorMessage.value = err.message
  } finally {
    isConnecting.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <!-- Decorator blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="glass-panel login-card">
      <div class="brand">
        <div class="logo">S</div>
        <h2>SprintHub</h2>
      </div>
      
      <form class="login-content" @submit.prevent="handleLogin">
        <h3>Painel Administrativo</h3>
        <p class="subtitle">Acesso exclusivo. Credencial do Gestão de Acesso.</p>
        
        <div v-if="errorMessage" class="error-box">
           {{ errorMessage }}
        </div>

        <div class="input-group">
          <input type="email" v-model="email" class="input-base" placeholder="E-mail" required />
        </div>
        <div class="input-group">
          <input type="password" v-model="password" class="input-base" placeholder="Senha" required />
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="isConnecting">
          <span v-if="!isConnecting">🔑 Entrar</span>
          <span v-else class="loader"></span>
        </button>
      </form>


      <div class="footer">
        <p>Acesso restrito à equipe raiz.</p>
        <button type="button" class="btn btn-outline dev-btn" @click="handleDevLogin" style="margin-top: 1rem; width: 100%;">
          🛠️ Dev Bypass (Entrar Direto)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  top: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.blob-2 {
  width: 300px;
  height: 300px;
  background: var(--color-accent);
  bottom: -50px;
  right: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(30px) scale(1.05); }
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 3rem 2.5rem;
  z-index: 1;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Subtle inner border reflection */
.login-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, hsla(0,0%,100%,0.2), hsla(0,0%,100%,0.05));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.brand {
  margin-bottom: 2rem;
}

.logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px hsla(230, 100%, 65%, 0.4);
}

.brand h2 {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.login-content {
  margin-bottom: 2rem;
}

.login-content h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.login-btn {
  width: 100%;
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 600;
  height: 50px;
}

.footer {
  border-top: 1px solid hsla(0,0%,100%,0.1);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.footer p {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

/* Spinner */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid hsla(0,0%,100%,0.3);
  border-bottom-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.input-group {
  margin-bottom: 1rem;
}

.error-box {
  background: hsla(0, 100%, 65%, 0.1);
  color: hsl(0, 100%, 75%);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid hsla(0, 100%, 65%, 0.2);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>
