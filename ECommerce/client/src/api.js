const BASE = '/api';

let authUser = null;
let userChangeCallback = null;

export function setAuthUser(user) {
  authUser = user;
  if (userChangeCallback) userChangeCallback(user);
}

export function onUserChange(cb) {
  userChangeCallback = cb;
  return () => {
    userChangeCallback = null;
  };
}

async function request(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (authUser) {
    headers['user-id'] = String(authUser.id);
  }

  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  users: {
    register: (data) => request('/users/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/users/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/users/me'),
    updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  categories: {
    getAll: () => request('/categories'),
    getById: (id) => request(`/categories/${id}`),
    create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  },

  products: {
    getAll: () => request('/products'),
    getById: (id) => request(`/products/${id}`),
    search: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
    getByCategory: (catId) => request(`/products/category/${catId}`),
    create: (formData) => request('/products', { method: 'POST', body: formData }),
    update: (id, formData) => request(`/products/${id}`, { method: 'PUT', body: formData }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  cart: {
    get: () => request('/cart'),
    add: (data) => request('/cart', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
    checkout: (data) => request('/cart/checkout', { method: 'POST', body: JSON.stringify(data) }),
  },

  orders: {
    getAll: () => request('/orders'),
    getMyOrders: () => request('/orders/my'),
    getById: (id) => request(`/orders/${id}`),
    updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
};
