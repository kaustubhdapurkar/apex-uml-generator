<template>
    <div class="apex-classes">
        <div class="container">
            <h1 class="title">Apex Classes</h1>
            <ApexClassSearch />
        </div>
    </div>
</template>

<script setup lang="ts">
import ApexClassSearch from '@/components/ApexClassSearch.vue';
</script>

<style lang="scss" scoped>
.apex-classes {
    padding: 2rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.title {
    margin-bottom: 2rem;
    color: var(--text-color);
}
</style>
