<template>
  <div class="min-h-screen bg-gray-50">
    
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div>
            <h1 class="text-xl font-semibold text-gray-900">Product Reviews</h1>
            <p class="text-sm text-gray-600">Share your experience with AI-powered moderation</p>
          </div>
          <button
            @click="logout"
            class="btn-secondary flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>


    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- Review Form -->
        <ReviewForm 
          @reviewSubmitted="handleReviewSubmitted"
          @showToast="handleShowToast"
        />
        
    
        <div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Recent Reviews</h2>
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <span>{{ reviews.length }} reviews</span>
              <button
                @click="fetchReviews"
                :disabled="loading"
                class="p-1 rounded hover:bg-gray-100 transition-colors"
                :title="autoRefreshInterval ? 'Refresh now (auto-refresh active every 30s)' : 'Refresh reviews'"
              >
                <svg 
                  :class="['w-4 h-4', loading && 'animate-spin', autoRefreshInterval && 'text-blue-600']" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
         
          <div v-if="loading" class="space-y-4">
            <ReviewSkeleton v-for="i in 3" :key="i" />
          </div>
          
         
          <div v-else-if="reviews.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.126A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p class="mt-1 text-sm text-gray-500">Be the first to share your experience!</p>
          </div>
          
      
          <div v-else class="space-y-4">
            <div
              v-for="review in nonFlaggedReviews"
              :key="review.id"
              class="card hover:shadow-md transition-shadow duration-200"
            >
              
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-800">
                      {{ review.user?.charAt(0).toUpperCase() || 'A' }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ review.user || 'Anonymous' }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(review.created_at) }}</p>
                  </div>
                </div>
                <div v-if="review.moderation_result?.flagged === false" class="flex items-center space-x-1 text-green-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs font-medium">Verified</span>
                </div>
              </div>
              
             
              <p class="text-gray-700 leading-relaxed">{{ review.text }}</p>
              
           
              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div class="text-xs text-gray-500">
                  {{ review.moderation_result === null ? 'Pending moderation' : 'AI approved' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { reviewsAPI } from '../services/api'
import ReviewForm from '../components/ReviewForm.vue'
import ReviewSkeleton from '../components/ReviewSkeleton.vue'

const router = useRouter()
const toast = inject('toast')

const loading = ref(false)
const reviews = ref([])
const autoRefreshInterval = ref(null)


const nonFlaggedReviews = computed(() => {
  return reviews.value.filter(review => review.is_flagged !== true)
})

const fetchReviews = async () => {
  loading.value = true
  try {
    const response = await reviewsAPI.getAll()
    reviews.value = response.data
  } catch (error) {
    console.error('Error fetching reviews:', error)
    toast.showError(
      'Failed to load reviews',
      'Please check your connection and try again.'
    )
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  autoRefreshInterval.value = setInterval(() => {
    fetchReviews()
  }, 30000) // 30 seconds
}

const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

const handleReviewSubmitted = (newReview) => {

  reviews.value.unshift(newReview)
  
  if (!autoRefreshInterval.value) {
    startAutoRefresh()
  }
}

const handleShowToast = (toastData) => {
  switch (toastData.type) {
    case 'success':
      toast.showSuccess(toastData.title, toastData.message)
      break
    case 'warning':
      toast.showWarning(toastData.title, toastData.message)
      break
    case 'error':
      toast.showError(toastData.title, toastData.message)
      break
    default:
      console.warn('Unknown toast type:', toastData.type)
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  toast.showSuccess('Logged out', 'You have been successfully logged out.')
  setTimeout(() => {
    router.push('/')
  }, 1000)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchReviews()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script> 