<script setup lang="ts">
definePageMeta({
  krakLite: { pageView: false },
})
</script>

<template>
  <div>
    <h1>Hello</h1>
    <p>This page opts out of automatic page-view tracking via <code>definePageMeta</code>.</p>
    <div class="mt-10">
      <NuxtLink
        class="relative cursor-pointer overflow-hidden rounded-md border
    border-neutral-950 bg-neutral-900 px-3 py-1.5 text-neutral-100
    shadow-md inset-shadow-2xs inset-shadow-neutral-600 transition-all
    before:absolute before:inset-0 before:bg-linear-to-b
    before:from-white/20 before:to-transparent hover:bg-neutral-800
    active:bg-neutral-950 active:shadow-none
    active:inset-shadow-neutral-800"
        to="/"
      >Back home
      </NuxtLink>
    </div>
  </div>
</template>
