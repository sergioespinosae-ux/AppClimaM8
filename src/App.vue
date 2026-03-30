<template>
  <div :class="['app-root', tema]">
    <NavBar />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import NavBar from '@/components/NavBar.vue';

export default {
  name: 'App',
  components: { NavBar },
  setup() {
    const store = useStore();
    const tema = computed(() => store.getters.tema);
    return { tema };
  },
};
</script>

<style>
/* ═══════════════════════════════════════════════
  TOKENS & RESET
═══════════════════════════════════════════════ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;

  /* Tema Oscuro (default) */
  --bg-base:     #080c14;
  --bg-surface:  #0e1525;
  --bg-card:     #111827;
  --bg-elevated: #1a2236;
  --border:      rgba(99, 179, 237, 0.12);
  --border-hover:rgba(99, 179, 237, 0.3);

  --text-primary:   #e8f0fe;
  --text-secondary: #94a3b8;
  --text-muted:     #475569;

  --accent:       #38bdf8;
  --accent-glow:  rgba(56, 189, 248, 0.25);
  --accent-dark:  #0ea5e9;
  --success:      #34d399;
  --danger:       #f87171;
  --warning:      #fbbf24;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-xl: 32px;

  --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
  --shadow-md: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-lg: 0 16px 64px rgba(0,0,0,0.6);
  --shadow-accent: 0 0 40px rgba(56, 189, 248, 0.15);

  --nav-height: 64px;
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tema Claro */
.light {
  --bg-base:     #f0f4f8;
  --bg-surface:  #e2e8f2;
  --bg-card:     #ffffff;
  --bg-elevated: #eef2f7;
  --border:      rgba(59, 130, 246, 0.25);
  --border-hover:rgba(59, 130, 246, 0.5);

  --text-primary:   #020617;
  --text-secondary: #1e293b;
  --text-muted:     #475569;

  --accent:       #0ea5e9;
  --accent-dark:  #0284c7;
  --accent-glow:  rgba(14, 165, 233, 0.2);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-md: 0 8px 32px rgba(0,0,0,0.12);
  --shadow-lg: 0 16px 64px rgba(0,0,0,0.16);
  --shadow-accent: 0 0 40px rgba(14, 165, 233, 0.12);
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
}

.app-root {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  transition: background var(--transition), color var(--transition);
}

.main-content {
  padding-top: var(--nav-height);
  min-height: calc(100vh - var(--nav-height));
}

/* ── Transiciones de página ────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from { opacity: 0; transform: translateY(6px); }
.fade-leave-to   { opacity: 0; transform: translateY(-6px); }

/* ── Utilidades comunes ─────────────────────────── */
.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all var(--transition);
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: var(--accent);
  color: #000;
  box-shadow: 0 0 24px var(--accent-glow);
}
.btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 36px var(--accent-glow);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.btn-ghost:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.btn-danger {
  background: rgba(248, 113, 113, 0.15);
  color: var(--danger);
  border: 1px solid rgba(248, 113, 113, 0.3);
}
.btn-danger:hover {
  background: rgba(248, 113, 113, 0.25);
  border-color: var(--danger);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.label {
  display: block;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.input::placeholder {
  color: var(--text-muted);
}

.error-msg {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: var(--danger);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.success-msg {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: var(--success);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

/* ── Scrollbar ─────────────────────────────── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }
</style>
