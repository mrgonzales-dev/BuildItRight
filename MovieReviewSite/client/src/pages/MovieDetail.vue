<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import { useAuth } from '../composables/useAuth.js';
import StarRating from '../components/StarRating.vue';
import ReviewList from '../components/ReviewList.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { getInitials } from '../utils/initials.js';

const route = useRoute();
const { user, isLoggedIn } = useAuth();
// route.params.id is a string — convert to Number for comparisons.
const movieId = computed(() => Number(route.params.id));

const movie = ref(null);
const reviews = ref([]);
const loading = ref(true);
const error = ref('');

// Review form state — shown/hidden with showReviewForm toggle.
const showReviewForm = ref(false);
const editingReview = ref(null);
const reviewForm = reactive({
  rating: 0,
  comment: '',
});
const reviewSubmitting = ref(false);
const reviewError = ref('');

// Check if the current user already reviewed this movie — determines "Write" vs "Edit" button.
const existingReview = computed(() => {
  if (!user.value) return null;
  return reviews.value.find((r) => r.user_id === user.value.id) || null;
});

const hasReviewed = computed(() => !!existingReview.value);

// Map genre to CSS class for the poster gradient — same logic as MovieCard.vue.
const genreClass = computed(() => {
  const raw = (movie.value?.genre || '').toLowerCase().trim();
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

// Fetch movie + reviews in parallel — Promise.all reduces total load time.
async function fetchMovie() {
  try {
    const [movieData, reviewData] = await Promise.all([
      api.movies.getById(movieId.value),
      api.movies.getReviews(movieId.value),
    ]);
    movie.value = movieData;
    reviews.value = reviewData;
  } catch (err) {
    error.value = err.message || 'Failed to load movie details.';
  } finally {
    loading.value = false;
  }
}

function openReviewForm(review) {
  if (review) {
    // Editing an existing review — pre-fill the form with current values.
    editingReview.value = review;
    reviewForm.rating = review.rating;
    reviewForm.comment = review.comment;
  } else {
    editingReview.value = null;
    reviewForm.rating = 0;
    reviewForm.comment = '';
  }
  showReviewForm.value = true;
  reviewError.value = '';
}

function cancelReviewForm() {
  showReviewForm.value = false;
  editingReview.value = null;
  reviewForm.rating = 0;
  reviewForm.comment = '';
  reviewError.value = '';
}

async function submitReview() {
  if (reviewSubmitting.value) return;
  if (!reviewForm.rating) {
    reviewError.value = 'Please select a rating.';
    return;
  }
  if (!reviewForm.comment.trim()) {
    reviewError.value = 'Please write a comment.';
    return;
  }

  reviewSubmitting.value = true;
  reviewError.value = '';

  try {
    // Choose create or update based on whether we're editing.
    if (editingReview.value) {
      await api.reviews.update(editingReview.value.id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
    } else {
      await api.reviews.create(movieId.value, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
    }
    cancelReviewForm();
    // Re-fetch reviews to show the new/updated one with the correct timestamp.
    reviews.value = await api.movies.getReviews(movieId.value);
  } catch (err) {
    reviewError.value = err.message || 'Failed to save review.';
  } finally {
    reviewSubmitting.value = false;
  }
}

async function handleEditReview(review) {
  openReviewForm(review);
}

async function handleDeleteReview(reviewId) {
  try {
    await api.reviews.delete(reviewId);
    // Re-fetch to update the list and the average rating.
    reviews.value = await api.movies.getReviews(movieId.value);
  } catch (err) {
    reviewError.value = err.message || 'Failed to delete review.';
  }
}

// onMounted fires after the component is inserted into the DOM — safe to fetch data here.
onMounted(fetchMovie);
</script>

<template>
  <div class="movie-detail-page animate-page-enter">
    <LoadingSpinner v-if="loading" message="Loading movie..." />

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <template v-else-if="movie">
      <div class="row g-4">
        <!-- Poster -->
        <div class="col-12 col-md-4 col-lg-3">
          <div :class="['poster-placeholder', 'd-flex', 'align-items-center', 'justify-content-center', `poster-${genreClass}`]">
            <span class="poster-initials">{{ getInitials(movie.title) }}</span>
          </div>
        </div>

        <!-- Details -->
        <div class="col-12 col-md-8 col-lg-9">
          <h1 class="mb-3">{{ movie.title }}</h1>
          <div class="d-flex gap-3 mb-3 flex-wrap align-items-center">
            <span :class="['badge', 'genre-badge', `genre-${genreClass}`]">
              {{ movie.genre || 'General' }}
            </span>
            <span class="text-secondary">{{ movie.year }}</span>
          </div>

          <p class="text-body mb-4">{{ movie.description }}</p>

          <div class="d-flex align-items-center gap-3 mb-4 rating-row">
            <StarRating :modelValue="movie.avg_rating ?? 0" />
            <span class="text-secondary">
              {{ movie.review_count ?? 0 }} review{{ movie.review_count !== 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Review section -->
          <div class="review-section">
            <h2 class="mb-4">Reviews</h2>

            <!-- Not logged in prompt -->
            <div v-if="!isLoggedIn" class="alert alert-info">
              <router-link to="/login">Log in</router-link> to write a review.
            </div>

            <!-- Logged in — review form -->
            <div v-else>
              <!-- Toggle form button -->
              <div v-if="!showReviewForm" class="mb-4">
                <button
                  v-if="!hasReviewed"
                  class="btn btn-primary"
                  @click="openReviewForm(null)"
                >
                  ✏️ Write a Review
                </button>
                <button
                  v-else
                  class="btn btn-outline-info"
                  @click="openReviewForm(existingReview)"
                >
                  Edit Your Review
                </button>
              </div>

              <!-- Review form -->
              <div v-if="showReviewForm" class="review-form card form-card mb-4">
                <div class="card-body">
                  <h3 class="mb-3">{{ editingReview ? 'Edit Your Review' : 'Write a Review' }}</h3>

                  <div v-if="reviewError" class="alert alert-danger py-2">{{ reviewError }}</div>

                  <div class="mb-3">
                    <label class="form-label">Rating</label>
                    <div>
                      <StarRating v-model="reviewForm.rating" :readonly="false" />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="review-comment" class="form-label">Comment</label>
                    <textarea
                      id="review-comment"
                      v-model="reviewForm.comment"
                      class="form-control"
                      rows="4"
                      placeholder="Share your thoughts about this movie..."
                    ></textarea>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-primary"
                      :disabled="reviewSubmitting"
                      @click="submitReview"
                    >
                      <span v-if="reviewSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                      {{ reviewSubmitting ? 'Saving...' : (editingReview ? 'Update Review' : 'Submit Review') }}
                    </button>
                    <button class="btn btn-outline-secondary" @click="cancelReviewForm">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Review list -->
            <ReviewList
              :reviews="reviews"
              :current-user-id="user?.id ?? null"
              @edit-review="handleEditReview"
              @delete-review="handleDeleteReview"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.movie-detail-page {
  padding-bottom: var(--space-3xl, 4rem);
}

.poster-placeholder {
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.45));
}

.poster-initials {
  font-size: 4.5rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.04em;
  user-select: none;
  position: relative;
  z-index: 2;
}

.rating-row {
  padding: 0.5rem 0;
}

.review-section h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary, #e8edf4);
}

.review-form.card.form-card {
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.35));
}

@media (max-width: 767.98px) {
  .poster-placeholder {
    max-width: 260px;
    margin: 0 auto;
  }

  .poster-initials {
    font-size: 3rem;
  }
}
</style>
