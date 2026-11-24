<!-- FileIcon.vue -->
<template>
  <div class="file-icon flexCenter" :class="[type, status]">
    <img v-if="icon" :src="icon" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: String,
  type: String
})

const icon = computed(() => {
  if (!props.type) return ''
  const isSuccess = props.status === 'success'
  return new URL(
    `/src/assets/file-${props.type}${isSuccess ? '' : '2'}.png`,
    import.meta.url
  ).href
})
</script>

<style scoped lang="scss">
.file-icon {
  width: 27px;
  height: 27px;
  border-radius: 4px;
  img {
    width: 15px;
  }
  &.error {
    background: var(--theme-fill) !important;
  }
  &.uploading {
    background: var(--theme-fill) !important;
  }
  &.xlsx {
    background: rgba(54, 112, 248, 0.1);
  }
  &.xls {
    background: rgba(4, 162, 115, 0.1);
  }
  &.csv {
    background: rgba(255, 78, 78, 0.1);
  }
}
</style>
