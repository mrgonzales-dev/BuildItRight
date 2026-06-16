// API client — thin fetch wrapper that handles auth headers and error responses.
// Every request automatically includes the x-user-id header when a user is logged in.

const BASE = '/api';
// Module-level state — shared across all imports. This is the "single source of truth" for auth.
let currentUser = null;

export function setAuthUser(user) {
  currentUser = user;
}

export function getAuthUser() {
  return currentUser;
}

export function clearAuthUser() {
  currentUser = null;
}

// Central fetch wrapper — all API calls go through this one function.
async function request(url, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;
  const res = await fetch(`${BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      // x-user-id is how the backend identifies the logged-in user (no JWT needed).
      ...(currentUser ? { 'x-user-id': String(currentUser.id) } : {}),
      ...extraHeaders,
    },
    ...restOptions,
  });

  // If the server says 401 and we thought we were logged in, clear the stale session.
  if (res.status === 401 && currentUser) {
    clearAuthUser();
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  // Parse the error response body and throw a readable Error.
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  // 204 No Content (used by DELETE) — return null instead of trying to parse JSON.
  if (res.status === 204) return null;
  return res.json();
}

// ---------------------------------------------------------------------------
// API endpoints — organized by resource. Each method is a one-liner.
// ---------------------------------------------------------------------------
export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
  },

  movies: {
    getAll: () => request('/movies'),
    getById: (id) => request(`/movies/${id}`),
    getReviews: (movieId) => request(`/movies/${movieId}/reviews`),
    create: (data) => request('/movies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/movies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/movies/${id}`, { method: 'DELETE' }),
  },

  reviews: {
    create: (movieId, data) => request(`/movies/${movieId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
    getByUser: (userId) => request(`/users/${userId}/reviews`),
  },
};
