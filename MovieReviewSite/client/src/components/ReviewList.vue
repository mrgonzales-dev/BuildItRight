<script setup>
import { ref } from 'vue';
import StarRating from './StarRating.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  reviews: {
    type: Array,
    default: () => [],
  },
  currentUserId: {
    type: Number,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['edit-review', 'delete-review']);

// Inline delete confirmation per review
const confirmDeleteId = ref(null);

function requestDelete(reviewId) {
  confirmDeleteId.value = reviewId;
}

function cancelDelete() {
  confirmDeleteId.value = null;
}

function confirmDelete(reviewId) {
  confirmDeleteId.value = null;
  emit('delete-review', reviewId);
}

function editReview(review) {
  emit('edit-review', review);
}
</script>

<template>
  <div class="review-list">
    <!-- Loading -->
    <LoadingSpinner v-if="loading" message="Loading reviews..." />

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Empty -->
    <div v-else-if="!reviews.length" class="empty-reviews">
      <p class="empty-reviews-text">No reviews yet. Be the first to review!</p>
    </div>

    <!-- Reviews -->
    <div v-else class="review-items">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-item"
      >
        <div class="review-header">
          <div class="review-author">
            <strong class="review-name">{{ review.user_name }}</strong>
            <span class="review-date">{{ new Date(review.created_at).toLocaleDateString() }}</span>
          </div>

          <!-- Edit/Delete buttons for own reviews -->
          <div v-if="currentUserId && review.user_id === currentUserId" class="review-actions">
            <button class="btn btn-sm btn-outline-info" @click="editReview(review)">
              Edit
            </button>

            <!-- Delete with inline confirmation -->
            <template v-if="confirmDeleteId === review.id">
              <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(review.id)">
                Yes, Delete
              </button>
              <button class="btn btn-sm btn-outline-secondary" @click="cancelDelete">
                Cancel
              </button>
            </template>
            <button v-else class="btn btn-sm btn-outline-danger" @click="requestDelete(review.id)">
              Delete
            </button>
          </div>
        </div>

        <StarRating :modelValue="review.rating" />

        <p class="review-comment mt-1 mb-0">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-list {
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

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.review-author {
  display: flex;
  flex-direction: column;
}

.review-name {
  color: var(--text-primary, #e8edf4);
  font-size: 0.9rem;
}

.review-date {
  color: var(--text-muted, #5c6378);
  font-size: 0.78rem;
}

.review-actions {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
}

.review-comment {
  color: var(--text-primary, #e8edf4);
  line-height: var(--line-height-relaxed, 1.75);
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  font-size: 0.95rem;
}

.empty-reviews {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-reviews-text {
  color: var(--text-secondary, #8b94a7);
  margin: 0;
}
</style>
