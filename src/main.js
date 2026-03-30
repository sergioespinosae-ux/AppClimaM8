// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

async function bootstrap() {
  // Restaurar sesión guardada antes de montar la app
  await store.dispatch('restaurarSesion');

  createApp(App).use(store).use(router).mount('#app');
}

bootstrap();
