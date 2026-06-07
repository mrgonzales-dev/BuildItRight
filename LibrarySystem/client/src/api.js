const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  categories: {
    getAll: () => request('/categories'),
    getById: (id) => request(`/categories/${id}`),
    create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  },
  books: {
    getAll: () => request('/books'),
    search: (q) => request(`/books/search?q=${encodeURIComponent(q)}`),
    getById: (id) => request(`/books/${id}`),
    create: (data) => request('/books', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/books/${id}`, { method: 'DELETE' }),
  },
  members: {
    getAll: () => request('/members'),
    search: (q) => request(`/members/search?q=${encodeURIComponent(q)}`),
    getById: (id) => request(`/members/${id}`),
    create: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  },
  borrowings: {
    getAll: () => request('/borrowings'),
    getOverdue: () => request('/borrowings/overdue'),
    getById: (id) => request(`/borrowings/${id}`),
    getByMember: (memberId) => request(`/borrowings/by-member/${memberId}`),
    getByBook: (bookId) => request(`/borrowings/by-book/${bookId}`),
    create: (data) => request('/borrowings', { method: 'POST', body: JSON.stringify(data) }),
    returnBook: (id) => request(`/borrowings/${id}/return`, { method: 'PUT' }),
  },
};
