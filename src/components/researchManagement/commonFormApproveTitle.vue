<template>
  <div class="common-form-title">
    <commonGoBack @handleBack="handleBack">
      <div class="title-info">
        <div class="splitLine"></div>
        <div class="item">提交人：
          {{ curEditRow.submitPersonName }}（{{ curEditRow.committerDepartment }}）
        </div>
        <div class="item">提交日期：{{curEditRow?.submitTime || '-'}}</div>
      </div>
      <el-button type="primary" @click="viewProjectInfo" v-if="![1,6,7,8,9].includes(curEditRow.businessType)">查看项目信息</el-button>
    </commonGoBack>
    <projectInfoDetail title="项目信息" v-if="showNewProjectChange" mode="view" :businessType="1" v-model:addDialogShow="showNewProjectChange" :projectId="curEditRow.projectId" :curEditRow="curEditRow" @handle-close="showNewProjectChange = false" @handleBack="showNewProjectChange = false"/>
  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonFormApproveTitle',
  inheritAttrs: false
})
import commonGoBack from '@/components/common/commonGoBack.vue'
import projectInfoDetail from '@/components/researchManagement/newProjectChangeDialog.vue'
import { ref } from 'vue'
const emits = defineEmits(['handleBack'])
defineProps({
  curEditRow: {
    type: Object
  }
})
const handleBack = () => {
  emits('handleBack')
}
// 展示项目变更弹窗
const showNewProjectChange = ref(false)
// 查看项目信息
const viewProjectInfo = () => {
  showNewProjectChange.value = true
}
</script>
<style scoped lang="scss">
.common-form-title {
  display: flex;
  width: 100%;
  .title-info {
    display: flex;
    align-items: center;
    flex: 1;
    color: var(--theme-text);
    .splitLine {
      width: 1px;
      height: 16px;
      margin-left: 12px;
      margin-right: 12px;
      background-color: #cbcfdc;
    }
    .item {
      display: flex;
      align-items: center;
      margin-right: 32px;
    }
  }
}
</style>
