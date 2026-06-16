<script setup>
import { onMounted } from 'vue';
import { useAuth } from './composables/useAuth.js';
import NavBar from './components/NavBar.vue';

const { initFromStorage } = useAuth();

// Restore the user session from localStorage when the app first loads.
onMounted(() => {
  initFromStorage();
});
</script>

<template>
  <NavBar />
  <main class="container py-4">
    <!-- router-view renders the page component matching the current URL. -->
    <router-view />
  </main>
</template>
