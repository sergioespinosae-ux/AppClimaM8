<template>
  <div class="page-view">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">★ Mis Favoritos</h1>
          <p class="page-sub">Tus ciudades guardadas.</p>
        </div>
        <router-link to="/" class="btn btn-ghost">+ Buscar ciudad</router-link>
      </div>

      <!-- Empty state -->
      <div v-if="!favoritos.length" class="empty-state">
        <div class="es-icon">🌍</div>
        <h3>Todavía no guardaste ciudades</h3>
        <p>Busca una ciudad desde el inicio y guárdala con el botón "☆ Guardar en favoritos".</p>
        <router-link to="/" class="btn btn-primary">Ir al inicio</router-link>
      </div>

      <!-- Favorites grid -->
      <div v-else class="fav-list">
        <div
          v-for="fav in favoritos"
          :key="fav.id"
          class="fav-item"
          :class="{ loading: loadingId === fav.id }"
        >
          <div class="fi-info">
            <div class="fi-name">{{ fav.ciudad }}</div>
            <div class="fi-country">{{ fav.pais }}</div>
            <div class="fi-coords">
              {{ fav.lat.toFixed(2) }}, {{ fav.lon.toFixed(2) }}
            </div>
          </div>

          <!-- Weather preview if loaded -->
          <div v-if="climaFavs[fav.id]" class="fi-weather">
            <span class="fi-icon">{{ climaFavs[fav.id].icono }}</span>
            <span class="fi-temp">
              {{ convertir(climaFavs[fav.id].temperatura) }}°{{ unidad }}
            </span>
            <span class="fi-desc">{{ climaFavs[fav.id].descripcion }}</span>
          </div>
          <div v-else-if="loadingId === fav.id" class="fi-weather loading-text">
            Cargando…
          </div>

          <div class="fi-actions">
            <button class="btn btn-ghost fi-btn" @click="verClima(fav)">
              Ver clima
            </button>
            <button class="btn btn-danger fi-btn" @click="confirmarEliminar(fav.id)">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Confirm delete modal -->
      <div v-if="deletingId !== null" class="modal-overlay" @click.self="deletingId = null">
        <div class="modal">
          <h3>¿Eliminar favorito?</h3>
          <p>Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="deletingId = null">Cancelar</button>
            <button class="btn btn-danger" @click="eliminar">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { weatherService } from '@/services/weatherService';

export default {
  name: 'FavoritesView',
  setup() {
    const store  = useStore();
    const router = useRouter();

    const favoritos = computed(() => store.getters.favoritos);
    const unidad    = computed(() => store.getters.unidad);
    const loadingId = ref(null);
    const deletingId = ref(null);
    const climaFavs  = ref({});

    const convertir = (val) => weatherService.convertirTemp(val, unidad.value);

    // Pre-cargar clima de todos los favoritos al montar
    onMounted(async () => {
      for (const fav of favoritos.value) {
        loadingId.value = fav.id;
        try {
          climaFavs.value[fav.id] = await weatherService.obtenerClima(fav.lat, fav.lon);
        } catch { /* ignore */ }
      }
      loadingId.value = null;
    });

    const verClima = (fav) => {
      store.dispatch('cargarClima', {
        lat: fav.lat,
        lon: fav.lon,
        ciudad: `${fav.ciudad}, ${fav.pais}`,
      });
      router.push('/');
    };

    const confirmarEliminar = (id) => { deletingId.value = id; };
    const eliminar = () => {
      store.dispatch('eliminarFavorito', deletingId.value);
      deletingId.value = null;
    };

    return {
      favoritos, unidad, loadingId, deletingId, climaFavs,
      convertir, verClima, confirmarEliminar, eliminar,
    };
  },
};
</script>

<style scoped>
.page-view { padding: 48px 0 80px; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}
.page-title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}
.page-sub { color: var(--text-secondary); }

/* Empty */
.empty-state {
  text-align: center;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.es-icon { font-size: 4rem; opacity: 0.5; }
.empty-state h3 {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
}
.empty-state p { color: var(--text-secondary); max-width: 400px; }

/* Favorites list */
.fav-list { display: flex; flex-direction: column; gap: 12px; }
.fav-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.fav-item:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.fi-info { flex: 1; }
.fi-name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 2px;
}
.fi-country { color: var(--text-secondary); font-size: 0.85rem; }
.fi-coords  { color: var(--text-muted); font-size: 0.75rem; margin-top: 4px; font-family: monospace; }

.fi-weather {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  min-width: 180px;
}
.fi-icon { font-size: 1.5rem; }
.fi-temp {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
}
.fi-desc { color: var(--text-secondary); font-size: 0.8rem; }
.loading-text { color: var(--text-muted); font-size: 0.85rem; }

.fi-actions { display: flex; gap: 8px; }
.fi-btn { padding: 8px 14px; font-size: 0.82rem; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
  animation: fadeIn 0.15s ease;
}
@keyframes fadeIn { from { opacity: 0; } }
.modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
  max-width: 360px;
  width: 90%;
  box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column; gap: 12px;
}
.modal h3 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
}
.modal p { color: var(--text-secondary); font-size: 0.9rem; }
.modal-actions { display: flex; gap: 10px; margin-top: 8px; }

@media (max-width: 640px) {
  .fav-item { flex-wrap: wrap; }
  .fi-weather { min-width: 100%; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
