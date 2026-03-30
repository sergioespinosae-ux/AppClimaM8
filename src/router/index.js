// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router';
import store from '@/store';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Inicio – App de Clima' },
  },
  {
    path: '/detalle/:ciudad',
    name: 'detalle',
    component: () => import('@/views/DetailView.vue'),
    meta: { title: 'Detalle – App de Clima' },
  },
  {
    path: '/favoritos',
    name: 'favoritos',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { requiresAuth: true, title: 'Favoritos – App de Clima' },
  },
  {
    path: '/configuracion',
    name: 'configuracion',
    component: () => import('@/views/ConfigView.vue'),
    meta: { title: 'Configuración – App de Clima' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Iniciar sesión' },
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true, title: 'Registrarse' },
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true, title: 'Perfil – App de Clima' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, _from, next) => {
  // Update page title
  document.title = to.meta.title ?? 'App de Clima M8';

  const isAuth = store.getters.isAuthenticated;

  if (to.meta.requiresAuth && !isAuth) {
    return next({ name: 'login' });
  }
  if (to.meta.guestOnly && isAuth) {
    return next({ name: 'home' });
  }
  next();
});

export default router;
