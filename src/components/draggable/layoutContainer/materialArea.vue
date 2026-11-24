<template>
  <el-scrollbar class="pd-6">
    <VueDraggableNext :list="containerList" :group="{ name: 'people', pull: 'clone', put: false }" :sort="false" :clone="cloneData" class="flex-list" :move="onMove">
      <div class="list-group-item" v-for="element in containerList" :key="element.name">
        <i :class="['iconfont',element.icon]"></i>
        <span>{{ element.name }}</span>
      </div>
    </VueDraggableNext>
  </el-scrollbar>
</template>
<script setup>
import { containerList } from './viewComponents/config'
import { VueDraggableNext } from 'vue-draggable-next'
import { cloneDeep } from 'lodash'
import { uuidHash } from '@/utils/utils'
// const collapseList = [
//   {
//     title: '布局区域',
//     list: layoutContainerList
//   }, {
//     title: '基础区域',
//     list: basicsContainerList
//   }, {
//     title: '表单区域',
//     list: formContainerList
//   }, {
//     title: '高级区域',
//     list: advancedContainerList
//   }]

// const onMove = (event) => {
//   console.log(event, 'onMove')
// }
// const onStart = (event) => {
//   console.log(event, 'onStart')
// }
// const onEnd = (event) => {
//   console.log(event, 'onEnd')
// }
const cloneData = (event) => {
  console.log(event)
  const data = cloneDeep(event)

  if (event.id === 100) {
    data.children.push({
      id: 101,
      key: uuidHash(),
      name: '布局容器',
      type: 'LayoutContainer',
      children: [],
      style: {}
    })
    data.children.push({
      id: 101,
      key: uuidHash(),
      name: '布局容器',
      type: 'LayoutContainer',
      children: [],
      style: {}
    })
  }

  data.key = uuidHash()
  return data
}

// 拖动触发
const onMove = (e) => {
  const { to } = e
  // // 获取目标的类名，判断是否为容器
  const classNameList = to.className.split(' ')
  const toColContainer = classNameList.includes('flex')
  if (toColContainer) {
    return false
  }
  return true
}
</script>
<style lang="scss" scoped>
  .pd-6 {
    box-sizing: border-box;
    padding: 6px;
  }
  .flex-list {
    display: flex;
    flex-wrap: wrap;
  }
  .list-group-item {
    display: flex;
    align-items: center;
    width: 100%;
    height: 28px;
    margin-bottom: 20px;
    cursor: move;
    i {
      font-size: 32px;
    }
    span {
      font-weight: 500;
      font-size: 14px;
      color: #646464;
    }
  }
  .ghost {
    overflow: hidden;
    z-index: 9999;
    width: 100%;
    height: 2px !important;
    outline: 0 !important;
    background-color: #2a83ea !important;
    div {
      display: none;
    }
  }
</style>
