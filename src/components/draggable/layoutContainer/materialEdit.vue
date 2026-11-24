<template>
  <component :is="componentsObj[isTitle ? 'title' :activeType]" :data="activeComponent" :key="activeComponent?.key || Math.random()" :activeTab="activeTab" :dataSource="dataSource"/>
</template>
<script setup>
import { toRefs, computed, watch, ref } from 'vue'
const props = defineProps(['activeComponent', 'dataSource'])
const { activeComponent, activeTab } = toRefs(props)
const isTitle = ref(false)
const activeType = computed(() => {
  return activeComponent.value?.type || null
})

watch(activeComponent, (val) => {
  isTitle.value = ('title' in val)
})

// 收集所有组件
const componentsObj = {}
// 创建一个上下文，导入指定文件夹内的所有Vue文件
const files = import.meta.glob('./editComponents/*.vue')

Object.keys(files).forEach(async key => {
  const componentConfig = await files[key]()
  const componentName = key.split('/').pop().replace(/\.\w+$/, '')
  componentsObj[componentName] = componentConfig.default || componentConfig
})
</script>
<style lang="scss" scoped>
:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
