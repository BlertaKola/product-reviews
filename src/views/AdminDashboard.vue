<template>
  <div class="admin-container">
    <nav class="navbar">
      <h1>Admin Dashboard</h1>
      <div class="nav-actions">
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="admin-content">
      <div class="admin-header">
        <h2>All Reviews (Admin View)</h2>
        <div class="stats">
          <span class="stat">Total Reviews: {{ reviews.length }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading">Loading reviews...</div>
      <div v-else-if="reviews.length === 0" class="no-reviews">No reviews found.</div>
      <div v-else class="reviews-grid">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <p class="review-content">{{ review.text }}</p>
          <div class="review-meta">
            <div class="user-info">
              <strong>User:</strong> {{ review.user || 'Anonymous' }}
              <span v-if="review.user_id" class="user-id">(ID: {{ review.user_id }})</span>
            </div>
            <div class="date-info">
              <strong>Date:</strong> {{ formatDate(review.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI, reviewsAPI } from '../services/api'

const router = useRouter()
const loading = ref(false)
const reviews = ref([])

const checkAdminAccess = async () => {
  try {
    await authAPI.checkAdmin()
    return true
  } catch (error) {
    return false
  }
}

const fetchReviews = async () => {
  loading.value = true
  try {
    const hasAccess = await checkAdminAccess()
    if (!hasAccess) {
      router.push('/reviews')
      return
    }

    const response = await reviewsAPI.getAll()
    reviews.value = response.data
  } catch (error) {
    console.error('Error fetching reviews:', error)
    if (error.response?.status === 403) {
      router.push('/reviews')
    }
  } finally {
    loading.value = false
  }
}

const goToReviews = () => {
  router.push('/reviews')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  router.push('/')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.navbar {
  background: #343a40;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar h1 {
  margin: 0;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.nav-btn:hover {
  background: #0056b3;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c82333;
}

.admin-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin-header h2 {
  margin: 0;
  color: #333;
}

.stats {
  display: flex;
  gap: 2rem;
}

.stat {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #333;
}

.loading, .no-reviews {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
}

.reviews-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.review-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #007bff;
}

.review-content {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.review-meta {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.user-info, .date-info {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.user-info strong, .date-info strong {
  color: #333;
}

.user-id {
  color: #666;
  font-size: 0.8rem;
}
</style> 