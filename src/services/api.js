import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000', 
  timeout: 10000,
})


const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken')
  if (!refresh) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await axios.post('http://localhost:8000/api/token/refresh/', {
      refresh: refresh
    })
    
    const newAccessToken = response.data.access
    localStorage.setItem('token', newAccessToken)
    return newAccessToken
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    throw error
  }
}


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const newToken = await refreshToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)


export const authAPI = {
  login: (credentials) => api.post('/api/login/', credentials),
  register: (credentials) => api.post('/api/register/', credentials),
  checkAdmin: () => api.get('/api/admin/users/'),
  refreshToken: () => api.post('/api/token/refresh/', { 
    refresh: localStorage.getItem('refreshToken') 
  }),
}

export const reviewsAPI = {
  getAll: () => api.get('/api/reviews/'),
  create: (review) => api.post('/api/reviews/', review),
}

export default api 