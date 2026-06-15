<script setup lang="ts">
definePageMeta({
  krakLite: { pageView: false },
})
</script>

<template>
  <div>
    <h1>Hello</h1>
    <p>This page opts out of automatic page-view tracking via <code>definePageMeta</code>.</p>
    <NuxtLink to="/">Back home</NuxtLink>
  </div>
</template>
