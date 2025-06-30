<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">AI Review Platform</h1>
        <p class="mt-2 text-gray-600">Submit and moderate product reviews with AI</p>
      </div>
      
     
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <!-- Tabs -->
        <div class="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            @click="activeTab = 'login'"
            :class="[
              'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
              activeTab === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Login
          </button>
          <button
            @click="activeTab = 'register'"
            :class="[
              'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Register
          </button>
        </div>
        
        
        <form @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              v-model="formData.username"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              v-model="formData.password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
          
          
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
          
          
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <svg
              v-if="loading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Create Account') }}</span>
          </button>
        </form>
      </div>
      
    
      <div class="text-center text-sm text-gray-600">
        <p>Secure authentication powered by JWT tokens</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'

const router = useRouter()
const toast = inject('toast')

const activeTab = ref('login')
const loading = ref(false)
const error = ref('')

const formData = reactive({
  username: '',
  password: ''
})

const checkIfSuperuser = async () => {
  try {
    await authAPI.checkAdmin()
    return true
  } catch (error) {
    return false
  }
}

const submitForm = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const apiCall = activeTab.value === 'login' ? authAPI.login : authAPI.register
    const response = await apiCall({
      username: formData.username,
      password: formData.password
    })
    
 
    const accessToken = response.data.access
    const refreshToken = response.data.refresh
    
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    
 
    const isSuperuser = await checkIfSuperuser()
    

    toast.showSuccess(
      activeTab.value === 'login' ? 'Welcome back!' : 'Account created!',
      `Redirecting to ${isSuperuser ? 'admin dashboard' : 'reviews'}...`
    )
    
  
    setTimeout(() => {
      if (isSuperuser) {
        router.push('/admin-dashboard')
      } else {
        router.push('/reviews')
      }
    }, 1000)
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Authentication failed'
    toast.showError(
      'Authentication Failed',
      error.value
    )
  } finally {
    loading.value = false
  }
}
</script> 