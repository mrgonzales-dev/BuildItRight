<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

const router = useRouter();
const { isLoggedIn, login } = useAuth();

// Redirect away from login if already authenticated.
if (isLoggedIn.value) {
  router.push('/');
}

const form = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
});

const serverError = ref('');
const submitting = ref(false);

// Client-side validation — runs before the API call to give instant feedback.
function validate() {
  let valid = true;
  errors.email = '';
  errors.password = '';

  if (!form.email.trim()) {
    errors.email = 'Email is required';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Invalid email format';
    valid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    valid = false;
  }

  return valid;
}

async function handleSubmit() {
  if (submitting.value) return;
  if (!validate()) return;

  submitting.value = true;
  serverError.value = '';

  try {
    await login(form.email.trim(), form.password);
    router.push('/');
  } catch (err) {
    serverError.value = err.message || 'Login failed. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="auth-page animate-page-enter">
    <div class="auth-container">
      <div class="card form-card auth-card">
        <div class="card-body">
          <div class="auth-header">
            <h1 class="auth-title">Welcome back</h1>
            <p class="auth-subtitle">Sign in to your account</p>
          </div>

          <!-- Server error -->
          <div v-if="serverError" class="alert alert-danger">{{ serverError }}</div>

          <form @submit.prevent="handleSubmit" novalidate>
            <!-- Email -->
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                placeholder="you@example.com"
                autocomplete="email"
              />
              <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                autocomplete="current-password"
              />
              <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn btn-primary w-100 auth-submit"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ submitting ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <div class="auth-footer">
            <span class="text-secondary">Don't have an account?</span>
            <router-link to="/register" class="auth-link">Create one</router-link>
          </div>

          <div class="auth-demo">
            <small class="text-muted">
              Demo: owner@moviesite.com / owner123
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: var(--space-3xl, 4rem);
  min-height: calc(100vh - 80px);
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.45));
  border: 1px solid var(--border-color, #25253a);
}

.auth-card .card-body {
  padding: 2.25rem 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.375rem;
}

.auth-subtitle {
  color: var(--text-secondary, #8b94a7);
  font-size: 0.95rem;
  margin: 0;
}

.auth-submit {
  padding: 0.625rem 1rem;
  font-size: 0.95rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.9rem;
}

.auth-link {
  margin-left: 0.35rem;
  font-weight: 600;
}

.auth-demo {
  text-align: center;
  margin-top: 0.75rem;
}

@media (max-width: 576px) {
  .auth-card .card-body {
    padding: 1.75rem 1.25rem;
  }

  .auth-page {
    padding-top: 1.5rem;
  }
}
</style>
