<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconClassName"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  iconName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  }
})
// 图标在 iconfont 中的名字
const iconClassName = computed(() => {
  return `#${props.iconName}`
})
// 给图标添加上类名
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`
  }
  return 'svg-icon'
})
</script>

<style lang="scss" scoped>
.svg-icon {
  position: relative;
  width: 1.5em;
  height: 1.5em;
  vertical-align: -2px;
  fill: currentColor;
  &:focus {
    outline: none;
  }
}
</style>
