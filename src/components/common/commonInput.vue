<template>
  <el-input
    :prefix-icon="search">
  </el-input>
</template>
<script setup>
import { h } from 'vue'
const search = () => h('i', {
  class: 'iconfont icon-sousuo-1',
  style: {
    fontSize: `${12 / 14}rem`
  }
})

</script>
