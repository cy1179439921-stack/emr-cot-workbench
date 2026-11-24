<template>
  <div class="header" v-bind="$attrs">
    <div class="goBack" @click="handleBack">
      <i class="iconfont icon-zuo"></i>
      <span>返回</span>
    </div>
    <!-- 预留插槽 -->
    <slot></slot>
  </div>
</template>
<script setup>
import router from '@/router'
defineOptions({
  name: 'CommonGoBack',
  inheritAttrs: false
})
const props = defineProps({
  upperLevel: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['handleBack'])
const handleBack = () => {
  if (props.upperLevel) {
    router.go(-1)
  } else {
    emits('handleBack')
  }
}
</script>
<style lang="scss" scoped>
  .header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 48px;
    min-height: 48px;
    padding: 0 16px 0 8px;
    border-radius: 0;
    background: var(--theme-card);
    .goBack {
      display: flex;
      align-items: center;
      height: 100%;
      cursor: pointer;
      .iconfont {
        display: block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        font-size: 32px;
        color: var(--theme-primary);
      }
      span {
        display: block;
        margin-left: -5px;
        line-height: 32px;
        font-weight: 400;
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }
  }
</style>
