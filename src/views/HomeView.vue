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

    <!-- Lista de lugares con clima actual -->
    <section class="places-section container">
      <div class="section-header">
        <h2>Lugares guardados</h2>
        <button v-if="listaLugares.length < 8" class="btn-add-place" @click="agregarLugar">
          + Agregar lugar
        </button>
      </div>

      <!-- Cargando lista -->
      <div v-if="listaLoading" class="list-loading">
        <div class="spinner"></div>
        <p>Cargando climas...</p>
      </div>

      <!-- Error lista -->
      <div v-else-if="listaError" class="list-error">
        <p>⚠️ {{ listaError }}</p>
      </div>

      <!-- Sin lugares -->
      <div v-else-if="listaLugares.length === 0" class="empty-state">
        <p class="empty-icon">🗺️</p>
        <p>No hay lugares guardados aún.</p>
        <p class="empty-hint">Busca una ciudad y haz clic en "Agregar a lista" para comenzar.</p>
      </div>

      <!-- Grilla de lugares -->
      <div v-else class="places-grid">
        <div
          v-for="lugar in listaLugares"
          :key="lugar.ciudad"
          class="place-card card"
        >
          <div class="place-header">
            <div>
              <h3>{{ lugar.ciudad }}</h3>
              <span class="place-country">{{ lugar.pais }}</span>
            </div>
            <button class="btn-remove" @click="eliminarLugar(lugar)" title="Quitar de lista">✕</button>
          </div>

          <div v-if="lugar.clima" class="place-clima">
            <span class="place-icon">{{ lugar.clima.icono }}</span>
            <div class="place-temps">
              <span class="place-temp">{{ convertirTemp(lugar.clima.temperatura) }}°{{ unidad }}</span>
              <span class="place-desc">{{ lugar.clima.descripcion }}</span>
            </div>
            <div class="place-extra">
              <span>💧 {{ lugar.clima.humedad }}%</span>
              <span>💨 {{ lugar.clima.viento }} km/h</span>
            </div>
          </div>
          <div v-else class="place-no-clima">Sin datos de clima</div>

          <router-link
            :to="{ name: 'detalle', params: { ciudad: lugar.ciudad }, query: { lat: lugar.lat, lon: lugar.lon } }"
            class="btn-detail"
            @click="precargarClima(lugar)"
          >
            Ver detalle →
          </router-link>
        </div>
      </div>
    </section>

    <!-- Modal agregar lugar -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-box card">
        <h3>Agregar ciudad</h3>
        <p class="modal-hint">Busca la ciudad en la barra de búsqueda de arriba y haz clic en el resultado.</p>
        <button class="modal-close" @click="showAddModal = false">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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
const showAddModal = ref(false);

// Lugares en localStorage para persistencia sencilla
const STORAGE_KEY = 'weather_lista_lugares';

const unidad       = computed(() => store.getters.unidad);
const listaLugares = computed(() => store.getters.listaLugares);
const listaLoading = computed(() => store.getters.listaLoading);
const listaError   = computed(() => store.getters.listaError);

function convertirTemp(c) {
  if (c == null) return '--';
  return unidad.value === 'F' ? Math.round(c * 9 / 5 + 32) : Math.round(c);
}

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

async function seleccionar(s) {
  limpiarSugerencias();
  query.value = '';
  const ciudad = { ciudad: s.name, pais: s.country ?? '', lat: s.lat, lon: s.lon };
  // Verificar si ya existe
  if (!listaLugares.value.find((l) => l.ciudad === ciudad.ciudad)) {
    guardarEnStorage([...listaLugares.value, ciudad]);
    await store.dispatch('cargarListaLugares', [...listaLugares.value, ciudad]);
  }
  // Navegar a detalle
  precargarClima({ ...ciudad, clima: null });
  router.push({ name: 'detalle', params: { ciudad: s.name }, query: { lat: s.lat, lon: s.lon } });
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
        precargarClima({ ciudad: nombre, lat, lon });
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

// ── Gestión de lista ─────────────────────────────────────
function guardarEnStorage(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function cargarDesdeStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch { return []; }
}

function eliminarLugar(lugar) {
  const nueva = listaLugares.value.filter((l) => l.ciudad !== lugar.ciudad);
  guardarEnStorage(nueva);
  store.dispatch('cargarListaLugares', nueva);
}

function agregarLugar() {
  showAddModal.value = true;
}

// ── Precargar clima para la vista de detalle ───────────────
async function precargarClima(lugar) {
  if (lugar.clima) {
    store.commit('SET_CLIMA', {
      clima: lugar.clima,
      ciudad: { nombre: lugar.ciudad, pais: lugar.pais, lat: lugar.lat, lon: lugar.lon },
    });
  } else {
    store.dispatch('cargarClima', {
      lat: lugar.lat,
      lon: lugar.lon,
      ciudad: { nombre: lugar.ciudad, pais: lugar.pais, lat: lugar.lat, lon: lugar.lon },
    });
  }
}

// ── Inicialización ────────────────────────────────────────
onMounted(async () => {
  const guardados = cargarDesdeStorage();
  if (guardados.length > 0) {
    await store.dispatch('cargarListaLugares', guardados);
  } else {
    // Cargar ciudades por defecto para demostración
    const defaults = [
      { ciudad: 'Santiago', pais: 'Chile', lat: -33.4569, lon: -70.6483 },
      { ciudad: 'Buenos Aires', pais: 'Argentina', lat: -34.6037, lon: -58.3816 },
      { ciudad: 'Madrid', pais: 'España', lat: 40.4168, lon: -3.7038 },
    ];
    guardarEnStorage(defaults);
    await store.dispatch('cargarListaLugares', defaults);
  }
});
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
.hero-sub { font-size: 1.1rem; opacity: 0.7; margin-bottom: 2.5rem; }

/* Barra de búsqueda */
.search-wrap { position: relative; max-width: 560px; margin: 0 auto; }
.search-box {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0.6rem 0.8rem;
  gap: 0.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  transition: border-color 0.2s;
}
.search-box:focus-within { border-color: var(--color-primary); }

.search-icon { font-size: 1.1rem; opacity: 0.5; }
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text);
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
  color: var(--color-text);
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.suggestion-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  color: var(--color-text);
  text-align: left;
  transition: background 0.15s;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover, .suggestion-item.focused { background: var(--color-surface-hover); }
.sug-name { font-weight: 600; }
.sug-meta { font-size: 0.8rem; opacity: 0.6; }

/* Sección de lugares */
.places-section { padding: 2rem 1rem 4rem; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.section-header h2 { font-size: 1.4rem; font-weight: 700; }

.btn-add-place {
  padding: 0.4rem 1rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Estado cargando / error / vacío */
.list-loading, .list-error { text-align: center; padding: 3rem; opacity: 0.7; }
.spinner {
  width: 40px; height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 4rem 1rem; opacity: 0.6; }
.empty-icon { font-size: 3rem; }
.empty-hint { font-size: 0.85rem; margin-top: 0.5rem; }

/* Grilla de lugares */
.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.place-card { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

.place-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.place-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
.place-country { font-size: 0.8rem; opacity: 0.6; }

.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.4;
  line-height: 1;
  transition: opacity 0.2s;
}
.btn-remove:hover { opacity: 1; }

.place-clima { display: flex; align-items: center; gap: 0.75rem; }
.place-icon { font-size: 2.5rem; line-height: 1; }
.place-temp { font-size: 1.8rem; font-weight: 700; }
.place-desc { font-size: 0.8rem; opacity: 0.7; text-transform: capitalize; }
.place-extra { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8rem; opacity: 0.6; margin-left: auto; }

.place-no-clima { font-size: 0.85rem; opacity: 0.5; }

.btn-detail {
  display: block;
  text-align: center;
  padding: 0.6rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}
.btn-detail:hover { opacity: 0.85; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  max-width: 380px;
  width: 90%;
  padding: 2rem;
  text-align: center;
}
.modal-box h3 { margin-bottom: 0.75rem; }
.modal-hint { opacity: 0.7; font-size: 0.9rem; margin-bottom: 1.5rem; }
.modal-close {
  padding: 0.5rem 1.5rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
