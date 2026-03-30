# 🌤 App de Clima – Módulo 8 (Portafolio Final)

SPA en Vue 3 que consume datos meteorológicos en tiempo real, maneja estado con Vuex y presenta estadísticas semanales junto con alertas automáticas.

## 🔗 Repositorio

<!-- Agrega aquí el enlace al repositorio de GitHub una vez publicado -->
`https://github.com/TU_USUARIO/weather-app-m8`

---

## 🚀 Instrucciones de ejecución local

### Requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 16.x |
| npm | 8.x |

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/weather-app-m8.git
cd weather-app-m8

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run serve

# 4. Abrir en el navegador
# http://localhost:8080
```

### Compilar para producción

```bash
npm run build
# Los archivos generados quedan en dist/
```

### Variables de entorno

> **Esta app no requiere API key.** Usa Open-Meteo (gratuita y sin registro).
>
> Si deseas sobrescribir la URL base, puedes crear un archivo `.env` opcional:

```env
# .env (opcional)
VUE_APP_WEATHER_API=https://api.open-meteo.com
VUE_APP_GEO_API=https://geocoding-api.open-meteo.com
```

---

## 🗺 Rutas de la aplicación

| Ruta | Vista | Acceso | Descripción |
|---|---|---|---|
| `/` | HomeView | Libre | Listado de ciudades con clima actual |
| `/detalle/:ciudad` | DetailView | Libre | Pronóstico 7 días + estadísticas + alertas |
| `/favoritos` | FavoritesView | Auth | Ciudades guardadas como favoritas |
| `/configuracion` | ConfigView | Libre | Preferencias: tema, unidad de temperatura |
| `/login` | LoginView | Invitado | Iniciar sesión |
| `/registro` | RegisterView | Invitado | Crear cuenta |

---

## ✨ Funcionalidades clave

### 🌡 Clima en tiempo real
- Datos obtenidos de **Open-Meteo API** (gratuita, sin API key)
- Geocodificación de ciudades vía **Open-Meteo Geocoding**
- Geocodificación inversa (coordenadas → ciudad) vía **Nominatim**
- Búsqueda con autocompletado y soporte de geolocalización del navegador

### 📊 Estadísticas semanales (Vista Detalle)
Calculadas a partir del pronóstico de 7 días:
- Temperatura **máxima**, **mínima** y **promedio** de la semana
- Conteo de días por tipo de clima (soleado, nublado, lluvioso, etc.)
- Gráfico de barras proporcional por condición meteorológica

### ⚠️ Alertas meteorológicas automáticas
Generadas por reglas simples al cargar el pronóstico:

| Alerta | Regla |
|---|---|
| 🌡️ Ola de calor | ≥ 3 días con temperatura máxima > 35 °C |
| 🌧️ Semana lluviosa | ≥ 4 días con lluvia o llovizna |
| 🥶 Frío intenso | Temperatura mínima de la semana < 0 °C |
| ☀️ Semana soleada | ≥ 5 días despejados |

### 🏠 Lista de lugares (Home)
- Lista personalizable de ciudades con clima actual
- Botón "Ver detalle" que lleva al pronóstico completo
- Añadir ciudades desde la barra de búsqueda
- Persistencia en `localStorage` (sin necesidad de cuenta)

### 👤 Sistema de cuentas (mock)
- Login / Registro con persistencia en `localStorage`
- Guardado de favoritos y preferencias por usuario
- 3 usuarios de prueba disponibles

### 🎨 Preferencias
- Toggle **Modo oscuro / claro**
- Toggle **°C / °F** (conversión dinámica en toda la app)
- Preferencias accesibles en `/configuracion` (sin login) o guardadas por usuario

---

## 🧩 Estructura del store (Vuex)

```
state
├── usuario / isAuthenticated / authLoading / authError
├── listaLugares / listaLoading / listaError
├── climaActual / ciudadActual / climaLoading / climaError
├── estadisticas        ← calculadas automáticamente al cargar clima
├── alertas             ← generadas por reglas al cargar clima
├── temaGuest           ← dark | light (invitados)
└── unidadGuest         ← C | F (invitados)
```

---

## 🧪 Usuarios de prueba

| Nombre | Email | Contraseña |
|---|---|---|
| Ana García | ana@demo.com | 123456 |
| Carlos Mendoza | carlos@demo.com | 123456 |
| Demo User | demo@demo.com | demo |

---

## 🛠 Stack tecnológico

| Tecnología | Uso |
|---|---|
| Vue 3 | Framework principal (Composition API) |
| Vuex 4 | Gestión de estado global |
| Vue Router 4 | Enrutamiento SPA con guards |
| Axios | Llamadas HTTP a APIs externas |
| Open-Meteo | Datos de clima y geocodificación |
| Nominatim | Geocodificación inversa |

---

## 📁 Estructura de carpetas

```
src/
├── main.js
├── App.vue                  # Root: tema, estilos globales
├── components/
│   ├── NavBar.vue
│   └── WeatherCard.vue
├── views/
│   ├── HomeView.vue         # Listado de lugares con clima
│   ├── DetailView.vue       # Pronóstico + estadísticas + alertas
│   ├── FavoritesView.vue    # Favoritos (auth)
│   ├── ConfigView.vue       # Configuración (libre)
│   ├── LoginView.vue
│   └── RegisterView.vue
├── router/
│   └── index.js
├── store/
│   └── index.js             # Estado, mutaciones, acciones, estadísticas, alertas
└── services/
    ├── weatherService.js    # Open-Meteo API + geocodificación
    └── authService.js       # Auth mock con localStorage
```
