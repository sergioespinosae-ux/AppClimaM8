<template>
  <div class="weather-card" :class="[{ loading: isLoading }, weatherTheme]">
    <!-- Loading state → Skeleton -->
    <div v-if="isLoading" class="wc-skeleton">
      <div class="sk-header">
        <div class="sk-block sk-city"></div>
        <div class="sk-block sk-icon-circle"></div>
      </div>
      <div class="sk-block sk-temp"></div>
      <div class="sk-details">
        <div class="sk-block sk-detail" v-for="n in 4" :key="n"></div>
      </div>
      <div class="sk-forecast">
        <div class="sk-block sk-fday" v-for="n in 7" :key="n"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="wc-error">
      <span>⚠</span> {{ error }}
    </div>

    <!-- Data state -->
    <template v-else-if="clima">
      <div class="wc-header">
        <div>
          <div class="wc-city">{{ ciudad }}</div>
          <div class="wc-desc">{{ clima.descripcion }}</div>
        </div>
        <div class="wc-icon">{{ clima.icono }}</div>
      </div>

      <div class="wc-temp">
        {{ temperatura }}<span class="wc-unit">°{{ unidad }}</span>
      </div>

      <div class="wc-details">
        <div class="detail-item">
          <span class="detail-label">Sensación</span>
          <span>{{ sensacion }}°{{ unidad }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Humedad</span>
          <span>{{ clima.humedad }}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Viento</span>
          <span>{{ clima.viento }} km/h</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Máx/Mín</span>
          <span>{{ max }}° / {{ min }}°</span>
        </div>
      </div>

      <!-- Hourly forecast -->
      <div v-if="clima.pronosticoHoras && clima.pronosticoHoras.length" class="wc-hourly">
        <div class="section-label">Próximas horas</div>
        <div class="hourly-scroll">
          <div class="hour-item" v-for="(h, i) in clima.pronosticoHoras" :key="i">
            <span class="h-time">{{ formatHora(h.hora) }}</span>
            <span class="h-icon">{{ h.icono }}</span>
            <span class="h-temp">{{ convertir(h.temperatura) }}°</span>
          </div>
        </div>
      </div>

      <!-- 7-day forecast with bar chart -->
      <div class="wc-forecast">
        <div
          v-for="(dia, i) in clima.pronostico"
          :key="i"
          class="forecast-day"
        >
          <span class="f-day">{{ dia.dia }}</span>
          <span class="f-icon">{{ dia.icono }}</span>
          <div class="f-bars">
            <div class="f-bar-bg">
              <div
                class="f-bar-fill"
                :style="barStyle(dia.max, dia.min)"
              ></div>
            </div>
          </div>
          <span class="f-max">{{ convertir(dia.max) }}°</span>
          <span class="f-min">{{ convertir(dia.min) }}°</span>
        </div>
      </div>

      <!-- Favorite toggle (solo si está logueado) -->
      <button
        v-if="isAuthenticated && ciudadData"
        class="fav-btn"
        :class="{ active: esFavorito }"
        @click="toggleFavorito"
      >
        {{ esFavorito ? '★ Guardado' : '☆ Guardar en favoritos' }}
      </button>
    </template>

    <!-- Empty state -->
    <div v-else class="wc-empty">
      <div class="empty-icon">🌍</div>
      <p>Busca una ciudad para ver el clima</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { weatherService } from '@/services/weatherService';

export default {
  name: 'WeatherCard',
  props: {
    clima:      { type: Object,  default: null  },
    ciudad:     { type: String,  default: ''    },
    ciudadData: { type: Object,  default: null  },
    isLoading:  { type: Boolean, default: false },
    error:      { type: String,  default: null  },
  },
  setup(props) {
    const store = useStore();

    const unidad = computed(() => store.getters.unidad);
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const favoritos = computed(() => store.getters.favoritos);

    const esFavorito = computed(() =>
      favoritos.value.some((f) => f.ciudad === props.ciudad)
    );

    const convertir = (val) => weatherService.convertirTemp(val, unidad.value);

    const formatHora = (h) => `${String(h).padStart(2, '0')}:00`;

    const barStyle = (max, min) => {
      if (!props.clima?.pronostico) return {};
      const temps = props.clima.pronostico.flatMap((d) => [d.max, d.min]);
      const globalMin = Math.min(...temps);
      const globalMax = Math.max(...temps);
      const range = globalMax - globalMin || 1;
      const bottom = ((min - globalMin) / range) * 100;
      const height = ((max - min) / range) * 100;
      return { bottom: `${bottom}%`, height: `${Math.max(height, 8)}%` };
    };

    const weatherTheme = computed(() => {
      if (!props.clima) return '';
      const icon = props.clima.icono;
      if (icon.includes('☀') || icon.includes('🌤')) return 'wt-sunny';
      if (icon.includes('⛅') || icon.includes('☁'))  return 'wt-cloudy';
      if (icon.includes('🌫'))                         return 'wt-foggy';
      if (icon.includes('🌦') || icon.includes('🌧'))  return 'wt-rainy';
      if (icon.includes('🌨') || icon.includes('❄'))   return 'wt-snowy';
      if (icon.includes('⛈') || icon.includes('🌩'))   return 'wt-stormy';
      return '';
    });

    const temperatura = computed(() =>
      props.clima ? convertir(props.clima.temperatura) : '--'
    );
    const sensacion = computed(() =>
      props.clima ? convertir(props.clima.sensacion) : '--'
    );
    const max = computed(() =>
      props.clima ? convertir(props.clima.max) : '--'
    );
    const min = computed(() =>
      props.clima ? convertir(props.clima.min) : '--'
    );

    const toggleFavorito = () => {
      if (esFavorito.value) {
        const fav = favoritos.value.find((f) => f.ciudad === props.ciudad);
        if (fav) store.dispatch('eliminarFavorito', fav.id);
      } else if (props.ciudadData) {
        store.dispatch('agregarFavorito', {
          ciudad: props.ciudadData.name,
          pais: props.ciudadData.country_code,
          lat: props.ciudadData.latitude,
          lon: props.ciudadData.longitude,
        });
      }
    };

    return {
      unidad, isAuthenticated, esFavorito,
      temperatura, sensacion, max, min,
      convertir, toggleFavorito, weatherTheme, formatHora, barStyle,
    };
  },
};
</script>

<style scoped>
.weather-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-accent), var(--shadow-lg);
  min-height: 320px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
.weather-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 80% 0%, var(--accent-glow) 0%, transparent 60%);
  pointer-events: none;
  transition: background 0.4s ease;
}

/* Skeleton loader */
.wc-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sk-block {
  background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-surface) 50%, var(--bg-elevated) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-md);
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.sk-header { display: flex; justify-content: space-between; align-items: center; }
.sk-city   { height: 28px; width: 55%; border-radius: var(--radius-sm); }
.sk-icon-circle { width: 60px; height: 60px; border-radius: 50%; }
.sk-temp   { height: 72px; width: 45%; border-radius: var(--radius-md); }
.sk-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.sk-detail { height: 64px; }
.sk-forecast { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.sk-fday { height: 90px; }

/* Error */
.wc-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--danger);
  gap: 8px;
}

/* Header */
.wc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.wc-city {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}
.wc-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 4px;
}
.wc-icon { font-size: 3.5rem; line-height: 1; }

/* Temperature */
.wc-temp {
  font-family: var(--font-display);
  font-size: 5rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.03em;
}
.wc-unit {
  font-size: 2rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin-left: 4px;
}

/* Details grid */
.wc-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.detail-item {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-display);
  font-weight: 600;
}

/* Forecast with bars */
.wc-forecast {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.forecast-day {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
}
.f-day {
  color: var(--text-muted);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
}
.f-icon { font-size: 1.3rem; }
.f-max { color: var(--text-primary); font-weight: 600; font-size: 0.78rem; }
.f-min { color: var(--text-muted); font-size: 0.75rem; }

/* Temperature bar */
.f-bars {
  width: 8px;
  height: 36px;
  flex-shrink: 0;
}
.f-bar-bg {
  width: 100%;
  height: 100%;
  background: var(--bg-surface);
  border-radius: 99px;
  position: relative;
  overflow: hidden;
}
.f-bar-fill {
  position: absolute;
  left: 0;
  right: 0;
  background: linear-gradient(to top, var(--accent), rgba(56,189,248,0.4));
  border-radius: 99px;
  transition: height 0.4s ease, bottom 0.4s ease;
}
.wt-sunny .f-bar-fill   { background: linear-gradient(to top, #fbbf24, #fde68a); }
.wt-rainy .f-bar-fill   { background: linear-gradient(to top, #3b82f6, #93c5fd); }
.wt-snowy .f-bar-fill   { background: linear-gradient(to top, #93e0fa, #dbeafe); }
.wt-stormy .f-bar-fill  { background: linear-gradient(to top, #8b5cf6, #c4b5fd); }
.wt-cloudy .f-bar-fill  { background: linear-gradient(to top, #94a3b8, #cbd5e1); }

/* Hourly forecast */
.section-label {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.wc-hourly { display: flex; flex-direction: column; }
.hourly-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.hourly-scroll::-webkit-scrollbar { height: 4px; }
.hourly-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

.hour-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 10px;
  min-width: 58px;
  flex-shrink: 0;
  font-size: 0.8rem;
}
.h-time {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-weight: 600;
}
.h-icon { font-size: 1.3rem; }
.h-temp { font-weight: 600; color: var(--text-primary); font-size: 0.82rem; }

/* Favorite button */
.fav-btn {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.85rem;
  transition: all var(--transition);
  align-self: flex-start;
}
.fav-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.fav-btn.active {
  background: rgba(25, 115, 154, 0.12);
  border-color: var(--accent);
  color: var(--accent);
}

/* Empty state */
.wc-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-muted);
}
.empty-icon { font-size: 3.5rem; opacity: 0.5; }

@media (max-width: 640px) {
  .wc-details    { grid-template-columns: repeat(2, 1fr); }
  .wc-forecast   { grid-template-columns: repeat(4, 1fr); }
  .forecast-day:nth-child(n+5) { display: none; }
  .wc-temp       { font-size: 4rem; }
}

/* ── Weather dynamic themes ───────────────────── */
/* Sunny ☀️ */
.wt-sunny {
  border-color: rgba(251, 191, 36, 0.35);
  box-shadow: 0 0 48px rgba(251, 191, 36, 0.2), var(--shadow-lg);
}
.wt-sunny::before {
  background: radial-gradient(ellipse at 85% 0%, rgba(251, 191, 36, 0.28) 0%, rgba(251, 146, 60, 0.12) 45%, transparent 70%);
}

/* Cloudy ⛅☁️ */
.wt-cloudy {
  border-color: rgba(148, 163, 184, 0.35);
  box-shadow: 0 0 48px rgba(148, 163, 184, 0.12), var(--shadow-lg);
}
.wt-cloudy::before {
  background: radial-gradient(ellipse at 80% 0%, rgba(148, 163, 184, 0.22) 0%, rgba(100, 116, 139, 0.08) 50%, transparent 70%);
}

/* Foggy 🌫️ */
.wt-foggy {
  border-color: rgba(203, 213, 225, 0.3);
  box-shadow: 0 0 48px rgba(203, 213, 225, 0.1), var(--shadow-lg);
}
.wt-foggy::before {
  background: radial-gradient(ellipse at 50% 0%, rgba(203, 213, 225, 0.18) 0%, transparent 65%);
}

/* Rainy 🌧️🌦️ */
.wt-rainy {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 48px rgba(59, 130, 246, 0.2), var(--shadow-lg);
}
.wt-rainy::before {
  background: radial-gradient(ellipse at 80% 0%, rgba(59, 130, 246, 0.28) 0%, rgba(96, 165, 250, 0.1) 45%, transparent 70%);
}

/* Snowy ❄️🌨️ */
.wt-snowy {
  border-color: rgba(147, 224, 250, 0.45);
  box-shadow: 0 0 48px rgba(147, 224, 250, 0.2), var(--shadow-lg);
}
.wt-snowy::before {
  background: radial-gradient(ellipse at 80% 0%, rgba(147, 224, 250, 0.3) 0%, rgba(186, 230, 253, 0.1) 45%, transparent 70%);
}

/* Stormy ⛈️🌩️ */
.wt-stormy {
  border-color: rgba(139, 92, 246, 0.45);
  box-shadow: 0 0 48px rgba(139, 92, 246, 0.25), var(--shadow-lg);
}
.wt-stormy::before {
  background: radial-gradient(ellipse at 80% 0%, rgba(139, 92, 246, 0.3) 0%, rgba(99, 57, 206, 0.12) 45%, transparent 70%);
}
</style>
