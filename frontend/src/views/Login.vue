<template>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const selectedEnv = ref('');
const error = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    // Here you would typically make an API call to your backend
    // For now, we'll just simulate a login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store the selected environment in localStorage
    localStorage.setItem('environment', selectedEnv.value);
    
    // Redirect to dashboard or home page
    router.push('/dashboard');
  } catch (err) {
    error.value = 'Invalid credentials. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>

</style> 