import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api, setAuthUser, clearAuthUser } from '../api.js';

// ---------------------------------------------------------------------------
// Module-level singleton state — shared across ALL components that call useAuth().
// This is Vue 3's pattern for global state without a state management library.
// ---------------------------------------------------------------------------
const user = ref(null);
const isLoggedIn = computed(() => !!user.value);
const isOwner = computed(() => user.value?.role === 'owner');

export function useAuth() {
  const router = useRouter();

  // Restore session from localStorage on app startup — called once in App.vue.
  function initFromStorage() {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        user.value = parsed;
        setAuthUser(parsed);
      }
    } catch {
      localStorage.removeItem('user');
      user.value = null;
    }
  }

  // Sync user state to both Vue reactivity AND localStorage persistence.
  function setUser(newUser) {
    user.value = newUser;
    setAuthUser(newUser);
    try {
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch { /* localStorage full */ }
  }

  function clearUser() {
    user.value = null;
    clearAuthUser();
    try {
      localStorage.removeItem('user');
    } catch { /* ignore */ }
  }

  async function login(email, password) {
    const result = await api.auth.login({ email, password });
    setUser(result);
    return result;
  }

  async function register(name, email, password) {
    const result = await api.auth.register({ name, email, password });
    setUser(result);
    return result;
  }

  async function logout() {
    try { await api.auth.logout(); } catch { /* ignore */ }
    clearUser();
    router.push('/login');
  }

  return {
    user,
    isLoggedIn,
    isOwner,
    initFromStorage,
    setUser,
    clearUser,
    login,
    register,
    logout,
  };
}
