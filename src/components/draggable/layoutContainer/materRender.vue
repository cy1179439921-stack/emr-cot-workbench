<template>
  <div class="nest-container">
    <h2 class="title" :style="data.style">{{data.title}}</h2>
    <el-scrollbar>
      <div class="drag">
        <NestedRender :tasks="data.data" asAWhole="true" :isDisable="isDisable" group="people" :formData="formData" :preview="preview" :isEdit="isEdit" :componentsObj="componentsObj"/>
      </div>
    </el-scrollbar>
  </div>
</template>
<script setup>
import { toRefs } from 'vue'
import NestedRender from '@/components/draggable/nestedRender.vue'
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      title: 'title',
      data: [],
      style: {}
    })
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  preview: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: true
  },
  componentsObj: {
    type: Object,
    default: () => ({})
  },
  isDisable: {
    type: Boolean,
    default: false
  }
})
const { data, formData } = toRefs(props)

// // 收集所有组件
// const componentsObj = {}
// // 创建一个上下文，导入指定文件夹内的所有Vue文件
// const files = import.meta.glob('./viewComponents/*.vue')

// Object.keys(files).forEach(async key => {
//   const componentConfig = await files[key]()
//   const componentName = key.split('/').pop().replace(/\.\w+$/, '')
//   componentsObj[componentName] = componentConfig.default || componentConfig
// })
</script>
<style lang="scss" scoped>
.nest-container {
  display: flex;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  height: 100%;
  .title {
    box-sizing: border-box;
    margin: 0;
    cursor: pointer;
    line-height: 56px;
    text-align: center;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
  }
  .active {
    border: 2px solid var(--el-color-primary);
    background: var(--theme-primary-soft);
  }
  .drag {
    display: flex;
    overflow-y: auto;
    height: 100%;
    >.dragArea {
      display: block !important;
      overflow: hidden;
      overflow-y: auto;
      flex: 1;
      box-sizing: border-box;
      width: 100%;
      padding: 0 20px;
      outline: 0 !important;
    }
  }
  .postion-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
<style src="./common.scss"></style>
