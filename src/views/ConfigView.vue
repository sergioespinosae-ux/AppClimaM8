<template>
  <div class="config-page">
    <h1>⚙️ Configuración</h1>

    <div class="config-section card">
      <h2>Apariencia</h2>

      <div class="config-row">
        <div class="config-info">
          <span class="config-label">Tema</span>
          <span class="config-desc">Cambia entre modo oscuro y claro</span>
        </div>
        <div class="toggle-group">
          <button
            :class="['toggle-btn', { active: tema === 'dark' }]"
            @click="setTema('dark')"
          >🌙 Oscuro</button>
          <button
            :class="['toggle-btn', { active: tema === 'light' }]"
            @click="setTema('light')"
          >☀️ Claro</button>
        </div>
      </div>
    </div>

    <div class="config-section card">
      <h2>Unidades</h2>

      <div class="config-row">
        <div class="config-info">
          <span class="config-label">Temperatura</span>
          <span class="config-desc">Elige la escala de temperatura preferida</span>
        </div>
        <div class="toggle-group">
          <button
            :class="['toggle-btn', { active: unidad === 'C' }]"
            @click="setUnidad('C')"
          >°C Celsius</button>
          <button
            :class="['toggle-btn', { active: unidad === 'F' }]"
            @click="setUnidad('F')"
          >°F Fahrenheit</button>
        </div>
      </div>
    </div>

    <div v-if="isAuthenticated" class="config-section card">
      <h2>Cuenta</h2>
      <div class="config-row">
        <div class="config-info">
          <span class="config-label">{{ nombreUsuario }}</span>
          <span class="config-desc">Sesión activa</span>
        </div>
        <button class="btn-logout" @click="logout">Cerrar sesión</button>
      </div>
    </div>

    <div v-else class="config-section card">
      <h2>Cuenta</h2>
      <p class="guest-msg">
        Inicia sesión para guardar tus preferencias y ciudades favoritas.
      </p>
      <div class="auth-btns">
        <router-link to="/login" class="btn-primary">Iniciar sesión</router-link>
        <router-link to="/registro" class="btn-secondary">Registrarse</router-link>
      </div>
    </div>

    <div class="config-section card info-section">
      <h2>Acerca de la app</h2>
      <ul>
        <li>📡 Datos meteorológicos: <strong>Open-Meteo API</strong> (gratuita, sin clave)</li>
        <li>🗺️ Geocodificación: <strong>Open-Meteo Geocoding</strong> y <strong>Nominatim</strong></li>
        <li>🛠️ Tecnologías: <strong>Vue 3, Vuex 4, Vue Router 4, Axios</strong></li>
        <li>📦 Versión: <strong>1.0.0 – Módulo 8</strong></li>
      </ul>
    </div>

    <!-- Toast de confirmación -->
    <transition name="toast">
      <div v-if="savedMsg" class="toast">✅ {{ savedMsg }}</div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store  = useStore();
const router = useRouter();

const tema            = computed(() => store.getters.tema);
const unidad          = computed(() => store.getters.unidad);
const isAuthenticated = computed(() => store.getters.isAuthenticated);
const nombreUsuario   = computed(() => store.getters.nombreUsuario);

const savedMsg = ref('');
function showToast(msg) {
  savedMsg.value = msg;
  setTimeout(() => { savedMsg.value = ''; }, 2200);
}

function setTema(t) {
  store.dispatch('actualizarPreferencias', { tema: t });
  showToast('Tema actualizado');
}
function setUnidad(u) {
  store.dispatch('actualizarPreferencias', { unidad: u });
  showToast('Unidad actualizada');
}
async function logout() {
  await store.dispatch('logout');
  router.push('/');
}
</script>

<style scoped>
.config-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.config-page h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.config-section h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.6;
  margin-bottom: 1rem;
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.config-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.config-label { font-weight: 600; }
.config-desc  { font-size: 0.85rem; opacity: 0.6; }

.toggle-group {
  display: flex;
  gap: 0.5rem;
}
.toggle-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.toggle-btn:hover:not(.active) { background: var(--color-surface-hover); }

.btn-logout {
  padding: 0.4rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-error, #f44);
  background: transparent;
  color: var(--color-error, #f44);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.btn-logout:hover { background: var(--color-error, #f44); color: #fff; }

.guest-msg { opacity: 0.7; margin-bottom: 1rem; }
.auth-btns { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn-primary, .btn-secondary {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}
.btn-primary  { background: var(--color-primary); color: #fff; }
.btn-secondary{ border: 1px solid var(--color-border); color: var(--color-text); }

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.info-section li { font-size: 0.9rem; }

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  box-shadow: var(--shadow-md);
  z-index: 9999;
  font-size: 0.95rem;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
