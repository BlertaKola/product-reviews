<template>
  <div class="reviews-container">
    <nav class="navbar">
      <h1>Reviews</h1>
      <button @click="logout" class="logout-btn">Logout</button>
    </nav>

    <div class="reviews-content">
      <!-- Submit Review Form -->
      <div class="review-form-card">
        <h2>Submit a Review</h2>
        <form @submit.prevent="submitReview">
          <div class="form-group">
            <label for="text">Review Text:</label>
            <textarea 
              id="text"
              v-model="newReview.text" 
              rows="4"
              placeholder="Write your review here..."
              required
            ></textarea>
          </div>
          
          <button type="submit" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'Submit Review' }}
          </button>
        </form>
      </div>
      <div class="reviews-list">
        <h2>All Reviews</h2>
        <div v-if="loading" class="loading">Loading reviews...</div>
        <div v-else-if="reviews.length === 0" class="no-reviews">No reviews yet.</div>
        <div v-else>
          <div v-for="review in reviews" :key="review.id" class="review-card">
            <p class="review-content">{{ review.text }}</p>
            <div class="review-meta">
              <span>By: {{ review.user || 'Anonymous' }}</span>
              <span>{{ formatDate(review.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { reviewsAPI } from '../services/api'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const reviews = ref([])

const newReview = reactive({
  text: ''
})

const fetchReviews = async () => {
  loading.value = true
  try {
    const response = await reviewsAPI.getAll()
    reviews.value = response.data
  } catch (error) {
    console.error('Error fetching reviews:', error)
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  submitting.value = true
  try {
    const response = await reviewsAPI.create(newReview)
    
    reviews.value.unshift(response.data)
    
    newReview.text = ''
  } catch (error) {
    console.error('Error submitting review:', error)
  } finally {
    submitting.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  router.push('/')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.reviews-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.navbar {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar h1 {
  margin: 0;
  color: #333;
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

.reviews-content {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.review-form-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.review-form-card h2 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
}

button[type="submit"] {
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button[type="submit"]:hover:not(:disabled) {
  background: #0056b3;
}

button[type="submit"]:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.reviews-list h2 {
  color: #333;
  margin-bottom: 1rem;
}

.loading, .no-reviews {
  text-align: center;
  color: #666;
  font-style: italic;
}

.review-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.review-content {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}
</style> 