const BASE = '/api';

// Lightweight fetch wrapper with JSON handling & error normalization
async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return null;// 204 No Content — nothing to parse
  const text = await res.text();// Read as text first to avoid JSON.parse crash on empty body
  if (!text) return null;
  return JSON.parse(text);
}

export const api = {
  todos: {
    getAll: () => request('/todos'),
    create: (data) => request('/todos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
  },
};
