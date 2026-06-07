const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  conversation: {
    getAll: () => request('/conversations'),
    getById: (id) => request(`/conversations/${id}`),
    delete: (id) => request(`/conversations/${id}`, { method: 'DELETE' }),
  },
  message: {
    getByConversation: (conversationId) => request(`/messages/conversation/${conversationId}`),
  },
  ai: {
    chat: (conversation_id, message) =>
      request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ conversation_id, message }),
      }),
  },
}
