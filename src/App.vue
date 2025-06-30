<script setup>
import { ref, provide } from 'vue'
import Toast from './components/Toast.vue'
import './style.css'

const toast = ref(null)


provide('toast', {
  showSuccess: (title, message, duration) => toast.value?.showSuccess(title, message, duration),
  showWarning: (title, message, duration) => toast.value?.showWarning(title, message, duration),
  showError: (title, message, duration) => toast.value?.showError(title, message, duration),
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
    <Toast ref="toast" />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
}

#app {
  min-height: 100vh;
}
</style>
