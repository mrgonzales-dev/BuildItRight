<script setup>
/**
 * Simple loading spinner wrapper.
 * Props:
 *   message (string, optional) — text shown next to the spinner
 */
defineProps({
  message: {
    type: String,
    default: 'Loading...',
  },
});
</script>

<template>
  <div class="d-flex justify-content-center align-items-center py-5">
    <div class="spinner-border text-info me-2" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <span class="text-secondary">{{ message }}</span>
  </div>
</template>

<style scoped>
.spinner-border.text-info {
  color: var(--accent, #60a5fa) !important;
  width: 1.5rem;
  height: 1.5rem;
  border-width: 0.15rem;
}
</style>
