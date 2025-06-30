<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div>
            <h1 class="text-xl font-semibold">Admin Dashboard</h1>
            <p class="text-sm text-gray-300">AI Review Moderation Management</p>
          </div>
          <div class="flex items-center space-x-4">
            
            <button
              @click="logout"
              class="text-gray-300 hover:text-white flex items-center space-x-2 px-3 py-2 rounded-md transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-blue-900">{{ reviews.length }}</div>
            <div class="text-sm text-blue-700">Total Reviews</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-green-900">{{ approvedCount }}</div>
            <div class="text-sm text-green-700">Approved</div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-red-900">{{ flaggedCount }}</div>
            <div class="text-sm text-red-700">Flagged</div>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-yellow-900">{{ pendingCount }}</div>
            <div class="text-sm text-yellow-700">Pending</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filter Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="filter in filters"
              :key="filter.key"
              @click="activeFilter = filter.key"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeFilter === filter.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ filter.label }} ({{ filter.count }})
            </button>
          </nav>
        </div>
      </div>

      <div v-if="loading" class="space-y-4">
        <ReviewSkeleton v-for="i in 3" :key="i" />
      </div>

      <div v-else-if="filteredReviews.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
        <p class="mt-1 text-sm text-gray-500">No reviews match the current filter.</p>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="review in filteredReviews"
          :key="review.id"
          :class="[
            'bg-white rounded-xl shadow-sm border-l-4 p-6',
            getModerationBorderColor(review)
          ]"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-gray-700">
                  {{ review.user?.charAt(0).toUpperCase() || 'A' }}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ review.user || 'Anonymous' }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(review.created_at) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="getModerationBadgeClasses(review)">
                {{ getModerationStatus(review) }}
              </span>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-gray-700 leading-relaxed">{{ review.text }}</p>
          </div>

          <div v-if="review.moderation_result !== null" class="space-y-3">
           
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">AI Analysis</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-sm font-medium text-gray-600">Status:</span>
                  <span :class="review.is_flagged ? 'text-red-600' : 'text-green-600'" class="ml-2 font-medium">
                    {{ review.is_flagged ? 'Flagged' : 'Approved' }}
                  </span>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-600">Analyzed:</span>
                  <span class="ml-2 font-medium">{{ formatDate(review.moderation_result.created_at) }}</span>
                </div>
              </div>

              <div v-if="review.flagged_categories && review.flagged_categories.length > 0" class="mt-3">
                <span class="text-sm font-medium text-gray-600">Issues detected:</span>
                <div class="flex flex-wrap gap-2 mt-2">
                  <span
                    v-for="category in review.flagged_categories"
                    :key="category"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    {{ category }}
                  </span>
                </div>
              </div>

              <div v-if="review.moderation_result.category_scores" class="mt-3">
                <span class="text-sm font-medium text-gray-600">Category Scores:</span>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <div v-for="(score, category) in review.moderation_result.category_scores" :key="category" class="text-xs">
                    <span class="text-gray-600">{{ category }}:</span>
                    <span class="ml-1 font-medium" :class="score > 0.5 ? 'text-red-600' : 'text-green-600'">
                      {{ (score * 100).toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

         
          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium text-yellow-800">Awaiting AI moderation...</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI, reviewsAPI } from '../services/api'
import ReviewSkeleton from '../components/ReviewSkeleton.vue'

const router = useRouter()
const toast = inject('toast')

const loading = ref(false)
const reviews = ref([])
const activeFilter = ref('all')

const filters = computed(() => [
  { key: 'all', label: 'All Reviews', count: reviews.value.length },
  { key: 'approved', label: 'Approved', count: approvedCount.value },
  { key: 'flagged', label: 'Flagged', count: flaggedCount.value },
  { key: 'pending', label: 'Pending', count: pendingCount.value }
])

const approvedCount = computed(() => 
  reviews.value.filter(r => r.moderation_result?.flagged === false).length
)

const flaggedCount = computed(() => 
  reviews.value.filter(r => r.is_flagged === true).length
)

const pendingCount = computed(() => 
  reviews.value.filter(r => r.moderation_result === null).length
)

const filteredReviews = computed(() => {
  switch (activeFilter.value) {
    case 'approved':
      return reviews.value.filter(r => r.moderation_result?.flagged === false)
    case 'flagged':
      return reviews.value.filter(r => r.is_flagged === true)
    case 'pending':
      return reviews.value.filter(r => r.moderation_result === null)
    default:
      return reviews.value
  }
})

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
      toast.showError('Access Denied', 'You do not have admin privileges.')
      router.push('/reviews')
      return
    }

    const response = await reviewsAPI.getAllAdmin()
    reviews.value = response.data
  } catch (error) {
    console.error('Error fetching admin reviews:', error)
    if (error.response?.status === 403) {
      toast.showError('Access Denied', 'You do not have admin privileges.')
      router.push('/reviews')
    } else {
      toast.showError('Failed to load reviews', 'Please try again.')
    }
  } finally {
    loading.value = false
  }
}

const getModerationBorderColor = (review) => {
  if (review.moderation_result === null) return 'border-yellow-400'
  return review.is_flagged ? 'border-red-400' : 'border-green-400'
}

const getModerationBadgeClasses = (review) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  if (review.moderation_result === null) return `${base} bg-yellow-100 text-yellow-800`
  return review.is_flagged 
    ? `${base} bg-red-100 text-red-800`
    : `${base} bg-green-100 text-green-800`
}

const getModerationStatus = (review) => {
  if (review.moderation_result === null) return 'Pending'
  return review.is_flagged ? 'Flagged' : 'Approved'
}

const goToReviews = () => {
  router.push('/reviews')
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
</script> 