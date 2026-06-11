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
  <div>
    <!-- Imperative API -->
    <button @click="testTrack">
      Track event
    </button>

    <button @click="testFlush">
      Flush
    </button>

    <!-- Declarative auto-capture via data-krak-* attributes -->
    <button
      data-krak-event="cta_click"
      data-krak-data-plan="pro"
      data-krak-data-price="29"
      data-krak-immediate
    >
      Subscribe (auto-captured)
    </button>
  </div>
</template>
