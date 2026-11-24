<template>
  <div class="nest-container">
    <h2 class="title" :class="{'active':isTitle}" @click="activeDargComponent(data,true)" :style="data.style">{{data.title}}</h2>
    <el-scrollbar height="100%">
      <div class="drag">
        <Nested :tasks="data.data" asAWhole="true" group="people" :preview="true" :componentsObj="componentsObj" :activeComponent="activeKey" @activeDargComponent="activeDargComponent" @handlerComponent="handlerComponent"/>
      </div>
    </el-scrollbar>
    <el-empty :image-size="200" :image="emptyImg" v-if="data.data.length === 0" description="从右侧拖入组件开始编辑表单内容" class="postion-center"/>
  </div>
</template>
<script setup>
import { removeByField, uuidHash } from '@/utils/utils'
import { toRefs, ref, computed } from 'vue'
import emptyImg from '@/assets/emptyForm.png'
import Nested from '@/components/draggable/nested.vue'
import _ from 'lodash'
const props = defineProps(['data', 'componentsObj'])
const { data } = toRefs(props)
// // 收集所有组件
// const componentsObj = {}
// // 创建一个上下文，导入指定文件夹内的所有Vue文件
// const files = import.meta.glob('./viewComponents/*.vue')

// Object.keys(files).forEach(async key => {
//   const componentConfig = await files[key]()
//   const componentName = key.split('/').pop().replace(/\.\w+$/, '')
//   componentsObj[componentName] = componentConfig.default || componentConfig
// })
const emit = defineEmits(['activeDargComponent', 'delRelation'])

const isTitle = ref(false)
// 选中态
const activeComponent = ref(null)
const activeDargComponent = (el, type = false) => {
  emit('activeDargComponent', el)
  activeComponent.value = el
  isTitle.value = type
}
const activeKey = computed(() => {
  return activeComponent.value?.key || null
})

// 操作栏
const handlerComponent = (el, type) => {
  console.log(el, type)
  // 复制组件
  const newData = _.cloneDeep(el)
  switch (type) {
    case 'copy':
      newData.key = uuidHash()
      data.value.data.push(newData)
      break
    case 'delete':
      removeByField(data.value.data, 'key', el.key)
      emit('delRelation', el.key)
      activeDargComponent(data.value, true)
      break
    default:
      break
  }
}
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
    // overflow-y: auto;
    height: 100%;
    min-height: calc(100vh - 156px);
    >.dragArea {
      display: block !important;
      // overflow: hidden;
      // overflow-y: auto;
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
