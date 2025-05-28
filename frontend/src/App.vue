<template>
    <div class="app-container">
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
// No additional setup needed
</script>

<style>
:root {
    /* Colors */
    --color-background: #0d1117;
    --color-text: #2c3e50;
    --color-primary: #0070f3;
    --color-danger: #dc3545;
    --color-success: #28a745;
    --color-warning: #ffc107;

    /* Typography */
    --font-family-base: Avenir, Helvetica, Arial, sans-serif;

    /* Spacing */
    --spacing-unit: 1rem;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);
}

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
