<template>
    <div>Success</div>
    <div>
        <button @click="handleClick" class="p-button p-component p-button-outlined">
            Retrieve Data
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

async function handleClick() {
    console.log('Button clicked!')
    const response = await fetch('http://localhost:3000/api/metadata/retrieve', {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        }
    });

    
}

onMounted(async () => {
    const response = await fetch('http://localhost:3000/api/retrieve', {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        }
    });
})
</script>
