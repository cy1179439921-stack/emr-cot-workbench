<template>
  <el-date-picker
    :style="{width: pxToRem(226),height: pxToRem(32)}"
    :prefix-icon="customPrefix"
    range-separator="-"
    start-placeholder="开始时间"
    end-placeholder="结束时间"
    value-format="YYYY-MM-DD"
  />
</template>
<script setup>
import { h, shallowRef } from 'vue'
const customPrefix = shallowRef({
  render() {
    return h('i',
      {
        class: 'iconfont icon-xialakuang-riqi customDatePickerIcon'
      })
  }
})
</script>
<style lang="scss" scoped>
</style>
