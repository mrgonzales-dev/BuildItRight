<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

const { user, isLoggedIn, isOwner, logout } = useAuth();
const router = useRouter();
const route = useRoute();

const navExpanded = ref(false);

function toggleNav() {
  navExpanded.value = !navExpanded.value;
}

function closeNav() {
  navExpanded.value = false;
}

function handleLogout() {
  closeNav();
  logout();
}

function isActive(path) {
  return route.path === path;
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark app-navbar">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/" @click="closeNav">
        <span class="brand-icon">🎬</span>
        <span class="brand-text">MovieReviewSite</span>
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        :aria-expanded="navExpanded"
        aria-label="Toggle navigation"
        @click="toggleNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: navExpanded }">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <!-- Always visible -->
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: isActive('/') }" to="/" @click="closeNav">
              Home
            </router-link>
          </li>

          <!-- Logged out -->
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: isActive('/login') }" to="/login" @click="closeNav">
                Login
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: isActive('/register') }" to="/register" @click="closeNav">
                Register
              </router-link>
            </li>
          </template>

          <!-- Logged in -->
          <template v-else>
            <li class="nav-item">
              <span class="nav-link text-light user-greeting">
                Hello, {{ user.name }}
              </span>
            </li>

            <!-- Owner-only link -->
            <li v-if="isOwner" class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: isActive('/dashboard') }"
                to="/dashboard"
                @click="closeNav"
              >
                Dashboard
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: isActive('/my-reviews') }"
                to="/my-reviews"
                @click="closeNav"
              >
                My Reviews
              </router-link>
            </li>

            <li class="nav-item">
              <button class="btn btn-outline-light btn-sm ms-lg-2 my-2 my-lg-0 logout-btn" @click="handleLogout">
                Logout
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-navbar {
  background-color: rgba(14, 16, 26, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.25);
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
  position: sticky;
  top: 0;
  z-index: 1030;
}

.navbar-brand {
  font-size: 1.2rem;
  letter-spacing: -0.01em;
  color: var(--text-primary, #e8edf4) !important;
  transition: opacity 0.2s ease;
}

.navbar-brand:hover {
  opacity: 0.85;
}

.brand-icon {
  margin-right: 0.35rem;
}

.navbar-collapse {
  gap: 0.25rem;
}

.nav-link {
  padding: 0.5rem 0.875rem !important;
  border-radius: 8px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.nav-link.active {
  background-color: rgba(96, 165, 250, 0.12);
  color: var(--accent, #60a5fa) !important;
}

.nav-link:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.04);
}

.user-greeting {
  color: var(--text-secondary, #8b94a7) !important;
  cursor: default;
  font-weight: 400;
}

.logout-btn {
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.375rem 0.875rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Mobile tweaks */
@media (max-width: 991.98px) {
  .navbar-collapse {
    background-color: rgba(14, 16, 26, 0.97);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: var(--radius-md, 12px);
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .nav-link {
    padding: 0.6rem 1rem !important;
  }
}
</style>
