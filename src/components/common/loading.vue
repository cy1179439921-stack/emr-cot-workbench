<template>
  <div class="loading">
    <div class="loader" :style="loaderStyle">
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#3080ff'
  },
  size: {
    type: Number,
    default: 16
  }
})

const loaderStyle = computed(() => ({
  '--loading-color': props.color,
  '--loading-size': props.size / 14 + 'rem'
}))
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  align-items: center;
}
.loader {
  box-sizing: border-box;
  width: var(--loading-size);
  height: var(--loading-size);
  border-radius: 50%;
  background:
    conic-gradient(
      transparent 10%,
      var(--loading-color)
    );
  mask:
    radial-gradient(
      farthest-side,
      transparent calc(100% - 2px),
      #000 0
    );
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
