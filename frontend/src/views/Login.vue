<template>
    <div :class="$style.login">
        <div :class="$style.container">
            <h1 :class="$style.title">Login With Your Salesforce Org</h1>
            <form @submit.prevent="handleLogin" :class="$style.form">
                <div :class="$style.field">
                    <label for="environment" :class="$style.label">Environment</label>
                    <Dropdown
                        id="environment"
                        v-model="selectedEnv"
                        :options="environments"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Select Environment"
                        :class="$style.select"
                    />
                </div>

                <div v-if="error" :class="$style.error">
                    {{ error }}
                </div>

                <Button
                    type="submit"
                    label="Login"
                    :loading="isLoading"
                    :class="$style.button"
                />
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

const router = useRouter();
const selectedEnv = ref('');
const error = ref('');
const isLoading = ref(false);

const environments = [
    { name: 'Production', value: 'https://login.salesforce.com' },
    { name: 'Sandbox', value: 'https://test.salesforce.com' }
];

const handleLogin = async () => {
    if (!selectedEnv.value) {
        error.value = 'Please select an environment';
        return;
    }

    try {
        isLoading.value = true;
        error.value = '';

        const baseURL = selectedEnv.value;
        const authEndPoint = `${baseURL}/services/oauth2/authorize`;
        const frontEndUrl = process.env.VUE_APP_API_URL || 'http://localhost:8080/api';
        const redirectURI = encodeURIComponent(
            `${frontEndUrl}/oauth2/callback`,
        );
        const state = JSON.stringify({
            baseURL: baseURL,
            redirectURI: redirectURI,
        });

        //const backendApiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';
        const backendApiUrl = 'https://apex-uml-generator-api-production.up.railway.app/api';
        console.log('backendapiurl', backendApiUrl);
        const response = await fetch(`${backendApiUrl}/oauth2/clientid`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { clientId } = await response.json();
        const requestURL = `${authEndPoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectURI}&state=${state}&prompt=select_account`;
        window.location.href = requestURL;
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred during login';
        console.error('Login error:', err);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style lang="scss" module>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.login {
    @include flex-center;
    min-height: 100vh;
}

.container {
    @include card;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.title {
    @include heading-2;
    text-align: center;
    margin-bottom: map-get($spacing, 'large');
    color: map-get($colors, 'text');
}

.form {
    display: flex;
    flex-direction: column;
    gap: map-get($spacing, 'medium');
}

.field {
    display: flex;
    flex-direction: column;
    gap: map-get($spacing, 'small');
}

.label {
    @include text-sm;
    color: map-get($colors, 'text');
    font-weight: map-get($font-weights, 'medium');
}

.select {
    width: 100%;
}

.button {
    width: 100%;
}

.error {
    @include text-sm;
    padding: map-get($spacing, 'small');
    background-color: map-get($colors, 'danger');
    color: white;
    border-radius: 4px;
    text-align: center;
}
</style>
