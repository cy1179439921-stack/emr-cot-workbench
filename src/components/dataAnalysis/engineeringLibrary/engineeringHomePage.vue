<template>
  <div class="engineering-home-page">
    <allAnalysisMethodsTree
      :jumpData="jumpData"
      :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" :otherPermissions="otherPermissions"
      @handleNodeClick="handleNodeClick"
      @handleNodeClickPassive="handleNodeClickPassive"
      ref="leftTreeDom"
    />
    <div class="engineering-home-main">
      <dataView
        @handleHeader='handleNodeClick'
        :dataOperateId="dataOperateId"
        :engineeringInfo="engineeringInfo"
        ref="dataViewRef"
        v-if="currentNode?.type === 1"
      />
      <analysisView
        :jumpData="jumpData"
        @clearJumpData="clearJumpData"
        :dataOperateId="dataOperateId"
        :engineeringInfo="engineeringInfo"
        :currentNode="currentNode"
        :tabIndex="tabIndex"
        ref="analysisViewRef"
        v-if="currentNode?.type === 2"
      />
    </div>
    <component
      :is="compUrl"
      v-if="isShowMethods&&compUrl"
      @updateDataOperateId="handleChangeView"
      :titleObj="currentNode"
      :jumpData="jumpData"
      @clearJumpData="clearJumpData"
      @handleClose="handleClose"
      :engineeringInfo="{...engineeringInfo, dataOperateId: dataOperateId}"
    >
    </component>
  </div>
</template>
<script setup>
import { ref, shallowRef, watch } from 'vue'
import allAnalysisMethodsTree from '@/components/dataAnalysis/engineeringLibrary/allAnalysisMethodsTree.vue'
import dataView from '@/components/dataAnalysis/dataSetLibrary/components/dataView.vue'
import analysisView from '@/components/dataAnalysis/engineeringLibrary/analysisView.vue'
import { getOperateId } from '@/api/api_dataAnalysis.js'
const emits = defineEmits(['clearJumpData'])
defineOptions({
  name: 'EngineeringHomePage',
  inheritAttrs: false
})
const props = defineProps({
  engineeringInfo: {
    type: Object,
    required: true
  },
  tabIndex: {
    type: Number
  },
  jumpData: {
    type: Object
  },
  needCheckPermission: {
    type: Boolean,
    default: false
  },
  hadPermissionList: {
    type: Array,
    default: () => []
  },
  otherPermissions: {
    type: Array,
    default: () => []
  }
})

const dataViewRef = ref(null)
// 收集所有组件
const componentsObj = {}
// 创建一个上下文，导入指定文件夹内的所有Vue文件
const files = import.meta.glob('./dataSorting/*.vue')

Object.keys(files).forEach(async key => {
  const componentConfig = await files[key]()
  const componentName = key.split('/').pop().replace(/\.\w+$/, '')
  componentsObj[componentName] = componentConfig.default || componentConfig
})
const compUrl = shallowRef(null)
const currentNode = ref(null)
const isShowMethods = ref('')
const dataOperateId = ref('')
if (props.jumpData) {
  dataOperateId.value = props.jumpData?.pid
}
const analysisViewRef = ref(null)
// 主动点击树节点
const handleNodeClick = async (node) => {
  analysisViewRef.value?.closeLoading()
  if (!currentNode.value || currentNode?.value.name !== node.name) {
    currentNode.value = node
    // 数据整理部分
    const { code, data } = await getOperateId({
      projectId: props.engineeringInfo.id
    })
    if (code === 10000) {
      dataOperateId.value = data.dataOperateId
    }
    clearJumpData(null)
    if (node.type === 1) {
      isShowMethods.value = true
      compUrl.value = componentsObj[node.component]
      leftTreeDom.value.setTreeAcitve(node)
    }
  }
}
// 被动点击树节点
const handleNodeClickPassive = (node) => {
  currentNode.value = node
  // 数据整理部分
  if (node.type === 1) {
    compUrl.value = componentsObj[node.component]
  }
}
const leftTreeDom = ref(null)
const handleClose = async () => {
  compUrl.value = ''
  isShowMethods.value = ''
  leftTreeDom.value.checkedDefaultNode()
}
// eslint-disable-next-line no-unused-vars
const handleChangeView = (id) => {
  dataOperateId.value = id
}
const clearJumpData = (val) => {
  emits('clearJumpData', val)
}

const reloadData = () => {
  analysisViewRef.value?.reloadData()
}
watch(() => props.jumpData, (val) => {
  if (props.jumpData) {
    dataOperateId.value = props.jumpData?.pid
  }
})
defineExpose({
  reloadData
})
</script>
<style scoped lang="scss">
.engineering-home-page {
  display: flex;
  flex: 1;
  .engineering-home-main {
    display: flex;
    flex: 1;
    width: 0;
    margin-left: 16px;
  }
}
</style>
