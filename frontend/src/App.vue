<template>
    <div class="app-container">
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
// No additional setup needed
</script>

<style>
@import './assets/variables.css';

html,
body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
}

.app-container {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: var(--font-family-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--color-text);
}
</style>
