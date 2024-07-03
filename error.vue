<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="min-w-[500px] text-center">
            <h1 class="text-[150px] leading-[110px] font-bold gradient-text mb-0">{{ error.statusCode }}</h1>
            <h5 class="text-[80px] font-bold text-white mb-6">Page not found</h5>
            <nuxt-link to="/" class="bg-blueLight text-white rounded py-2 px-6 border border-blueLight hover:bg-blueDark hover:border-blueDark">Go back home</nuxt-link>
            </div>
        </div>
  </template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})
</script>

