<template>
  <div class="engineering-library-main">
    <engineeringFrameHeader ref="engineeringFrameHeaderRef" :engineeringInfo="engineeringInfo" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" :otherPermissions="otherPermissions" @updateList="handleUpdateList" @updateName ="handleUpdateName" @handleClickTab="handleClickTab" @viewDataSet="(data)=> emits('viewDataSet', data)"/>
    <div class="main-body">
      <engineeringHomePage v-show="activeTab === 'engineeringHomePage'" :engineeringInfo="engineeringInfo" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" :otherPermissions="otherPermissions" :tabIndex="tabIndex" :jumpData="jumpData" @clearJumpData="clearJumpData" ref="engineeringHomePageRef"/><!-- 工程首页保持活动 -->
      <component :is="compUrl" v-if="activeTab !== 'engineeringHomePage'" :engineeringInfo="engineeringInfo" :tabIndex="tabIndex" @toCurrentNode="toCurrentNode" :jumpData="jumpData"></component>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'EngineeringFrame',
  inheritAttrs: false
})
import { ref, shallowRef, defineAsyncComponent, nextTick } from 'vue'
import engineeringFrameHeader from '@/components/dataAnalysis/engineeringLibrary/engineeringFrameHeader.vue'
import engineeringHomePage from '@/components/dataAnalysis/engineeringLibrary/engineeringHomePage.vue'
import { ElMessage } from 'element-plus'
const props = defineProps({
  engineeringInfo: {
    type: Object,
    required: true
  },
  tabIndex: {
    type: Number
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
const emits = defineEmits(['updateList', 'updateName', 'viewDataSet'])
const components = {
  // diagram: () => import('@/components/dataAnalysis/engineeringLibrary/diagram.vue'),
  operationLog: () => import('@/components/dataAnalysis/engineeringLibrary/operationLog.vue')
}
const compUrl = shallowRef(null)
const activeTab = ref('engineeringHomePage')
const engineeringHomePageRef = ref(null)
// 点击tab
const handleClickTab = async (tab) => {
  activeTab.value = tab
  if (tab !== 'engineeringHomePage') {
    compUrl.value = defineAsyncComponent(components[tab])
  } else {
    // 切换到工程首页，重新请求一下数据
    nextTick(() => {
      if (engineeringHomePageRef.value) {
        engineeringHomePageRef.value.reloadData()
      }
    })
  }
}
const handleUpdateList = () => {
  console.log('updateList2')
  emits('updateList')
}
const handleUpdateName = (name) => {
  console.log('updateName', name)
  emits('updateName', name)
}
const jumpData = ref(null)
const engineeringFrameHeaderRef = ref(null)
// 跳转节点
const toCurrentNode = (result) => {
  console.log('跳转总数据', result)
  const requiredPermissions = [
    '描述性分析', '差异性分析', '相关性分析', '回归分析', '生存分析',
    '时间序列模型', '空间分析', '传统机器学习', '人工神经网络'
  ]
  if (requiredPermissions.includes(result.bigGroup)) {
    // 数据分析部分
    // 判断props.hadPermissionList中是否包含该权限
    if (props.needCheckPermission && !props.hadPermissionList.includes(result.bigGroup)) {
      ElMessage.warning('暂无权限')
      return false
    }
  } else {
    // 数据整理
    if (props.needCheckPermission && !props.hadPermissionList.includes(result.name)) {
      ElMessage.warning('暂无权限')
      return false
    }
  }
  activeTab.value = 'engineeringHomePage'
  engineeringFrameHeaderRef.value.setTab('engineeringHomePage')
  jumpData.value = result
  console.log('inputConditions', JSON.parse(jumpData.value.params))
}
// 清空跳转数据
const clearJumpData = () => {
  jumpData.value = null
}
</script>
<style scoped lang="scss">
.engineering-library-main {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  padding: 16px;
  .main-body {
    display: flex;
    flex: 1;
    height: 0;
    margin-top: 16px;
  }
}
</style>
