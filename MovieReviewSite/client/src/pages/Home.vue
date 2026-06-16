<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import MovieCard from '../components/MovieCard.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const movies = ref([]);
const loading = ref(true);
const error = ref('');

async function fetchMovies() {
  loading.value = true;
  error.value = '';
  try {
    movies.value = await api.movies.getAll();
  } catch (err) {
    error.value = err.message || 'Failed to load movies.';
  } finally {
    loading.value = false;
  }
}

// Vue calls onMounted after the component is inserted into the DOM.
onMounted(fetchMovies);
</script>

<template>
  <div class="home-page animate-page-enter">
    <div class="page-header">
      <h1 class="page-title">Movies</h1>
      <p class="page-subtitle">Discover and review your favorite films</p>
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="loading" message="Loading movies..." />

    <!-- Error -->
    <div v-else-if="error" class="text-center py-4">
      <div class="alert alert-danger">{{ error }}</div>
      <button class="btn btn-outline-info mt-2" @click="fetchMovies">Retry</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!movies.length" class="empty-state">
      <div class="empty-state-icon">🎥</div>
      <p class="empty-state-text">No movies available yet</p>
      <p class="empty-state-sub">Check back soon for new additions</p>
    </div>

    <!-- Movie grid — v-for renders a MovieCard for each movie in the array. -->
    <div v-else class="movie-grid">
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="movie-grid-item animate-card-entrance"
      >
        <MovieCard :movie="movie" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: var(--space-3xl, 4rem);
}

.page-header {
  margin-bottom: var(--space-xl, 2rem);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-secondary, #8b94a7);
  font-size: 0.95rem;
  margin: 0;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-lg, 1.5rem);
}

.movie-grid-item {
  /* item fills the grid cell */
}

/* ── Empty state ─────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: var(--space-3xl, 4rem) var(--space-md, 1rem);
}

.empty-state-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state-text {
  font-size: 1.2rem;
  color: var(--text-secondary, #8b94a7);
  margin-bottom: 0.25rem;
}

.empty-state-sub {
  font-size: 0.9rem;
  color: var(--text-muted, #5c6378);
}

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 576px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--space-md, 1rem);
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
