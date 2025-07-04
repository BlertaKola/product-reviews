<template>
  <div class="card">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Submit a Review</h2>
    
    <form @submit.prevent="submitReview" class="space-y-4">
      <div>
        <label for="reviewText" class="block text-sm font-medium text-gray-700 mb-2">
          Write your review
        </label>
        <textarea
          id="reviewText"
          v-model="reviewText"
          :disabled="isSubmitting"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50"
          placeholder="Share your thoughts about this product..."
          required
        ></textarea>
      </div>
      
      <div class="flex items-center justify-between">
        <button
          type="submit"
          :disabled="isSubmitting || !reviewText.trim()"
          class="btn-primary flex items-center space-x-2"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          
          <span v-if="isSubmitting">Moderating your review...</span>
          <span v-else>Submit Review</span>
        </button>
        
        <span class="text-sm text-gray-500">
          {{ reviewText.length }}/1000
        </span>
      </div>
    </form>
    
    <div v-if="isSubmitting" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-blue-600 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium text-blue-800">
          AI is moderating your review for inappropriate content...
        </span>
      </div>
    </div>
    
    <div v-if="showSuccessMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-green-800">
            Thank You for Your Review!
          </h3>
          <p class="text-sm mt-1 text-green-800">
            Your review has been approved by AI moderation and is now visible to other users.
          </p>
        </div>
      </div>
    </div>
    
    <div v-if="submissionResult" class="mt-4 p-4 rounded-lg" :class="getWarningClasses()">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg v-if="submissionResult.is_spam" class="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium" :class="getWarningTextClass()">
            {{ getWarningTitle() }}
          </h3>
          <p class="text-sm mt-1" :class="getWarningTextClass()">
            {{ getWarningMessage() }}
          </p>
          <div v-if="submissionResult.is_spam && submissionResult.spam_confidence" class="mt-2">
            <p class="text-sm" :class="getWarningTextClass()">
              Spam confidence: {{ (submissionResult.spam_confidence * 100).toFixed(1) }}%
            </p>
          </div>
          <div v-if="!submissionResult.is_spam && getFlaggedCategories(submissionResult).length > 0" class="mt-2">
            <p class="text-sm" :class="getWarningTextClass()">
              Issues detected: {{ getFlaggedCategories(submissionResult).join(', ') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { reviewsAPI } from '../services/api'

const emit = defineEmits(['reviewSubmitted', 'showToast'])

const reviewText = ref('')
const isSubmitting = ref(false)
const showSuccessMessage = ref(false)
const submissionResult = ref(null)

const submitReview = async () => {
  if (!reviewText.value.trim()) return
  
  try {
    isSubmitting.value = true
    showSuccessMessage.value = false
    submissionResult.value = null
    
    const response = await reviewsAPI.create({ text: reviewText.value })
    const review = response.data
    
    console.log('🔍 API Response when creating review:', review)
    
    reviewText.value = ''
    

    setTimeout(async () => {
      try {
        const moderatedResponse = await reviewsAPI.getById(review.id)
        const moderatedReview = moderatedResponse.data
        
        console.log('🔍 Moderation result:', moderatedReview.moderation_result)
        
        isSubmitting.value = false
        
        if (moderatedReview.moderation_result?.flagged === false && moderatedReview.is_spam !== true) {
          showSuccessMessage.value = true
          
          emit('reviewSubmitted', moderatedReview)
          
          emit('showToast', {
            type: 'success',
            title: 'Thanks for your review!',
            message: 'Your review has been approved and is now visible to other users.'
          })
          
          setTimeout(() => {
            showSuccessMessage.value = false
          }, 6000)
          
        } else if (moderatedReview.moderation_result?.flagged === true) {
          submissionResult.value = moderatedReview
          
          emit('showToast', {
            type: 'warning',
            title: 'Review Contains Harmful Content',
            message: 'Your review won\'t be publicly shown due to inappropriate content.'
          })
          
          setTimeout(() => {
            submissionResult.value = null
          }, 8000)
          
        } else if (moderatedReview.is_spam === true) {
          submissionResult.value = moderatedReview
          
          emit('showToast', {
            type: 'warning',
            title: 'Review Detected as Spam',
            message: `Your review was flagged as spam (${(moderatedReview.spam_confidence * 100).toFixed(1)}% confidence) and won't be shown publicly.`
          })
          
          setTimeout(() => {
            submissionResult.value = null
          }, 8000)
          
        } else {
          isSubmitting.value = false
          showSuccessMessage.value = true
          
          emit('showToast', {
            type: 'success',
            title: 'Review Submitted',
            message: 'Your review is still being processed.'
          })
          
          setTimeout(() => {
            showSuccessMessage.value = false
          }, 6000)
        }
        
      } catch (error) {
        console.error('Error polling moderation result:', error)
        isSubmitting.value = false
        
        showSuccessMessage.value = true
        emit('showToast', {
          type: 'success',
          title: 'Review Submitted',
          message: 'Your review has been submitted and is being processed.'
        })
        
        setTimeout(() => {
          showSuccessMessage.value = false
        }, 6000)
      }
    }, 6000) 
    
  } catch (error) {
    isSubmitting.value = false
    console.error('Error submitting review:', error)
    
    emit('showToast', {
      type: 'error',
      title: 'Submission Failed',
      message: 'Could not submit your review. Please try again.'
    })
  }
}

const getFlaggedCategories = (review) => {
  if (!review) return []
  
  if (review.flagged_categories && Array.isArray(review.flagged_categories)) {
    return review.flagged_categories
  }
  
  if (review.moderation_result?.categories) {
    return Object.entries(review.moderation_result.categories)
      .filter(([category, isActive]) => isActive === true)
      .map(([category]) => category)
  }
  
  return []
}

const getWarningClasses = () => {
  if (submissionResult.value && submissionResult.value.is_spam) {
    return 'bg-yellow-50 border border-yellow-200'
  } else if (submissionResult.value) {
    return 'bg-red-50 border border-red-200'
  }
  return ''
}

const getWarningTextClass = () => {
  if (submissionResult.value && submissionResult.value.is_spam) {
    return 'text-yellow-800'
  } else if (submissionResult.value) {
    return 'text-red-800'
  }
  return ''
}

const getWarningTitle = () => {
  if (submissionResult.value && submissionResult.value.is_spam) {
    return 'Review Detected as Spam'
  } else if (submissionResult.value) {
    return 'Review Contains Harmful Content'
  }
  return ''
}

const getWarningMessage = () => {
  if (submissionResult.value && submissionResult.value.is_spam) {
    return `Your review was flagged as spam (${(submissionResult.value.spam_confidence * 100).toFixed(1)}% confidence) and won't be shown publicly.`
  } else if (submissionResult.value) {
    return 'Your review was flagged for inappropriate content and won\'t be shown publicly.'
  }
  return ''
}
</script> 