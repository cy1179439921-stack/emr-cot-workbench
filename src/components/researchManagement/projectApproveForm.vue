<template>
  <div class="projectApproveForm" v-bind="$attrs">
    <commonFormApproveTitle mode="approve" :curEditRow="curEditRow" @handleBack="handleBack"/>
    <div class="approve-comtainer">
      <component :is="compUrl" :mode="mode" :businessType="curEditRow.businessType" :curEditRow="curEditRow" page="projectApproveForm" @handleBack="handleBack"></component>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ProjectApproveForm',
  inheritAttrs: false
})
import commonFormApproveTitle from '@/components/researchManagement/commonFormApproveTitle.vue'
import { shallowRef, defineAsyncComponent } from 'vue'
const emits = defineEmits(['handleBack'])
const props = defineProps({
  mode: {
    type: String,
    default: 'approve'
  },
  curEditRow: {
    type: Object,
    default: () => ({})
  }
})
const compUrl = shallowRef(null)
const components = {
  projectInitiationForm: () => import('@/components/researchManagement/projectInitiationForm.vue'),
  projectResearchForm: () => import('@/components/researchManagement/projectResearchForm.vue'),
  projectChangeForm: () => import('@/components/researchManagement/projectChangeForm.vue'),
  projectMidCheckForm: () => import('@/components/researchManagement/projectMidCheckForm.vue'),
  projectConclusionForm: () => import('@/components/researchManagement/projectConclusionForm.vue'),
  paperManageForm: () => import('@/components/researchManagement/paperManageForm.vue'),
  workManageForm: () => import('@/components/researchManagement/workManageForm.vue'),
  patentForm: () => import('@/components/researchManagement/patentForm.vue'),
  awardForm: () => import('@/components/researchManagement/awardForm.vue')
}
const comOptions = {
  1: 'projectInitiationForm',
  2: 'projectResearchForm',
  3: 'projectChangeForm',
  4: 'projectMidCheckForm',
  5: 'projectConclusionForm',
  6: 'paperManageForm',
  7: 'workManageForm',
  8: 'patentForm',
  9: 'awardForm'
}
compUrl.value = defineAsyncComponent(components[comOptions[props.curEditRow.businessType]])
// 返回
const handleBack = () => {
  emits('handleBack')
}
</script>
<style scoped lang="scss">
.projectApproveForm {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  :deep(.approve-comtainer) {
    flex: 1;
    height: 0;
    padding: 16px;
    .common-form-title,
    .goback-btn {
      display: none;
    }
    .main-frame {
      padding: 0;
    }
  }
}
</style>
