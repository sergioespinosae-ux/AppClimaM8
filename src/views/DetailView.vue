<template>
  <div class="detail-page">
    <!-- Header con nombre de ciudad y botón volver -->
    <div class="detail-header">
      <button class="btn-back" @click="$router.back()">← Volver</button>
      <div class="city-info">
        <h1>{{ ciudadActual?.nombre ?? route.params.ciudad }}</h1>
        <div class="city-meta">
          <span v-if="ciudadActual?.pais" class="country">{{ ciudadActual.pais }}</span>
          <span v-if="ciudadActual?.lat != null" class="coords">
            {{ Number(ciudadActual.lat).toFixed(2) }}, {{ Number(ciudadActual.lon).toFixed(2) }}
          </span>
        </div>
      </div>
      <div class="header-actions">
        <!-- Favorito (solo autenticados) -->
        <button
          v-if="isAuthenticated"
          class="btn-fav"
          :class="{ active: esFavorito }"
          :disabled="climaLoading || !ciudadActual || esFavorito"
          :title="esFavorito ? 'Ya está en favoritos' : 'Guardar en favoritos'"
          @click="agregarFavorito"
        >
          {{ esFavorito ? '★' : '☆' }}
        </button>
      </div>
    </div>

    <!-- Estado cargando -->
    <div v-if="climaLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando pronóstico...</p>
    </div>

    <!-- Estado error -->
    <div v-else-if="climaError" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ climaError }}</p>
      <button class="btn-retry" @click="cargarDatos">Reintentar</button>
    </div>

    <!-- Datos del clima -->
    <template v-else-if="climaActual">
      <!-- Clima actual -->
      <section class="current-weather card">
        <div class="temp-main">
          <span class="weather-icon">{{ climaActual.icono }}</span>
          <span class="temp-value">{{ convertirTemp(climaActual.temperatura) }}°{{ unidad }}</span>
        </div>
        <p class="description">{{ climaActual.descripcion }}</p>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Sensación</span>
            <span class="value">{{ convertirTemp(climaActual.sensacionTermica) }}°{{ unidad }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Humedad</span>
            <span class="value">{{ climaActual.humedad }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">Viento</span>
            <span class="value">{{ climaActual.viento }} km/h</span>
          </div>
          <div class="detail-item">
            <span class="label">Máx / Mín</span>
            <span class="value">
              {{ convertirTemp(climaActual.tempMax) }}° / {{ convertirTemp(climaActual.tempMin) }}°
            </span>
          </div>
        </div>
      </section>

      <!-- Alertas meteorológicas -->
      <section v-if="alertas.length > 0" class="alerts-section">
        <h2>⚠️ Alertas meteorológicas</h2>
        <div class="alerts-list">
          <div
            v-for="alerta in alertas"
            :key="alerta.titulo"
            class="alert-card"
            :class="`alert-${alerta.tipo}`"
          >
            <span class="alert-icon">{{ alerta.icono }}</span>
            <div>
              <strong>{{ alerta.titulo }}</strong>
              <p>{{ alerta.mensaje }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pronóstico 7 días -->
      <section class="forecast-section card">
        <h2>Pronóstico 7 días</h2>
        <div class="forecast-list">
          <div
            v-for="(dia, i) in climaActual.pronostico7dias"
            :key="i"
            class="forecast-day"
          >
            <span class="day-name">{{ formatearDia(dia.fecha, i) }}</span>
            <span class="day-icon">{{ dia.icono }}</span>
            <span class="day-desc">{{ dia.descripcion }}</span>
            <div class="day-temps">
              <span class="temp-max">{{ convertirTemp(dia.tempMax) }}°</span>
              <div class="temp-bar-wrap">
                <div
                  class="temp-bar"
                  :style="{ width: barWidth(dia.tempMax) + '%' }"
                ></div>
              </div>
              <span class="temp-min">{{ convertirTemp(dia.tempMin) }}°</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Estadísticas semanales -->
      <section v-if="estadisticas" class="stats-section card">
        <h2>📊 Estadísticas de la semana</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Temperatura máxima</span>
            <span class="stat-value hot">{{ convertirTemp(estadisticas.tempMaxSemana) }}°{{ unidad }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Temperatura mínima</span>
            <span class="stat-value cold">{{ convertirTemp(estadisticas.tempMinSemana) }}°{{ unidad }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Temperatura promedio</span>
            <span class="stat-value">{{ convertirTemp(estadisticas.tempPromedio) }}°{{ unidad }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Días soleados</span>
            <span class="stat-value">☀️ {{ estadisticas.diasSoleado }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Días lluviosos</span>
            <span class="stat-value">🌧️ {{ estadisticas.diasLluvia }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Días nublados</span>
            <span class="stat-value">☁️ {{ estadisticas.diasNublado }}</span>
          </div>
        </div>

        <!-- Distribución de tipos de clima -->
        <div class="climate-types">
          <h3>Distribución de condiciones</h3>
          <div class="type-bars">
            <div
              v-for="(count, tipo) in estadisticas.conteoClima"
              :key="tipo"
              class="type-bar-row"
            >
              <span class="type-name">{{ tipo }}</span>
              <div class="type-bar-bg">
                <div
                  class="type-bar-fill"
                  :style="{ width: (count / estadisticas.totalDias * 100) + '%' }"
                ></div>
              </div>
              <span class="type-count">{{ count }} día{{ count !== 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Pronóstico 12 horas -->
      <section class="hourly-section card">
        <h2>Próximas 12 horas</h2>
        <div class="hourly-scroll">
          <div
            v-for="(hora, i) in climaActual.pronostico12h"
            :key="i"
            class="hour-item"
          >
            <span class="hour-time">{{ formatearHora(hora.hora) }}</span>
            <span class="hour-icon">{{ hora.icono }}</span>
            <span class="hour-temp">{{ convertirTemp(hora.temperatura) }}°</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

const store = useStore();
const route = useRoute();

const climaActual   = computed(() => store.getters.climaActual);
const ciudadActual  = computed(() => store.getters.ciudadActual);
const climaLoading  = computed(() => store.getters.climaLoading);
const climaError    = computed(() => store.getters.climaError);
const estadisticas  = computed(() => store.getters.estadisticas);
const alertas       = computed(() => store.getters.alertas);
const unidad        = computed(() => store.getters.unidad);
const isAuthenticated = computed(() => store.getters.isAuthenticated);
const favoritos     = computed(() => store.getters.favoritos);

const nombreCiudad = computed(() => ciudadActual.value?.nombre ?? route.params.ciudad);

const esFavorito = computed(() =>
  favoritos.value.some((f) => f.ciudad === nombreCiudad.value)
);

function convertirTemp(c) {
  if (c == null) return '--';
  if (unidad.value === 'F') return Math.round(c * 9 / 5 + 32);
  return Math.round(c);
}

function formatearDia(fecha, index) {
  if (index === 0) return 'Hoy';
  if (index === 1) return 'Mañana';
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return dias[new Date(fecha).getDay()];
}

function formatearHora(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

const maxTempSemana = computed(() => {
  const dias = climaActual.value?.pronostico7dias ?? [];
  return Math.max(...dias.map((d) => d.tempMax), 0);
});

function barWidth(tempMax) {
  if (!maxTempSemana.value) return 0;
  return Math.round((tempMax / maxTempSemana.value) * 100);
}

function agregarFavorito() {
  if (!isAuthenticated.value || !ciudadActual.value || esFavorito.value) return;
  store.dispatch('agregarFavorito', {
    ciudad: nombreCiudad.value,
    pais: ciudadActual.value?.pais ?? '',
    lat: ciudadActual.value?.lat,
    lon: ciudadActual.value?.lon,
  });
}

async function cargarDatos() {
  const nombreParam = route.params.ciudad;
  if (ciudadActual.value?.nombre === nombreParam && climaActual.value) return;

  // Use coordinates from route query if available (faster, avoids extra geocoding call)
  const lat = route.query.lat ? parseFloat(route.query.lat) : null;
  const lon = route.query.lon ? parseFloat(route.query.lon) : null;
  const paisParam = route.query.pais || '';
  if (lat && lon) {
    await store.dispatch('cargarClima', {
      lat,
      lon,
      ciudad: { nombre: nombreParam, pais: paisParam, lat, lon },
    });
    return;
  }

  // Fallback: search by city name
  const { weatherService } = await import('@/services/weatherService');
  const resultados = await weatherService.buscarCiudad(nombreParam);
  if (resultados.length > 0) {
    const r = resultados[0];
    await store.dispatch('cargarClima', {
      lat: r.latitude,
      lon: r.longitude,
      ciudad: { nombre: r.name, pais: r.country_code ?? '', lat: r.latitude, lon: r.longitude },
    });
  }
}

onMounted(cargarDatos);
</script>

<style scoped>
.detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.city-info { flex: 1; }

.detail-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.city-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 2px;
}

.country {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.coords {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: monospace;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-save-list {
  padding: 0.45rem 1rem;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  transition: opacity 0.2s;
}
.btn-save-list:hover { opacity: 0.85; }

.badge-en-lista {
  padding: 0.45rem 0.9rem;
  background: rgba(52, 211, 153, 0.15);
  color: var(--success);
  border: 1px solid rgba(52, 211, 153, 0.4);
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
}

.btn-back {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: background 0.2s;
}
.btn-back:hover { background: var(--bg-surface); }

.btn-fav {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  line-height: 1;
  color: var(--text-primary);
  opacity: 0.6;
  transition: opacity 0.2s, transform 0.2s;
}
.btn-fav:hover, .btn-fav.active { opacity: 1; color: var(--accent); transform: scale(1.15); }

/* Loading & Error */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  opacity: 0.7;
}
.spinner {
  width: 48px; height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Clima actual */
.current-weather {
  text-align: center;
  padding: 2rem;
}
.temp-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.weather-icon { font-size: 4rem; }
.temp-value { font-size: 4rem; font-weight: 700; }
.description { font-size: 1.2rem; opacity: 0.8; text-transform: capitalize; margin-bottom: 1.5rem; }

.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 600px) { .details-grid { grid-template-columns: repeat(2, 1fr); } }

.detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
.label { font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; }
.value { font-size: 1.1rem; font-weight: 600; }

/* Alertas */
.alerts-section h2 { margin-bottom: 1rem; }
.alerts-list { display: flex; flex-direction: column; gap: 0.75rem; }
.alert-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid;
}
.alert-card p { margin: 0.25rem 0 0; font-size: 0.9rem; opacity: 0.85; }
.alert-icon { font-size: 1.5rem; line-height: 1; }

.alert-calor  { background: rgba(255,100,0,0.12); border-color: #ff6400; }
.alert-lluvia { background: rgba(0,120,255,0.12); border-color: #0078ff; }
.alert-frio   { background: rgba(100,180,255,0.12); border-color: #64b4ff; }
.alert-soleado{ background: rgba(255,200,0,0.12); border-color: #ffc800; }

/* Pronóstico 7 días */
.forecast-section h2, .stats-section h2, .hourly-section h2 {
  margin-bottom: 1.25rem;
}
.forecast-list { display: flex; flex-direction: column; gap: 0.75rem; }
.forecast-day {
  display: grid;
  grid-template-columns: 60px 2rem 1fr 160px;
  align-items: center;
  gap: 0.75rem;
}
@media (max-width: 500px) {
  .forecast-day { grid-template-columns: 50px 2rem 1fr auto; }
  .day-desc { display: none; }
}
.day-name { font-weight: 600; }
.day-icon { font-size: 1.3rem; }
.day-desc { font-size: 0.85rem; opacity: 0.7; }
.day-temps {
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  gap: 0.4rem;
}
.temp-max { color: #ff7043; font-weight: 700; text-align: right; }
.temp-min { color: #64b5f6; opacity: 0.8; }
.temp-bar-wrap { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.temp-bar { height: 100%; background: linear-gradient(90deg, #64b5f6, #ff7043); border-radius: 3px; }

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 500px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

.stat-item { display: flex; flex-direction: column; gap: 0.25rem; }
.stat-label { font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 1.3rem; font-weight: 700; }
.stat-value.hot  { color: #ff7043; }
.stat-value.cold { color: #64b5f6; }

.climate-types h3 { font-size: 0.9rem; opacity: 0.7; margin-bottom: 0.75rem; }
.type-bars { display: flex; flex-direction: column; gap: 0.5rem; }
.type-bar-row { display: grid; grid-template-columns: 160px 1fr 60px; align-items: center; gap: 0.75rem; font-size: 0.85rem; }
.type-bar-bg { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
.type-bar-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.6s ease; }
.type-count { text-align: right; opacity: 0.7; }

/* Pronóstico 12h */
.hourly-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.hour-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  min-width: 56px;
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.hour-time { font-size: 0.75rem; color: var(--text-secondary); }
.hour-icon { font-size: 1.4rem; }
.hour-temp { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
</style>
