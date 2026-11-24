<template>
  <div class="panorama-header">
    <div class="panorama-title">项目{{title}}</div>
    <div class="panorama-id">{{title}}ID：{{id}}<i class="iconfont icon-fuzhi1" @click="copy(id)"></i></div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'PanoramaTitle',
  inheritAttrs: false
})
import { copy } from '@/utils/utils'
defineProps({
  title: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  }
})
</script>
<style scoped lang="scss">
.panorama-header {
  box-sizing: border-box;
  height: 91px;
  margin-bottom: 16px;
  padding: 18px 24px;
  border-radius: 8px;
  background-color: var(--theme-card);
  .panorama-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-text);
  }
  .panorama-id {
    margin-top: 12px;
    color: var(--theme-text-2);
    i {
      margin-left: 10px;
      cursor: pointer;
      font-size: 14px;
      color: var(--theme-primary);
    }
  }
}
</style>
