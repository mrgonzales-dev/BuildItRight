<script setup>
// 404 Not Found page
</script>

<template>
  <div class="not-found-page animate-page-enter">
    <div class="not-found-content">
      <div class="not-found-emoji">🎬</div>
      <h1 class="not-found-code">404</h1>
      <p class="not-found-message">This scene didn't make the final cut.</p>
      <router-link to="/" class="btn btn-primary">
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  text-align: center;
}

.not-found-content {
  max-width: 400px;
}

.not-found-emoji {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.not-found-code {
  font-size: 5rem;
  font-weight: 800;
  color: var(--text-secondary, #8b94a7);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.not-found-message {
  font-size: 1.1rem;
  color: var(--text-secondary, #8b94a7);
  margin-bottom: 1.5rem;
}
</style>
