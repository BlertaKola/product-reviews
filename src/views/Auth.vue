<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-tabs">
        <button 
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button 
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>

      <form @submit.prevent="submitForm" class="auth-form">
        <h2>{{ activeTab === 'login' ? 'Login' : 'Register' }}</h2>
        
        <div class="form-group">
          <label for="username">Username:</label>
          <input 
            type="text" 
            id="username"
            v-model="formData.username" 
            required 
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            type="password" 
            id="password"
            v-model="formData.password" 
            required 
          />
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Processing...' : (activeTab === 'login' ? 'Login' : 'Register') }}
        </button>
        
        <div v-if="error" class="error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'

const router = useRouter()
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
    
    if (isSuperuser) {
      router.push('/admin-dashboard')
    } else {
      router.push('/reviews')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Authentication failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
}

.auth-tabs button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-tabs button:first-child {
  border-radius: 4px 0 0 4px;
}

.auth-tabs button:last-child {
  border-radius: 0 4px 4px 0;
}

.auth-tabs button.active {
  background: #007bff;
  color: white;
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  background: #0056b3;
}

button[type="submit"]:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f8d7da;
  border-radius: 4px;
}
</style> 