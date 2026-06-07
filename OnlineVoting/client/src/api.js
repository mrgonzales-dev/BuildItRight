const BASE = '/api';

async function request(url, options = {}) {
  const pin = sessionStorage.getItem('admin_pin');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (pin && (options.method !== 'GET' || url.startsWith('/voters') || url.startsWith('/audit-log') || url === '/database')) {
    headers['x-admin-pin'] = pin;
  }
  if (options.body && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers,
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    verify: (pin) => request('/auth/verify', { method: 'POST', body: JSON.stringify({ pin }) }),
  },
  elections: {
    getStats: () => request('/elections/stats'),
    getAll: () => request('/elections'),
    getById: (id) => request(`/elections/${id}`),
    create: (data) => request('/elections', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/elections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    activate: (id) => request(`/elections/${id}/activate`, { method: 'POST' }),
    reopen: (id) => request(`/elections/${id}/reopen`, { method: 'POST' }),
    delete: (id) => request(`/elections/${id}`, { method: 'DELETE' }),
  },
  positions: {
    getByElection: (electionId) => request(`/elections/${electionId}/positions`),
    create: (electionId, data) => request(`/elections/${electionId}/positions`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/positions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/positions/${id}`, { method: 'DELETE' }),
  },
  candidates: {
    getByPosition: (positionId) => request(`/positions/${positionId}/candidates`),
    create: (positionId, data) => request(`/positions/${positionId}/candidates`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/candidates/${id}`, { method: 'DELETE' }),
  },
  voters: {
    getAll: () => request('/voters'),
    getById: (id) => request(`/voters/${id}`),
    create: (data) => request('/voters', { method: 'POST', body: JSON.stringify(data) }),
    createBulk: (rows) => request('/voters/bulk', { method: 'POST', body: JSON.stringify({ rows }) }),
    uploadCsv: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/voters/upload', { method: 'POST', body: formData });
    },
    getTemplate: async () => {
      const pin = sessionStorage.getItem('admin_pin');
      const res = await fetch(`${BASE}/voters/template`, {
        headers: { 'x-admin-pin': pin || '' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to download template' }));
        throw new Error(err.error || 'Failed to download template');
      }
      return res.blob();
    },
    update: (id, data) => request(`/voters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/voters/${id}`, { method: 'DELETE' }),
  },
  vote: {
    kiosk: () => request('/vote/kiosk'),
    validate: (accessCode) => request('/vote/validate', { method: 'POST', body: JSON.stringify({ access_code: accessCode }) }),
    cast: (accessCode, selections) => request('/vote/cast', { method: 'POST', body: JSON.stringify({ access_code: accessCode, selections }) }),
    getReceipt: (receiptCode) => request(`/vote/receipt/${receiptCode}`),
  },
  results: {
    getByElection: (electionId) => request(`/elections/${electionId}/results`),
  },
  auditLog: {
    getAll: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/audit-log${qs ? '?' + qs : ''}`);
    },
    getActionTypes: () => request('/audit-log/action-types'),
  },
  database: {
    getAll: () => request('/database'),
  },
};
