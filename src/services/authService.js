// src/services/authService.js
// Servicio de autenticación simulado (sin backend real)

const FAKE_USERS = [
  {
    id: 1,
    nombre: 'Ana García',
    email: 'ana@clima.com',
    password: '123456',
    preferencias: {
      unidad: 'C',      // 'C' o 'F'
      tema: 'dark',     // 'dark' o 'light'
    },
    favoritos: [
      { id: 1, ciudad: 'Santiago', pais: 'CL', lat: -33.45, lon: -70.67 },
      { id: 2, ciudad: 'Buenos Aires', pais: 'AR', lat: -34.61, lon: -58.38 },
    ],
  },
  {
    id: 2,
    nombre: 'Carlos Mendoza',
    email: 'carlos@clima.com',
    password: 'abcdef',
    preferencias: {
      unidad: 'F',
      tema: 'light',
    },
    favoritos: [
      { id: 1, ciudad: 'Madrid', pais: 'ES', lat: 40.42, lon: -3.7 },
      { id: 2, ciudad: 'Lima', pais: 'PE', lat: -12.04, lon: -77.03 },
      { id: 3, ciudad: 'Ciudad de México', pais: 'MX', lat: 19.43, lon: -99.13 },
    ],
  },
  {
    id: 3,
    nombre: 'Demo User',
    email: 'demo@demo.com',
    password: 'demo',
    preferencias: {
      unidad: 'C',
      tema: 'dark',
    },
    favoritos: [
      { id: 1, ciudad: 'Valparaíso', pais: 'CL', lat: -33.05, lon: -71.62 },
    ],
  },
];

// Simula latencia de red
const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

export const authService = {
  /**
   * Intenta iniciar sesión con las credenciales dadas.
   * Devuelve el usuario (sin password) o lanza un error.
   */
  async login(email, password) {
    await delay();

    const user = FAKE_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Usuario o contraseña incorrectos.');
    }

    // Devuelve copia sin password
    const { password: _pw, ...userData } = user;
    // Guardar en localStorage para persistencia de sesión
    localStorage.setItem('weather_user', JSON.stringify(userData));
    return userData;
  },

  /**
   * Cierra la sesión eliminando el usuario del localStorage.
   */
  async logout() {
    await delay(200);
    localStorage.removeItem('weather_user');
  },

  /**
   * Registra un nuevo usuario (simulado).
   */
  async register(nombre, email, password) {
    await delay();

    const existe = FAKE_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existe) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }

    const nuevoUsuario = {
      id: FAKE_USERS.length + 1,
      nombre,
      email,
      preferencias: { unidad: 'C', tema: 'dark' },
      favoritos: [],
    };

    FAKE_USERS.push({ ...nuevoUsuario, password });
    localStorage.setItem('weather_user', JSON.stringify(nuevoUsuario));
    return nuevoUsuario;
  },

  /**
   * Recupera el usuario guardado en localStorage (para refrescos de página).
   */
  getStoredUser() {
    const raw = localStorage.getItem('weather_user');
    return raw ? JSON.parse(raw) : null;
  },
};
