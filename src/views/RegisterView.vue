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
        <h1 class="auth-title">Crear cuenta</h1>
        <p class="auth-sub">Guarda tus ciudades favoritas y personaliza tu experiencia.</p>
      </div>

      <!-- Error / success -->
      <div v-if="authError" class="error-msg">⚠ {{ authError }}</div>
      <div v-if="successMsg" class="success-msg">✓ {{ successMsg }}</div>

      <!-- Form -->
      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-field">
          <label class="label">Nombre completo</label>
          <input
            v-model="nombre"
            type="text"
            class="input"
            placeholder="Tu Nombre"
            required
            minlength="2"
          />
        </div>

        <div class="form-field">
          <label class="label">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="tu@correo.com"
            required
          />
        </div>

        <div class="form-field">
          <label class="label">Contraseña</label>
          <div class="input-wrap">
            <input
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              class="input"
              placeholder="Mínimo 4 caracteres"
              required
              minlength="4"
            />
            <button type="button" class="toggle-pass" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-field">
          <label class="label">Confirmar contraseña</label>
          <div class="input-wrap">
            <input
              v-model="confirm"
              :type="showPass ? 'text' : 'password'"
              class="input"
              :class="{ mismatch: confirm && confirm !== password }"
              placeholder="Repite tu contraseña"
              required
            />
          </div>
          <span v-if="confirm && confirm !== password" class="field-error">
            Las contraseñas no coinciden
          </span>
        </div>

        <button
          type="submit"
          class="btn btn-primary submit-btn"
          :disabled="loading || (confirm && confirm !== password)"
        >
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? 'Creando cuenta…' : 'Crear mi cuenta' }}
        </button>
      </form>

      <div class="auth-footer">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterView',
  setup() {
    const store  = useStore();
    const router = useRouter();

    const nombre   = ref('');
    const email    = ref('');
    const password = ref('');
    const confirm  = ref('');
    const showPass = ref(false);
    const successMsg = ref('');

    const loading   = computed(() => store.getters.authLoading);
    const authError = computed(() => store.getters.authError);

    const handleRegister = async () => {
      if (password.value !== confirm.value) return;
      const ok = await store.dispatch('register', {
        nombre: nombre.value,
        email:  email.value,
        password: password.value,
      });
      if (ok) {
        successMsg.value = '¡Cuenta creada con éxito! Redirigiendo…';
        setTimeout(() => router.push('/'), 1000);
      }
    };

    return {
      nombre, email, password, confirm, showPass,
      loading, authError, successMsg,
      handleRegister,
    };
  },
};
</script>

<style scoped>
/* Reuse same layout as login — just copy what's needed */
.auth-view {
  min-height: calc(100vh - var(--nav-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
}
.auth-bg { position: absolute; inset: 0; pointer-events: none; }
.orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.12; }
.orb-a {
  width: 600px; height: 600px;
  background: #a855f7;
  top: -200px; right: -100px;
}
.orb-b {
  width: 300px; height: 300px;
  background: var(--accent);
  bottom: 0; left: 10%;
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
.auth-form { display: flex; flex-direction: column; gap: 18px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.input-wrap { position: relative; }
.input-wrap .input { padding-right: 44px; }
.toggle-pass {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1rem;
  opacity: 0.6; transition: opacity var(--transition);
}
.toggle-pass:hover { opacity: 1; }
.input.mismatch { border-color: var(--danger); }
.field-error { color: var(--danger); font-size: 0.8rem; }
.submit-btn { width: 100%; padding: 14px; margin-top: 6px; font-size: 0.95rem; }
.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: rgba(0,0,0,0.7);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.auth-footer {
  text-align: center; color: var(--text-secondary); font-size: 0.875rem;
}
.auth-footer a {
  color: var(--accent); text-decoration: none;
  font-weight: 600; margin-left: 4px;
}
.auth-footer a:hover { text-decoration: underline; }
</style>
