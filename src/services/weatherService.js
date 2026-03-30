// src/services/weatherService.js
// Servicio de clima usando Open-Meteo (gratuito, sin API key)

import axios from 'axios';

const GEO_API     = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const REVERSE_GEO = 'https://nominatim.openstreetmap.org/reverse';

// Datos mock para cuando la API no esté disponible
const MOCK_WEATHER = {
  temperatura: 18,
  sensacion: 16,
  humedad: 65,
  viento: 12,
  descripcion: 'Parcialmente nublado',
  icono: '⛅',
  max: 22,
  min: 14,
  pronostico: [
    { dia: 'Lun', max: 22, min: 14, icono: '⛅' },
    { dia: 'Mar', max: 19, min: 12, icono: '🌧️' },
    { dia: 'Mié', max: 16, min: 10, icono: '🌦️' },
    { dia: 'Jue', max: 21, min: 13, icono: '☀️' },
    { dia: 'Vie', max: 24, min: 15, icono: '☀️' },
    { dia: 'Sáb', max: 20, min: 14, icono: '🌤️' },
    { dia: 'Dom', max: 17, min: 11, icono: '🌧️' },
  ],
  pronosticoHoras: Array.from({ length: 12 }, (_, i) => ({
    hora: (new Date().getHours() + i) % 24,
    temperatura: 18 + Math.round(Math.sin(i / 3) * 4),
    icono: i < 4 ? '⛅' : i < 8 ? '☀️' : '🌤️',
  })),
};

const WMO_CODES = {
  0: { desc: 'Despejado', icono: '☀️' },
  1: { desc: 'Mayormente despejado', icono: '🌤️' },
  2: { desc: 'Parcialmente nublado', icono: '⛅' },
  3: { desc: 'Nublado', icono: '☁️' },
  45: { desc: 'Niebla', icono: '🌫️' },
  48: { desc: 'Niebla con escarcha', icono: '🌫️' },
  51: { desc: 'Llovizna leve', icono: '🌦️' },
  53: { desc: 'Llovizna moderada', icono: '🌦️' },
  55: { desc: 'Llovizna intensa', icono: '🌧️' },
  61: { desc: 'Lluvia leve', icono: '🌧️' },
  63: { desc: 'Lluvia moderada', icono: '🌧️' },
  65: { desc: 'Lluvia intensa', icono: '🌧️' },
  71: { desc: 'Nieve leve', icono: '🌨️' },
  73: { desc: 'Nieve moderada', icono: '❄️' },
  75: { desc: 'Nieve intensa', icono: '❄️' },
  80: { desc: 'Chubascos leves', icono: '🌦️' },
  81: { desc: 'Chubascos moderados', icono: '🌧️' },
  82: { desc: 'Chubascos intensos', icono: '⛈️' },
  95: { desc: 'Tormenta', icono: '⛈️' },
  99: { desc: 'Tormenta con granizo', icono: '🌩️' },
};

function getWMO(code) {
  return WMO_CODES[code] || { desc: 'Desconocido', icono: '🌡️' };
}

function getDayName(dateStr) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[new Date(dateStr).getDay()];
}

export const weatherService = {
  async buscarCiudad(query) {
    const { data } = await axios.get(GEO_API, {
      params: { name: query, count: 5, language: 'es', format: 'json' },
    });
    return data.results || [];
  },

  async reverseGeocode(lat, lon) {
    try {
      const { data } = await axios.get(REVERSE_GEO, {
        params: { lat, lon, format: 'json', 'accept-language': 'es' },
        headers: { 'Accept-Language': 'es' },
      });
      const addr = data.address || {};
      const ciudad = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      const pais   = addr.country || '';
      return ciudad ? `${ciudad}, ${pais}` : null;
    } catch {
      return null;
    }
  },

  async obtenerClima(lat, lon) {
    try {
      const { data } = await axios.get(WEATHER_API, {
        params: {
          latitude: lat,
          longitude: lon,
          current: [
            'temperature_2m',
            'apparent_temperature',
            'relative_humidity_2m',
            'wind_speed_10m',
            'weather_code',
          ].join(','),
          hourly: ['temperature_2m', 'weather_code'].join(','),
          daily: ['temperature_2m_max', 'temperature_2m_min', 'weather_code'].join(','),
          timezone: 'auto',
          forecast_days: 7,
        },
      });

      const c = data.current;
      const d = data.daily;
      const h = data.hourly;
      const wmo = getWMO(c.weather_code);

      // Obtener próximas 12 horas desde la hora actual
      const ahora = new Date(c.time);
      const horaActual = ahora.getHours();
      const pronosticoHoras = h.time
        .map((t, i) => ({
          hora: new Date(t).getHours(),
          temperatura: Math.round(h.temperature_2m[i]),
          icono: getWMO(h.weather_code[i]).icono,
          timeObj: new Date(t),
        }))
        .filter((x) => x.timeObj >= ahora)
        .slice(0, 12);

      return {
        temperatura: Math.round(c.temperature_2m),
        sensacion: Math.round(c.apparent_temperature),
        humedad: c.relative_humidity_2m,
        viento: Math.round(c.wind_speed_10m),
        descripcion: wmo.desc,
        icono: wmo.icono,
        max: Math.round(d.temperature_2m_max[0]),
        min: Math.round(d.temperature_2m_min[0]),
        pronostico: d.time.slice(0, 7).map((fecha, i) => ({
          dia: getDayName(fecha),
          max: Math.round(d.temperature_2m_max[i]),
          min: Math.round(d.temperature_2m_min[i]),
          icono: getWMO(d.weather_code[i]).icono,
        })),
        pronosticoHoras,
      };
    } catch {
      // Fallback a datos mock
      return { ...MOCK_WEATHER };
    }
  },

  celsius2fahrenheit(c) {
    return Math.round((c * 9) / 5 + 32);
  },

  convertirTemp(valor, unidad) {
    if (unidad === 'F') return this.celsius2fahrenheit(valor);
    return valor;
  },
};
