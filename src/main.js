// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Limpiamos cualquier sesión previa al arrancar — el usuario siempre debe hacer login
import { authService } from './services/authService';
authService.logout();

createApp(App).use(store).use(router).mount('#app');
