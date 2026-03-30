// src/store/index.js
import { createStore } from 'vuex';
import { authService } from '@/services/authService';

// ── Helpers de estadísticas y alertas ─────────────────────────────────────
function calcularEstadisticas(forecast7dias) {
  if (!forecast7dias || forecast7dias.length === 0) return null;

  const temps = forecast7dias.map(d => d.tempMax);
  const tempsMin = forecast7dias.map(d => d.tempMin);
  const allTemps = [...temps, ...tempsMin];

  const tempMaxSemana = Math.max(...temps);
  const tempMinSemana = Math.min(...tempsMin);
  const tempPromedio = +(allTemps.reduce((a, b) => a + b, 0) / allTemps.length).toFixed(1);

  // Conteo de tipos de clima por descripción
  const conteoClima = {};
  forecast7dias.forEach(d => {
    const tipo = d.descripcion || 'Desconocido';
    conteoClima[tipo] = (conteoClima[tipo] || 0) + 1;
  });

  // Días lluviosos (contiene "lluvia", "llovizna" o "chubasco")
  const diasLluvia = forecast7dias.filter(d =>
    /lluvia|llovizna|chubasco|rain|drizzle|shower/i.test(d.descripcion)
  ).length;

  // Días soleados
  const diasSoleado = forecast7dias.filter(d =>
    /despejad|soleado|clear|sunny/i.test(d.descripcion)
  ).length;

  // Días nublados
  const diasNublado = forecast7dias.filter(d =>
    /nubla|nublado|cloudy|overcast/i.test(d.descripcion)
  ).length;

  return {
    tempMaxSemana,
    tempMinSemana,
    tempPromedio,
    conteoClima,
    diasLluvia,
    diasSoleado,
    diasNublado,
    totalDias: forecast7dias.length,
  };
}

function generarAlertas(estadisticas, forecast7dias) {
  const alertas = [];
  if (!estadisticas) return alertas;

  // Ola de calor: 3 o más días con temperatura máxima > 35°C
  const diasCalor = forecast7dias.filter(d => d.tempMax > 35).length;
  if (diasCalor >= 3) {
    alertas.push({
      tipo: 'calor',
      icono: '🌡️',
      titulo: 'Ola de calor',
      mensaje: `${diasCalor} días con temperaturas superiores a 35°C esta semana. Mantente hidratado.`,
    });
  }

  // Semana lluviosa: 4 o más días con lluvia
  if (estadisticas.diasLluvia >= 4) {
    alertas.push({
      tipo: 'lluvia',
      icono: '🌧️',
      titulo: 'Semana lluviosa',
      mensaje: `Se esperan ${estadisticas.diasLluvia} días de lluvia. Lleva paraguas.`,
    });
  }

  // Frío intenso: mínima de la semana bajo 0°C
  if (estadisticas.tempMinSemana < 0) {
    alertas.push({
      tipo: 'frio',
      icono: '🥶',
      titulo: 'Frío intenso',
      mensaje: `La temperatura mínima puede llegar a ${estadisticas.tempMinSemana}°C. Abrígate bien.`,
    });
  }

  // Semana despejada (bonus)
  if (estadisticas.diasSoleado >= 5) {
    alertas.push({
      tipo: 'soleado',
      icono: '☀️',
      titulo: 'Semana soleada',
      mensaje: 'Excelente semana para actividades al aire libre.',
    });
  }

  return alertas;
}

// ─────────────────────────────────────────────────────────────────────────────

export default createStore({
  state: {
    // ── Autenticación ──────────────────────────────────
    usuario: null,
    isAuthenticated: false,
    authLoading: false,
    authError: null,

    // ── Lista de lugares (Home) ────────────────────────
    listaLugares: [],
    listaLoading: false,
    listaError: null,

    // ── Lugar seleccionado y su pronóstico ─────────────
    climaActual: null,
    ciudadActual: null,
    climaLoading: false,
    climaError: null,

    // ── Estadísticas y alertas del lugar seleccionado ──
    estadisticas: null,
    alertas: [],

    // ── Preferencias (invitados) ───────────────────────
    temaGuest:   localStorage.getItem('weather_tema')   ?? 'dark',
    unidadGuest: localStorage.getItem('weather_unidad') ?? 'C',
  },

  getters: {
    usuario: (s) => s.usuario,
    isAuthenticated: (s) => s.isAuthenticated,
    authLoading: (s) => s.authLoading,
    authError: (s) => s.authError,

    nombreUsuario: (s) => s.usuario?.nombre ?? '',
    preferencias: (s) => s.usuario?.preferencias ?? { unidad: 'C', tema: 'dark' },
    favoritos: (s) => s.usuario?.favoritos ?? [],
    unidad: (s) => s.usuario?.preferencias?.unidad ?? s.unidadGuest,
    tema: (s) => s.usuario?.preferencias?.tema   ?? s.temaGuest,

    // Lista de lugares
    listaLugares: (s) => s.listaLugares,
    listaLoading: (s) => s.listaLoading,
    listaError:   (s) => s.listaError,

    // Clima del lugar seleccionado
    climaActual: (s) => s.climaActual,
    ciudadActual: (s) => s.ciudadActual,
    climaLoading: (s) => s.climaLoading,
    climaError:   (s) => s.climaError,

    // Estadísticas y alertas
    estadisticas: (s) => s.estadisticas,
    alertas:      (s) => s.alertas,
  },

  mutations: {
    // ── Auth ───────────────────────────────────────────
    SET_AUTH_LOADING(state, val) { state.authLoading = val; },
    SET_AUTH_ERROR(state, msg)   { state.authError = msg; },
    CLEAR_AUTH_ERROR(state)      { state.authError = null; },

    LOGIN_SUCCESS(state, usuario) {
      state.usuario = usuario;
      state.isAuthenticated = true;
      state.authError = null;
    },
    LOGOUT(state) {
      state.usuario = null;
      state.isAuthenticated = false;
      state.climaActual = null;
      state.ciudadActual = null;
      state.estadisticas = null;
      state.alertas = [];
    },

    ACTUALIZAR_PREFERENCIAS(state, prefs) {
      if (state.usuario) {
        state.usuario.preferencias = { ...state.usuario.preferencias, ...prefs };
        localStorage.setItem('weather_user', JSON.stringify(state.usuario));
      }
      if (prefs.tema)   { state.temaGuest = prefs.tema;   localStorage.setItem('weather_tema', prefs.tema); }
      if (prefs.unidad) { state.unidadGuest = prefs.unidad; localStorage.setItem('weather_unidad', prefs.unidad); }
    },

    AGREGAR_FAVORITO(state, ciudad) {
      if (!state.usuario) return;
      if (!state.usuario.favoritos.find((f) => f.ciudad === ciudad.ciudad)) {
        state.usuario.favoritos.push({ ...ciudad, id: Date.now() });
        localStorage.setItem('weather_user', JSON.stringify(state.usuario));
      }
    },

    ELIMINAR_FAVORITO(state, id) {
      if (!state.usuario) return;
      state.usuario.favoritos = state.usuario.favoritos.filter((f) => f.id !== id);
      localStorage.setItem('weather_user', JSON.stringify(state.usuario));
    },

    // ── Lista de lugares ────────────────────────────────
    SET_LISTA_LOADING(state, val) { state.listaLoading = val; },
    SET_LISTA_ERROR(state, msg)   { state.listaError = msg; },
    SET_LISTA_LUGARES(state, lugares) {
      state.listaLugares = lugares;
      state.listaError = null;
    },
    ACTUALIZAR_CLIMA_LUGAR(state, { index, clima }) {
      if (state.listaLugares[index]) {
        state.listaLugares[index] = { ...state.listaLugares[index], clima };
      }
    },

    // ── Clima seleccionado ──────────────────────────────
    SET_CLIMA_LOADING(state, val) { state.climaLoading = val; },
    SET_CLIMA_ERROR(state, msg)   { state.climaError = msg; },
    SET_CLIMA(state, { clima, ciudad }) {
      state.climaActual = clima;
      state.ciudadActual = ciudad;
      state.climaError = null;
      // Calcular estadísticas y alertas automáticamente
      const forecast = clima?.pronostico7dias ?? [];
      state.estadisticas = calcularEstadisticas(forecast);
      state.alertas = generarAlertas(state.estadisticas, forecast);
    },
  },

  actions: {
    // ── Restaurar sesión ────────────────────────────────
    async restaurarSesion({ commit }) {
      const stored = authService.getStoredUser();
      if (stored) commit('LOGIN_SUCCESS', stored);
    },

    // ── Login ───────────────────────────────────────────
    async login({ commit }, { email, password }) {
      commit('SET_AUTH_LOADING', true);
      commit('CLEAR_AUTH_ERROR');
      try {
        const usuario = await authService.login(email, password);
        commit('LOGIN_SUCCESS', usuario);
        return true;
      } catch (err) {
        commit('SET_AUTH_ERROR', err.message);
        return false;
      } finally {
        commit('SET_AUTH_LOADING', false);
      }
    },

    // ── Registro ────────────────────────────────────────
    async register({ commit }, { nombre, email, password }) {
      commit('SET_AUTH_LOADING', true);
      commit('CLEAR_AUTH_ERROR');
      try {
        const usuario = await authService.register(nombre, email, password);
        commit('LOGIN_SUCCESS', usuario);
        return true;
      } catch (err) {
        commit('SET_AUTH_ERROR', err.message);
        return false;
      } finally {
        commit('SET_AUTH_LOADING', false);
      }
    },

    // ── Logout ──────────────────────────────────────────
    async logout({ commit }) {
      await authService.logout();
      commit('LOGOUT');
    },

    // ── Preferencias ────────────────────────────────────
    actualizarPreferencias({ commit }, prefs) {
      commit('ACTUALIZAR_PREFERENCIAS', prefs);
    },

    // ── Favoritos ───────────────────────────────────────
    agregarFavorito({ commit }, ciudad)  { commit('AGREGAR_FAVORITO', ciudad); },
    eliminarFavorito({ commit }, id)     { commit('ELIMINAR_FAVORITO', id); },

    // ── Cargar lista de lugares con clima actual ─────────
    async cargarListaLugares({ commit }, lugares) {
      const { weatherService } = await import('@/services/weatherService');
      commit('SET_LISTA_LOADING', true);
      commit('SET_LISTA_ERROR', null);
      try {
        const conClima = await Promise.all(
          lugares.map(async (lugar) => {
            try {
              const clima = await weatherService.obtenerClima(lugar.lat, lugar.lon);
              return { ...lugar, clima };
            } catch {
              return { ...lugar, clima: null };
            }
          })
        );
        commit('SET_LISTA_LUGARES', conClima);
      } catch {
        commit('SET_LISTA_ERROR', 'No se pudo cargar la lista de lugares.');
      } finally {
        commit('SET_LISTA_LOADING', false);
      }
    },

    // ── Cargar clima de un lugar específico ──────────────
    async cargarClima({ commit }, { lat, lon, ciudad }) {
      const { weatherService } = await import('@/services/weatherService');
      commit('SET_CLIMA_LOADING', true);
      commit('SET_CLIMA_ERROR', null);
      try {
        const clima = await weatherService.obtenerClima(lat, lon);
        commit('SET_CLIMA', { clima, ciudad });
      } catch {
        commit('SET_CLIMA_ERROR', 'No se pudo obtener el clima.');
      } finally {
        commit('SET_CLIMA_LOADING', false);
      }
    },
  },
});
