<template>
  <div class="cot-module-header">
    <div class="header-left">
      <span class="module-badge">{{ badge }}</span>
      <h3 class="module-title">{{ title }}</h3>
    </div>
    <div class="header-right">
      <span class="anchor-time">保存时间：{{ anchorTime || '-' }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  badge: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  anchorTime: {
    type: String,
    default: ''
  }
})
</script>
<style lang="scss" scoped>
@use './cot-common.scss';
</style>
