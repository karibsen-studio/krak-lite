<script setup lang="ts">
const { track } = useKrakLite()

const buttonClick = () => {
  track("cl_navbar", {
    label: "hello"
  })
}
</script>

<template>
  <nav class="flex items-center gap-3.5 justify-start border-b-slate-100 border-b py-4.5 px-5.5">
    <NuxtLink to="/" class="flex-1">
     <img alt="krak-lite logo" class="size-10" src="/images/logo.svg"/>
    </NuxtLink>

    <div class="flex-2 flex justify-center gap-3.5 items-center">
      <NuxtLink to="/" class="px-2.5 py-1 rounded-md text-slate-900" active-class="bg-neutral-100">
        Home
      </NuxtLink>

      <NuxtLink to="about" class="px-2.5 py-1 rounded-md text-slate-900" active-class="bg-neutral-100">
        About
      </NuxtLink>
    </div>

    <div class="flex-1 flex justify-end">
      <button @click="buttonClick" class="relative cursor-pointer overflow-hidden rounded-md border
    border-neutral-950 bg-neutral-900 px-3 py-1.5 text-neutral-100
    shadow-md inset-shadow-2xs inset-shadow-neutral-600 transition-all
    before:absolute before:inset-0 before:bg-linear-to-b
    before:from-white/20 before:to-transparent hover:bg-neutral-800
    active:bg-neutral-950 active:shadow-none
    active:inset-shadow-neutral-800">
        Click here
      </button>
    </div>
  </nav>
  <div class="mt-10 flex justify-center items-center">
    <slot/>
  </div>
</template>
