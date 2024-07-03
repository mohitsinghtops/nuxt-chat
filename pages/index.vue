<template>
  <div>
    <chat-component />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
    layout: 'auth',
    middleware: ['auth'],
});
useHead({
  title: "Chat App",
});
</script>

<style></style>
