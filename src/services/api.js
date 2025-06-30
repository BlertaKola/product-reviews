import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL, 
  timeout: 10000,
})


const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken')
  if (!refresh) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
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
  getById: (id) => api.get(`/api/reviews/${id}/`),
  create: (review) => api.post('/api/reviews/', review),
  

  getAllAdmin: () => api.get('/api/admin/reviews/'),
}


export const pollForModeration = async (reviewId, maxAttempts = 10, interval = 500) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await reviewsAPI.getById(reviewId)
      const review = response.data
      
      if (review.moderation_result !== null && review.moderation_result !== undefined) {
        return review
      }
      
      await new Promise(resolve => setTimeout(resolve, interval))
    } catch (error) {
      console.error('Polling error:', error)
      throw error
    }
  }
  
  throw new Error('Moderation timeout - please refresh to see updated status')
}

export default api 