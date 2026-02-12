import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('buddybeasts-auth')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch {
      // ignore parse errors
    }
  }
  return config
})

// Mark a conversation as read and sync with backend (if available)
export async function markConversationRead(conversationId) {
  // If you have a backend endpoint, call it here
  // await api.post('/api/chat/read-status', { conversationId, lastReadTimestamp: Date.now() / 1000 })
}

export default api
