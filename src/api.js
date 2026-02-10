import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('karmaloop-auth')
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

export default api
