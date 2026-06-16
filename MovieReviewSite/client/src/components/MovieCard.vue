<script setup>
import { computed } from 'vue';
import StarRating from './StarRating.vue';
import { getInitials } from '../utils/initials.js';

const props = defineProps({
  movie: { type: Object, required: true },
});

// Extract first letter of each word for the poster placeholder (e.g. "The Godfather" -> "TG").
const initials = computed(() => getInitials(props.movie.title));

// Map genre string to a CSS class suffix. Normalizes casing and handles common variations
// like "Sci-Fi", "sci-fi", and "Science Fiction" all mapping to "scifi".
const genreClass = computed(() => {
  const raw = (props.movie.genre || '').toLowerCase().trim();
  if (/\b(sci.?fi|science\s*fi|science\s*fiction)\b/.test(raw)) return 'scifi';
  if (/\b(action)\b/.test(raw)) return 'action';
  if (/\b(drama)\b/.test(raw)) return 'drama';
  if (/\b(crime)\b/.test(raw)) return 'crime';
  if (/\b(thriller)\b/.test(raw)) return 'thriller';
  if (/\b(war)\b/.test(raw)) return 'war';
  if (/\b(comedy)\b/.test(raw)) return 'comedy';
  if (/\b(horror)\b/.test(raw)) return 'horror';
  if (/\b(romance)\b/.test(raw)) return 'romance';
  return 'default';
});
</script>

<template>
  <router-link
    :to="`/movies/${movie.id}`"
    class="card movie-card text-white text-decoration-none h-100"
  >
    <!-- Poster placeholder with genre-based gradient -->
    <div :class="['poster-placeholder', 'd-flex', 'align-items-center', 'justify-content-center', `poster-${genreClass}`]">
      <span class="poster-initials">{{ initials }}</span>
    </div>

    <div class="card-body d-flex flex-column">
      <h5 class="card-title mb-1">{{ movie.title }}</h5>
      <div class="d-flex gap-2 mb-2 flex-wrap">
        <span :class="['badge', 'genre-badge', `genre-${genreClass}`]">
          {{ movie.genre || 'General' }}
        </span>
        <small class="text-secondary align-self-center">{{ movie.year }}</small>
      </div>

      <div class="mt-auto d-flex justify-content-between align-items-center">
        <StarRating :modelValue="movie.avg_rating ?? 0" />
        <small class="text-secondary">
          {{ movie.review_count ?? 0 }} review{{ movie.review_count !== 1 ? 's' : '' }}
        </small>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.movie-card {
  background-color: var(--bg-card, #141828);
  border: 1px solid var(--border-color, #25253a);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.25s ease;
}

.movie-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: var(--shadow-card-hover, 0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(96,165,250,0.12));
  border-color: rgba(96, 165, 250, 0.2);
}

.poster-placeholder {
  width: 100%;
  aspect-ratio: 2 / 3;
}

.poster-initials {
  font-size: 3rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.03em;
  user-select: none;
  position: relative;
  z-index: 2;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: var(--line-height-tight, 1.25);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
