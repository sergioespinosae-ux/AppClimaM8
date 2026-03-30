<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="nav-inner">
      <!-- Logo -->
      <router-link to="/" class="nav-logo">
        <div class="logo-badge">
          <span class="logo-icon">🌤</span>
        </div>
        <div class="logo-wordmark">
          <span class="logo-clima">Clima</span><span class="logo-app">App</span>
        </div>
      </router-link>

      <!-- Nav links -->
      <div class="nav-links">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link v-if="isAuthenticated" to="/favoritos" class="nav-link">
          ★ Favoritos
        </router-link>
        <router-link to="/configuracion" class="nav-link">⚙ Config</router-link>
      </div>

      <!-- Auth section -->
      <div class="nav-auth">
        <!-- Theme toggle (siempre visible) -->
        <button class="theme-toggle" @click="toggleTema" :title="tema === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'">
          {{ tema === 'dark' ? '☀️' : '🌙' }}
        </button>

        <!-- Unit toggle (siempre visible) -->
        <button class="unit-toggle" @click="toggleUnidad" :title="unidad === 'C' ? 'Cambiar a Fahrenheit' : 'Cambiar a Celsius'">
          °{{ unidad === 'C' ? 'F' : 'C' }}
        </button>

        <template v-if="isAuthenticated">
          <div class="user-chip" @click="toggleMenu" ref="chipRef">
            <div class="user-avatar">{{ iniciales }}</div>
            <span class="user-name">{{ nombreUsuario }}</span>
            <span class="chevron" :class="{ open: menuOpen }">▾</span>
          </div>

          <!-- Dropdown -->
          <div v-if="menuOpen" class="user-dropdown" ref="dropdownRef">
            <router-link to="/perfil" class="dropdown-item" @click="closeMenu">
              <span>⚙</span> Perfil
            </router-link>
            <router-link to="/favoritos" class="dropdown-item" @click="closeMenu">
              <span>★</span> Favoritos
            </router-link>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="handleLogout">
              <span>⏻</span> Cerrar sesión
            </button>
          </div>
        </template>

        <template v-else>
          <router-link to="/login" class="btn btn-ghost nav-btn">Ingresar</router-link>
          <router-link to="/registro" class="btn btn-primary nav-btn">Crear cuenta</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'NavBar',
  setup() {
    const store  = useStore();
    const router = useRouter();

    const isScrolled     = ref(false);
    const menuOpen       = ref(false);
    const chipRef        = ref(null);
    const dropdownRef    = ref(null);

    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const nombreUsuario   = computed(() => store.getters.nombreUsuario);
    const tema            = computed(() => store.getters.tema);
    const unidad          = computed(() => store.getters.unidad);
    const toggleTema = () => {
      store.dispatch('actualizarPreferencias', { tema: tema.value === 'dark' ? 'light' : 'dark' });
    };
    const toggleUnidad = () => {
      store.dispatch('actualizarPreferencias', { unidad: unidad.value === 'C' ? 'F' : 'C' });
    };
    const iniciales       = computed(() =>
      (nombreUsuario.value || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '?'
    );

    const toggleMenu  = () => { menuOpen.value = !menuOpen.value; };
    const closeMenu   = () => { menuOpen.value = false; };

    const handleLogout = async () => {
      closeMenu();
      await store.dispatch('logout');
      router.push('/');
    };

    // Cerrar dropdown al hacer click fuera
    const onClickOutside = (e) => {
      if (
        chipRef.value && !chipRef.value.contains(e.target) &&
        dropdownRef.value && !dropdownRef.value.contains(e.target)
      ) {
        closeMenu();
      }
    };

    const onScroll = () => { isScrolled.value = window.scrollY > 20; };

    onMounted(() => {
      document.addEventListener('click', onClickOutside);
      window.addEventListener('scroll', onScroll, { passive: true });
    });
    onUnmounted(() => {
      document.removeEventListener('click', onClickOutside);
      window.removeEventListener('scroll', onScroll);
    });

    return {
      isScrolled, menuOpen, chipRef, dropdownRef,
      isAuthenticated, nombreUsuario, iniciales, tema, unidad,
      toggleMenu, closeMenu, handleLogout, toggleTema, toggleUnidad,
    };
  },
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  z-index: 100;
  background: rgba(8, 12, 20, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.light .navbar {
  background: rgba(240, 244, 248, 0.85);
}
.navbar.scrolled {
  border-bottom-color: var(--border);
  box-shadow: var(--shadow-sm);
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 0 14px var(--accent-glow);
  flex-shrink: 0;
}

.logo-wordmark {
  display: flex;
  align-items: baseline;
  gap: 1px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  line-height: 1;
  letter-spacing: -0.02em;
}

.logo-clima {
  font-weight: 400;
  color: var(--text-primary);
}

.logo-app {
  font-weight: 800;
  color: var(--accent);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding-left: 16px;
}

.nav-link {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color var(--transition), background var(--transition);
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
.nav-link.router-link-exact-active {
  color: var(--accent);
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.nav-btn { padding: 8px 18px; font-size: 0.85rem; }

/* Theme toggle */
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--transition), background var(--transition);
  flex-shrink: 0;
}
.theme-toggle:hover {
  border-color: var(--border-hover);
  background: var(--bg-surface);
}

/* Unit toggle */
.unit-toggle {
  height: 36px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: 0.85rem;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--transition), background var(--transition), color var(--transition);
  flex-shrink: 0;
}
.unit-toggle:hover {
  border-color: var(--border-hover);
  background: var(--bg-surface);
  color: var(--text-primary);
}

/* User chip */
.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px 5px 5px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition);
  user-select: none;
}
.user-chip:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-accent);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  font-size: 0.7rem;
  color: var(--text-muted);
  transition: transform var(--transition);
}
.chevron.open { transform: rotate(180deg); }

/* Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 200px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: dropIn 0.15s ease;
}

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-decoration: none;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: var(--font-body);
  transition: background var(--transition), color var(--transition);
}
.dropdown-item:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}
.dropdown-item.danger { color: var(--danger); }
.dropdown-item.danger:hover { background: rgba(248,113,113,0.1); }

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

@media (max-width: 640px) {
  .user-name { display: none; }
  .nav-links  { display: none; }
  .nav-btn { padding: 8px 12px; }
}
</style>
