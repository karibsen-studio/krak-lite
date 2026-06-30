<script setup lang="ts">
const { track, flush } = useKrakLite()

const testTrack = () => {
  track('test_event', {
    foo: 'bar',
  })
}

const testFlush = () => {
  void flush()
}
</script>

<template>
  <div class="flex gap-3.5">
    <!-- Imperative API -->
    <button
      class="relative cursor-pointer overflow-hidden rounded-md border
    border-neutral-950 bg-neutral-900 px-3 py-1.5 text-neutral-100
    shadow-md inset-shadow-2xs inset-shadow-neutral-600 transition-all
    before:absolute before:inset-0 before:bg-linear-to-b
    before:from-white/20 before:to-transparent hover:bg-neutral-800
    active:bg-neutral-950 active:shadow-none
    active:inset-shadow-neutral-800"
      @click="testTrack"
    >
      Track event
    </button>

    <button
      class="relative cursor-pointer overflow-hidden rounded-md border
    border-neutral-950 bg-neutral-900 px-3 py-1.5 text-neutral-100
    shadow-md inset-shadow-2xs inset-shadow-neutral-600 transition-all
    before:absolute before:inset-0 before:bg-linear-to-b
    before:from-white/20 before:to-transparent hover:bg-neutral-800
    active:bg-neutral-950 active:shadow-none
    active:inset-shadow-neutral-800"
      @click="testFlush"
    >
      Flush
    </button>

    <!-- Declarative auto-capture via data-krak-* attributes -->
    <button
      class="relative cursor-pointer overflow-hidden rounded-md border
    border-neutral-950 bg-neutral-900 px-3 py-1.5 text-neutral-100
    shadow-md inset-shadow-2xs inset-shadow-neutral-600 transition-all
    before:absolute before:inset-0 before:bg-linear-to-b
    before:from-white/20 before:to-transparent hover:bg-neutral-800
    active:bg-neutral-950 active:shadow-none
    active:inset-shadow-neutral-800"
      data-krak-action="cc"
      data-krak-data-plan="pro"
      data-krak-data-price="29"
      data-krak-immediate
    >
      Subscribe (auto-captured)
    </button>
  </div>
</template>
