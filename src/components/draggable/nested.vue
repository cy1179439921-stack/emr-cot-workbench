<template>
  <VueDraggableNext ghostClass="ghost" :class="{'flex':isRoot}" animation="1000" handle=".sort" :list="tasks" group="people" class="dragArea" :move="onMove">
    <div v-for="el in tasks" :key="el.key" @click.stop="activeDargComponent(el)" class="relative" :style="el.style" :class="{ 'active': activeComponent === el.key}">
      <!-- <el-tooltip :offset="-42" :teleported="false" content="Bottom center" effect="light" placement="top-end" :visible="activeComponent === el.key && el.id !== 101"> -->
      <nested-draggable :tasks="el.children || []" :isRoot="el.id === 100" :preview="preview" v-if="el.children" class="bg-gray-100 pl-5" :componentsObj="componentsObj" :activeComponent="activeComponent" @activeDargComponent="activeDargComponent" @handlerComponent="handlerComponent"/>
      <component :is="componentsObj[el.type]" v-else :data="el" class="next-draggable" :preview="preview" />
      <!-- <template #content> -->
      <div class="handler-btn" v-if="activeComponent === el.key && el.id !== 101">
        <i class="iconfont icon-yidong sort" v-if="el.id !== 101"></i>
        <i class="iconfont icon-fuzhi" v-if="el.id !== 100" @click.stop="handlerComponent(el,'copy')"></i>
        <i class="iconfont icon-shanchu" @click.stop="handlerComponent(el,'delete')"></i>
      </div>
      <!-- </template>
      </el-tooltip> -->
    </div>
  </VueDraggableNext>
</template>
<script setup>
import { VueDraggableNext } from 'vue-draggable-next'
import { toRefs, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
// import _ from 'lodash'
defineOptions({
  name: 'nested-draggable',
  inheritAttrs: false
})

const emit = defineEmits(['activeDargComponent', 'handlerComponent'])

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  preview: {
    type: Boolean,
    default: false
  },
  componentsObj: {
    type: Object
  },
  style: {
    type: Object
  },
  activeComponent: null,
  isRoot: {
    type: Boolean,
    default: false
  }
})
const { tasks, style, isRoot } = toRefs(props)

const activeDargComponent = (el) => {
  emit('activeDargComponent', el)
}

const handlerComponent = (el, type) => {
  if (type === 'delete' && el.id === 100) {
    ElMessageBox.confirm('确认删除此两栏布局容器吗？删除容器后内部组件将被同步删除。', '删除两栏布局容器', {
      confirmButtonText: '确 认',
      cancelButtonText: '取 消',
      type: 'warning'
    }).then(() => {
      emit('handlerComponent', el, type)
    })
  } else {
    emit('handlerComponent', el, type)
  }
}

const justifyContent = computed(() => {
  return style.value?.justifyContent || 'none'
})

// 拖动触发
const onMove = (e) => {
  const { to } = e
  console.log(to)
  // // 获取目标的类名，判断是否为容器
  const classNameList = to.className.split(' ')
  const toColContainer = classNameList.includes('flex')
  if (toColContainer) {
    return false
  }
  return true
}

</script>
<style scoped lang="scss">
.flex {
  display: flex;
  flex-wrap: nowrap;
  >div {
    margin: 0 !important;
  }
}
.pl-5 {
  box-sizing: border-box;
  padding: 5px;
}
.bg-gray-100 {
  background-color: var(--theme-fill);
}
.dragArea {
  // display: flex;
  // flex-wrap: wrap;
  justify-content: v-bind(justifyContent);
  box-sizing: border-box;
  min-height: 50px;
  padding: 5px;
  outline: 1px dashed;
  .active {
    outline: 2px solid var(--el-color-primary);
  }
  .relative {
    position: relative;
    flex: 1;
    width: 100%;
    margin: 5px 0;
    cursor: pointer;
    :deep(.handler-btn) {
      display: flex;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 999;
      align-items: center;
      box-sizing: border-box;
      height: 40px;
      border-radius: 8px 8px 8px 8px;
      background: var(--theme-card);
      box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.16);
      opacity: 1;
      .iconfont {
        width: 50%;
        margin: 0 6px;
        cursor: pointer;
        text-align: center;
        font-size: 34px;
        &:focus {
          outline: none;
        }
      }
      .icon-shanchu {
        color: #f98181;
      }
    }
  }
}
.ghost {
  overflow: hidden;
  z-index: 9999;
  height: 2px !important;
  outline: 0 !important;
  background-color: #2a83ea !important;
}
:deep(.el-popper) {
  padding: 0;
  .el-popper__arrow {
    display: none;
  }
}
</style>
