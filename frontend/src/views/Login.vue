<template>
    <div :class="$style.login">
        <div :class="$style.container">
            <h1 :class="$style.title">Login With Your Salesforce Org</h1>
            <form @submit.prevent="handleLogin" :class="$style.form">
                <button
                    type="submit"
                    :class="[$style.button, { [$style.loading]: isLoading }]"
                >
                    Login
                </button>
            </form>
        </div>
    </div>
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
    let baseURL;
    baseURL = `https://login.salesforce.com`;
    let authEndPoint = `${baseURL}/services/oauth2/authorize`;
    let redirectURI = encodeURIComponent(
        `http://localhost:3000/api/oauth2/callback`,
    );
    let state = JSON.stringify({
        baseURL: baseURL,
        redirectURI: redirectURI,
    });
    console.log(state);
    let clientId = await fetch('http://localhost:3000/api/oauth2/clientid', {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }).then(data => data.clientId)
    .catch(error => {
        console.error('Error fetching client ID:', error);
        throw error;
    });
    console.log(JSON.stringify(clientId));
    let requestURL = `${authEndPoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectURI}&state=${state}&prompt=select_account`;
    console.log(requestURL);
    window.location.href = requestURL;
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

.control {
    position: relative;
}

.input,
.select {
    @include text-base;
    width: 100%;
    padding: map-get($spacing, 'small');
    border: 1px solid rgba(map-get($colors, 'text'), 0.2);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    color: map-get($colors, 'text');

    &:focus {
        outline: none;
        border-color: map-get($colors, 'primary');
    }
}

.button {
    @include text-base;
    width: 100%;
    padding: map-get($spacing, 'small');
    background-color: map-get($colors, 'primary');
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: map-get($font-weights, 'medium');

    &:hover {
        opacity: 0.9;
    }

    &.loading {
        opacity: 0.7;
        cursor: not-allowed;
    }
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
