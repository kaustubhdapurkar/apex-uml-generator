<template>
  <div class="login-container">
    <div class="columns is-centered">
      <div class="column is-5-tablet is-4-desktop is-3-widescreen">
        <div class="box mt-6">
          <h1 class="title has-text-centered">Login</h1>
          
          <form @submit.prevent="handleLogin">
            <!-- Environment Selection -->
            <div class="field">
              <label class="label">Organization Type</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="selectedEnv" required>
                    <option value="">Select environment</option>
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Email Field -->
            <div class="field">
              <label class="label">Email</label>
              <div class="control has-icons-left">
                <input 
                  class="input" 
                  type="email" 
                  v-model="email" 
                  placeholder="Enter your email"
                  required
                >
                <span class="icon is-small is-left">
                  <i class="fas fa-envelope"></i>
                </span>
              </div>
            </div>

            <!-- Password Field -->
            <div class="field">
              <label class="label">Password</label>
              <div class="control has-icons-left">
                <input 
                  class="input" 
                  type="password" 
                  v-model="password" 
                  placeholder="Enter your password"
                  required
                >
                <span class="icon is-small is-left">
                  <i class="fas fa-lock"></i>
                </span>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="notification is-danger is-light">
              {{ error }}
            </div>

            <!-- Login Button -->
            <div class="field">
              <div class="control">
                <button 
                  class="button is-primary is-fullwidth" 
                  :class="{ 'is-loading': isLoading }"
                  type="submit"
                >
                  Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'LoginView',
    setup() {
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

        return {
            email,
            password,
            selectedEnv,
            error,
            isLoading,
            handleLogin,
        };
    },
});
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
}

.box {
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
    margin-bottom: 2rem !important;
}

.field {
    margin-bottom: 1.5rem;
}

.notification {
    margin-bottom: 1.5rem;
}
</style> 