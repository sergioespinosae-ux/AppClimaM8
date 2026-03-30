<template>
  <div class="page-view">
    <div class="container">
      <div class="page-header">
        <div class="profile-avatar">{{ iniciales }}</div>
        <div>
          <h1 class="page-title">{{ usuario.nombre }}</h1>
          <p class="page-sub">{{ usuario.email }}</p>
        </div>
      </div>

      <!-- Preferences card -->
      <div class="pref-card card">
        <h2 class="card-title">⚙ Preferencias de clima</h2>

        <!-- Temperature unit -->
        <div class="pref-row">
          <div class="pref-info">
            <div class="pref-label">Unidad de temperatura</div>
            <div class="pref-desc">Se aplica en toda la app.</div>
          </div>
          <div class="toggle-group">
            <button
              class="toggle-opt"
              :class="{ active: preferencias.unidad === 'C' }"
              @click="setUnidad('C')"
            >°C</button>
            <button
              class="toggle-opt"
              :class="{ active: preferencias.unidad === 'F' }"
              @click="setUnidad('F')"
            >°F</button>
          </div>
        </div>

        <!-- Theme -->
        <div class="pref-row">
          <div class="pref-info">
            <div class="pref-label">Tema visual</div>
            <div class="pref-desc">Elige entre modo oscuro y claro.</div>
          </div>
          <div class="toggle-group">
            <button
              class="toggle-opt"
              :class="{ active: preferencias.tema === 'dark' }"
              @click="setTema('dark')"
            >🌙 Oscuro</button>
            <button
              class="toggle-opt"
              :class="{ active: preferencias.tema === 'light' }"
              @click="setTema('light')"
            >☀️ Claro</button>
          </div>
        </div>

        <!-- Saved indicator -->
        <div v-if="guardado" class="saved-badge">✓ Preferencias guardadas</div>
      </div>

      <!-- User data card -->
      <div class="info-card card">
        <h2 class="card-title">📋 Datos de la cuenta</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Nombre</span>
            <span>{{ usuario.nombre }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Correo</span>
            <span>{{ usuario.email }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Ciudades favoritas</span>
            <span>{{ usuario.favoritos.length }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Unidad actual</span>
            <span>{{ preferencias.unidad === 'C' ? 'Celsius (°C)' : 'Fahrenheit (°F)' }}</span>
          </div>
        </div>
      </div>

      <!-- Logout -->
      <div class="logout-section">
        <button class="btn btn-danger" @click="handleLogout">⏻ Cerrar sesión</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'ProfileView',
  setup() {
    const store  = useStore();
    const router = useRouter();

    const usuario     = computed(() => store.getters.usuario);
    const preferencias = computed(() => store.getters.preferencias);
    const guardado    = ref(false);

    const iniciales = computed(() =>
      usuario.value?.nombre
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() ?? ''
    );

    const guardar = (prefs) => {
      store.dispatch('actualizarPreferencias', prefs);
      guardado.value = true;
      setTimeout(() => { guardado.value = false; }, 2500);
    };

    const setUnidad = (val) => guardar({ unidad: val });
    const setTema   = (val) => guardar({ tema: val });

    const handleLogout = async () => {
      await store.dispatch('logout');
      router.push('/');
    };

    return {
      usuario, preferencias, iniciales, guardado,
      setUnidad, setTema, handleLogout,
    };
  },
};
</script>

<style scoped>
.page-view { padding: 48px 0 80px; }

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.profile-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: #000;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 800;
  flex-shrink: 0;
}

.page-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}
.page-sub { color: var(--text-secondary); }

/* Cards */
.card { margin-bottom: 20px; }
.card-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 24px;
}

/* Preference rows */
.pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.pref-row:last-of-type { border-bottom: none; }
.pref-label {
  font-weight: 500;
  margin-bottom: 4px;
}
.pref-desc { color: var(--text-secondary); font-size: 0.85rem; }

.toggle-group {
  display: flex;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}
.toggle-opt {
  padding: 8px 18px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition);
}
.toggle-opt.active {
  background: var(--accent);
  color: #000;
}
.toggle-opt:hover:not(.active) {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.saved-badge {
  margin-top: 16px;
  display: inline-block;
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: var(--success);
  padding: 6px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } }

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.info-item {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-family: var(--font-display);
  font-weight: 600;
}

.logout-section { margin-top: 32px; }

@media (max-width: 640px) {
  .info-grid { grid-template-columns: 1fr; }
  .pref-row { flex-direction: column; align-items: flex-start; }
}
</style>
