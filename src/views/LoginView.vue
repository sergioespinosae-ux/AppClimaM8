<template>
  <div class="auth-view">
    <div class="auth-bg">
      <div class="orb orb-a"></div>
      <div class="orb orb-b"></div>
    </div>

    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <router-link to="/" class="auth-logo">⛈ ClimaApp</router-link>
        <h1 class="auth-title">Bienvenido de nuevo</h1>
        <p class="auth-sub">Inicia sesión para acceder a tus favoritos y preferencias.</p>
      </div>

      <!-- Error message -->
      <div v-if="authError" class="error-msg">
        ⚠ {{ authError }}
      </div>

      <!-- Form -->
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-field">
          <label class="label">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="tu@correo.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-field">
          <label class="label">Contraseña</label>
          <div class="input-wrap">
            <input
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              class="input"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button type="button" class="toggle-pass" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? 'Verificando…' : 'Iniciar sesión' }}
        </button>
      </form>

      <!-- Demo hint -->
      <div class="demo-hint">
        <p>Usuarios de prueba:</p>
        <div class="demo-chips">
          <button class="demo-chip" @click="usarDemo('ana@clima.com', '123456')">
            ana@clima.com / 123456
          </button>
          <button class="demo-chip" @click="usarDemo('demo@demo.com', 'demo')">
            demo@demo.com / demo
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="auth-footer">
        ¿No tienes cuenta?
        <router-link to="/registro">Regístrate gratis</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'LoginView',
  setup() {
    const store  = useStore();
    const router = useRouter();
    const route  = useRoute();

    const email    = ref('');
    const password = ref('');
    const showPass = ref(false);

    const loading   = computed(() => store.getters.authLoading);
    const authError = computed(() => store.getters.authError);

    const usarDemo = (e, p) => {
      email.value    = e;
      password.value = p;
    };

    const handleLogin = async () => {
      const ok = await store.dispatch('login', {
        email: email.value,
        password: password.value,
      });
      if (ok) {
        const redirect = route.query.redirect || '/';
        router.push(redirect);
      }
    };

    return { email, password, showPass, loading, authError, usarDemo, handleLogin };
  },
};
</script>

<style scoped>
.auth-view {
  min-height: calc(100vh - var(--nav-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
}
.orb-a {
  width: 600px; height: 600px;
  background: var(--accent);
  top: -200px; left: 50%;
  transform: translateX(-50%);
}
.orb-b {
  width: 300px; height: 300px;
  background: #a855f7;
  bottom: 0; right: 10%;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-lg), var(--shadow-accent);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-header { text-align: center; }
.auth-logo {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--accent);
  text-decoration: none;
  margin-bottom: 20px;
  font-weight: 700;
}
.auth-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.auth-sub { color: var(--text-secondary); font-size: 0.9rem; }

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-field { display: flex; flex-direction: column; gap: 6px; }

.input-wrap { position: relative; }
.input-wrap .input { padding-right: 44px; }
.toggle-pass {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  opacity: 0.6;
  transition: opacity var(--transition);
}
.toggle-pass:hover { opacity: 1; }

.submit-btn {
  width: 100%;
  padding: 14px;
  margin-top: 6px;
  font-size: 0.95rem;
  gap: 10px;
}
.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: rgba(0,0,0,0.7);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Demo hint */
.demo-hint {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
}
.demo-hint p {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--font-display);
  font-weight: 600;
  margin-bottom: 8px;
}
.demo-chips { display: flex; flex-direction: column; gap: 6px; }
.demo-chip {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  text-align: left;
  font-family: monospace;
  transition: all var(--transition);
}
.demo-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.auth-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}
.auth-footer a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}
.auth-footer a:hover { text-decoration: underline; }
</style>
