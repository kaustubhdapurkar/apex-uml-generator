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

        const loginUrl = ref(selectedEnv.value);
        const redirectUri = `${process.env.VUE_APP_API_URL}/oauth2/callback`;

        const response = await fetch(`${process.env.VUE_APP_API_URL}/oauth2/clientid`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const clientId = data.clientId;
        const oauthUrl = `${loginUrl.value}/services/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
        window.location.href = oauthUrl;
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
