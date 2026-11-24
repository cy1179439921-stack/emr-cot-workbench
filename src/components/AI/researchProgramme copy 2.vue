<template>
  <div class="programme">
    <AiEditorRenderer />
  </div>
</template>

<script setup>
import AiEditorRenderer from '@/components/AI/AiEditorRenderer.vue'
</script>
<style scoped lang="scss">
.programme {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}
</style>
