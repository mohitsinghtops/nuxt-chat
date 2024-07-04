<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="min-w-[600px] text-center">
            <h1 class="text-[210px] leading-[210px] font-bold gradient-text mb-0">{{ error?.statusCode }}</h1>
            <template v-if="error?.statusCode == 404">
                <h5 class="text-[80px] font-bold mb-0 capitalize text-stroke">Page Not Found!</h5>
                <p class="text-gray-300 text-lg mb-10">The page you are looking doesn't exist or has been removed.</p>
            </template>
            <template v-else>
                <h5 class="text-[80px] font-bold mb-0 capitalize text-stroke">Internal server down</h5>
                <p class="text-gray-300 text-lg mb-10">Some error occurred in our application. Please contact to administrator.</p>
            </template>
            <nuxt-link to="/"
                class="bg-blueLight text-white rounded py-3 px-6 border border-blueLight hover:bg-blueDark hover:border-blueDark">Go
                back home</nuxt-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

useHead({
    title: 'Error Page',
})

const props = defineProps({
    error: Object as () => NuxtError
})
</script>
