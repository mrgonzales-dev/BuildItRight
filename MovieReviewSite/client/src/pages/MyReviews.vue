<script setup>
import { ref, reactive, onMounted } from 'vue';
import { api } from '../api.js';
import { useAuth } from '../composables/useAuth.js';
import StarRating from '../components/StarRating.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const { user } = useAuth();

const reviews = ref([]);
const loading = ref(true);
const error = ref('');
const successMessage = ref('');

// Inline editing — editingId tracks which review row is in edit mode.
const editingId = ref(null);
const editForm = reactive({
  rating: 0,
  comment: '',
});
const editSubmitting = ref(false);
const editError = ref('');

// Two-step delete confirmation — confirmDeleteId shows "Yes, Delete" / "Cancel" buttons.
const confirmDeleteId = ref(null);
const deleteSubmitting = ref(false);

onMounted(fetchReviews);

async function fetchReviews() {
  loading.value = true;
  error.value = '';
  try {
    reviews.value = await api.reviews.getByUser(user.value.id);
  } catch (err) {
    error.value = err.message || 'Failed to load your reviews.';
  } finally {
    loading.value = false;
  }
}

function startEdit(review) {
  editingId.value = review.id;
  editForm.rating = review.rating;
  editForm.comment = review.comment;
  editError.value = '';
  successMessage.value = '';
}

function cancelEdit() {
  editingId.value = null;
  editForm.rating = 0;
  editForm.comment = '';
  editError.value = '';
}

async function submitEdit(reviewId) {
  if (editSubmitting.value) return;
  if (!editForm.rating) {
    editError.value = 'Please select a rating.';
    return;
  }
  if (!editForm.comment.trim()) {
    editError.value = 'Please write a comment.';
    return;
  }

  editSubmitting.value = true;
  editError.value = '';

  try {
    await api.reviews.update(reviewId, {
      rating: editForm.rating,
      comment: editForm.comment.trim(),
    });
    cancelEdit();
    successMessage.value = 'Review updated successfully!';
    await fetchReviews();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err) {
    editError.value = err.message || 'Failed to update review.';
  } finally {
    editSubmitting.value = false;
  }
}

function requestDelete(reviewId) {
  confirmDeleteId.value = reviewId;
  successMessage.value = '';
}

function cancelDelete() {
  confirmDeleteId.value = null;
}

async function confirmDelete(reviewId) {
  deleteSubmitting.value = true;
  try {
    await api.reviews.delete(reviewId);
    confirmDeleteId.value = null;
    successMessage.value = 'Review deleted successfully!';
    await fetchReviews();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err) {
    error.value = err.message || 'Failed to delete review.';
  } finally {
    deleteSubmitting.value = false;
  }
}
</script>

<template>
  <div class="my-reviews-page animate-page-enter">
    <div class="page-header">
      <h1 class="page-title">My Reviews</h1>
    </div>

    <!-- Success toast -->
    <div v-if="successMessage" class="alert alert-success py-2">{{ successMessage }}</div>

    <!-- Loading -->
    <LoadingSpinner v-if="loading" message="Loading your reviews..." />

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Empty -->
    <div v-else-if="!reviews.length" class="empty-state">
      <div class="empty-state-icon">📝</div>
      <p class="empty-state-text">You haven't reviewed any movies yet.</p>
      <router-link to="/" class="btn btn-outline-info mt-2">Browse Movies</router-link>
    </div>

    <!-- Review list -->
    <div v-else class="review-items">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-item"
      >
        <!-- Movie title link -->
        <div class="d-flex justify-content-between align-items-start mb-2">
          <router-link
            :to="`/movies/${review.movie_id}`"
            class="movie-title-link"
          >
            {{ review.movie_title }}
          </router-link>

          <div class="d-flex gap-1 flex-shrink-0">
            <!-- Edit button (when not editing and not deleting) -->
            <button
              v-if="editingId !== review.id && confirmDeleteId !== review.id"
              class="btn btn-sm btn-outline-info"
              @click="startEdit(review)"
            >
              Edit
            </button>

            <!-- Delete with inline confirmation -->
            <template v-if="confirmDeleteId === review.id">
              <button
                class="btn btn-sm btn-outline-danger"
                :disabled="deleteSubmitting"
                @click="confirmDelete(review.id)"
              >
                Yes, Delete
              </button>
              <button class="btn btn-sm btn-outline-secondary" @click="cancelDelete">
                Cancel
              </button>
            </template>
            <button
              v-else-if="editingId !== review.id"
              class="btn btn-sm btn-outline-danger"
              @click="requestDelete(review.id)"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Inline edit form -->
        <div v-if="editingId === review.id" class="edit-form mb-2">
          <div v-if="editError" class="alert alert-danger py-1">{{ editError }}</div>
          <div class="mb-2">
            <label class="form-label">Rating</label>
            <StarRating v-model="editForm.rating" :readonly="false" />
          </div>
          <div class="mb-2">
            <textarea
              v-model="editForm.comment"
              class="form-control form-control-sm"
              rows="3"
            ></textarea>
          </div>
          <div class="d-flex gap-1">
            <button
              class="btn btn-sm btn-primary"
              :disabled="editSubmitting"
              @click="submitEdit(review.id)"
            >
              <span v-if="editSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              Save
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="cancelEdit">
              Cancel
            </button>
          </div>
        </div>

        <!-- Non-editing display -->
        <div v-else>
          <StarRating :modelValue="review.rating" />
          <p class="review-comment mt-1 mb-1">{{ review.comment }}</p>
          <small class="text-muted">{{ new Date(review.created_at).toLocaleDateString() }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-reviews-page {
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

.review-items {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.review-item {
  background-color: var(--bg-card, #141828);
  border: 1px solid var(--border-color, #25253a);
  border-radius: var(--radius-md, 12px);
  padding: 1.125rem 1.25rem;
  transition:
    border-color var(--transition-fast, 0.15s ease),
    box-shadow var(--transition-fast, 0.15s ease);
}

.review-item:hover {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.3));
}

.movie-title-link {
  color: var(--accent, #60a5fa);
  font-weight: 600;
  text-decoration: none;
  font-size: 1.05rem;
  transition: color 0.15s ease;
}

.movie-title-link:hover {
  color: #93c5fd;
  text-decoration: none;
}

.review-comment {
  color: var(--text-primary, #e8edf4);
  line-height: var(--line-height-relaxed, 1.75);
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

/* ── Empty state ─────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: var(--space-3xl, 4rem) var(--space-md, 1rem);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.6;
}

.empty-state-text {
  font-size: 1.1rem;
  color: var(--text-secondary, #8b94a7);
  margin-bottom: 0.25rem;
}
</style>
