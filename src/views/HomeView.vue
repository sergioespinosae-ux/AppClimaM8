<template>
  <div class="home-view">
    <!-- Hero section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            Clima,<br />
            <span class="accent-text">a tu medida.</span>
          </h1>
          <p class="hero-sub">
            Busca cualquier ciudad del mundo y accede al pronóstico en tiempo real.
          </p>

          <!-- Barra de búsqueda -->
          <div class="search-wrap">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                v-model="query"
                type="text"
                class="search-input"
                placeholder="Curicó, Santiago, Tenerife…"
                @input="onInput"
                @keydown.enter="seleccionarPrimero"
                @keydown.down.prevent="moverFoco(1)"
                @keydown.up.prevent="moverFoco(-1)"
                @keydown.esc="limpiarSugerencias"
                autocomplete="off"
              />
              <button v-if="query" class="clear-btn" @click="limpiar">✕</button>
              <button
                class="geo-btn"
                :class="{ loading: geoLoading }"
                @click="usarUbicacion"
                :title="geoError || 'Usar mi ubicación'"
                :disabled="geoLoading"
              >
                <span class="geo-icon">{{ geoLoading ? '⏳' : '📍' }}</span>
              </button>
            </div>

            <div v-if="geoError" class="geo-error">{{ geoError }}</div>

            <!-- Autocomplete -->
            <div v-if="sugerencias.length" class="suggestions">
              <button
                v-for="(s, i) in sugerencias"
                :key="s.id || i"
                class="suggestion-item"
                :class="{ focused: i === focusIndex }"
                @click="seleccionar(s)"
              >
                <span class="sug-name">{{ s.name }}</span>
                <span class="sug-meta">{{ s.country }}<span v-if="s.admin1">, {{ s.admin1 }}</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>


  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { weatherService } from '@/services/weatherService';

const store  = useStore();
const router = useRouter();

const query        = ref('');
const sugerencias  = ref([]);
const focusIndex   = ref(-1);
const geoLoading   = ref(false);
const geoError     = ref('');

// ── Búsqueda ──────────────────────────────────────────────
let debounceTimer = null;
function onInput() {
  focusIndex.value = -1;
  clearTimeout(debounceTimer);
  if (query.value.length < 2) { sugerencias.value = []; return; }
  debounceTimer = setTimeout(async () => {
    try {
      sugerencias.value = await weatherService.buscarCiudad(query.value);
    } catch {
      sugerencias.value = [];
    }
  }, 350);
}

function limpiarSugerencias() { sugerencias.value = []; focusIndex.value = -1; }
function limpiar() { query.value = ''; limpiarSugerencias(); }

function moverFoco(dir) {
  const max = sugerencias.value.length - 1;
  focusIndex.value = Math.max(0, Math.min(focusIndex.value + dir, max));
}

function seleccionarPrimero() {
  const idx = focusIndex.value >= 0 ? focusIndex.value : 0;
  if (sugerencias.value[idx]) seleccionar(sugerencias.value[idx]);
}

function seleccionar(s) {
  limpiarSugerencias();
  query.value = '';
  router.push({ name: 'detalle', params: { ciudad: s.name }, query: { lat: s.latitude, lon: s.longitude, pais: s.country_code || '' } });
}

// ── Geolocalización ────────────────────────────────────────
async function usarUbicacion() {
  if (!navigator.geolocation) { geoError.value = 'Geolocalización no disponible'; return; }
  geoLoading.value = true;
  geoError.value = '';
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        const nombre = await weatherService.reverseGeocode(lat, lon);
        router.push({ name: 'detalle', params: { ciudad: nombre }, query: { lat, lon } });
      } catch {
        geoError.value = 'No se pudo obtener la ciudad.';
      } finally {
        geoLoading.value = false;
      }
    },
    () => { geoError.value = 'Permiso de ubicación denegado.'; geoLoading.value = false; }
  );
}
</script>

<style scoped>
.home-view { min-height: 100vh; }

/* Hero */
.hero {
  position: relative;
  padding: 4rem 1rem 3rem;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}
.orb-1 { width: 400px; height: 400px; background: var(--color-primary); top: -120px; right: -100px; }
.orb-2 { width: 300px; height: 300px; background: #a78bfa; bottom: -80px; left: -60px; }

.container { max-width: 800px; margin: 0 auto; position: relative; }
.hero-content { text-align: center; }

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1rem;
}
.accent-text {
  background: linear-gradient(135deg, var(--color-primary) 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-sub { font-family: var(--font-body); font-size: 1.1rem; opacity: 0.7; margin-bottom: 2.5rem; }

/* Barra de búsqueda */
.search-wrap { position: relative; max-width: 560px; margin: 0 auto; }
.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0.6rem 0.8rem;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s;
}
.search-box:focus-within { border-color: var(--accent); }

.search-icon { font-size: 1.1rem; opacity: 0.5; }
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
}
.clear-btn, .geo-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  color: var(--text-primary);
  opacity: 0.6;
  transition: opacity 0.2s;
}
.clear-btn:hover, .geo-btn:hover { opacity: 1; }
.geo-btn.loading { opacity: 0.4; cursor: not-allowed; }
.geo-error { color: #f66; font-size: 0.85rem; margin-top: 0.5rem; text-align: left; }

.suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
  box-shadow: var(--shadow-md);
}
.suggestion-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  color: var(--text-primary);
  text-align: left;
  transition: background 0.15s;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover, .suggestion-item.focused { background: var(--bg-elevated); }
.sug-name { font-weight: 600; }
.sug-meta { font-size: 0.8rem; opacity: 0.6; }
</style>
