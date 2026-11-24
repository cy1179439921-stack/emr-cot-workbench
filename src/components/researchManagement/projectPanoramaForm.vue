<template>
  <div class="project-panorama-form-container">
    <commonFormTitle :curEditRow="curEditRow" title="全景" :mode="mode" menu="panorama" @handleBack="handleBack"/>
    <div class="main-container">
      <div class="tabsDiv">
        <ul>
          <template v-for="item in tabs" :key="item.value">
            <li :class="{'active': activeTab.value === item.value}" @click="handleClickTab(item)" v-if="item.show">
              <div>{{item.label}}</div>
              <div class="bottomLine" ></div>
            </li>
          </template>
        </ul>
      </div>
      <div class="panorama-list">
        <component :is="compUrl" mode="view" :activeTab="activeTab" :curEditRow="curEditRow" :businessType="businessType" page="projectPanoramaForm" v-if="activeTab.relNum > 0"></component>
        <div class="empty-container" v-else>
          <emptyMedicalRecord :loading="loading"></emptyMedicalRecord>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ProjectPanoramaForm',
  inheritAttrs: false
})
import { ref, shallowRef, defineAsyncComponent, onMounted } from 'vue'
import commonFormTitle from '@/components/researchManagement/commonFormTitle.vue'
import { getProjectPanoramaList } from '@/api/api_scientific.js'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
const mode = ref('view')
const emits = defineEmits(['handleBack'])
const props = defineProps({
  curEditRow: {
    type: Object,
    default: () => ({})
  }
})
const loading = ref(false)
const compUrl = shallowRef(null)
const businessType = ref(1)
const components = {
  projectInitiationForm: () => import('@/components/researchManagement/projectInitiationForm.vue'),
  projectResearchPanorama: () => import('@/components/researchManagement/projectResearchPanorama.vue'),
  projectChangePanorama: () => import('@/components/researchManagement/projectChangePanorama.vue'),
  projectMidCheckForm: () => import('@/components/researchManagement/projectMidCheckForm.vue'),
  projectConclusionForm: () => import('@/components/researchManagement/projectConclusionForm.vue'),
  paperManageFormPanorama: () => import('@/components/researchManagement/paperManageFormPanorama.vue'),
  workManageFormPanorama: () => import('@/components/researchManagement/workManageFormPanorama.vue'),
  patentFormPanorama: () => import('@/components/researchManagement/patentFormPanorama.vue'),
  awardFormPanorama: () => import('@/components/researchManagement/awardFormPanorama.vue')
}
const tabs = ref([
  {
    label: '项目立项',
    value: 'projectInitiationForm',
    businessType: 1,
    show: true,
    relNum: 1
  },
  {
    label: '项目研究',
    value: 'projectResearchPanorama',
    businessType: 2,
    show: true,
    relNum: 0
  },
  {
    label: '项目变更',
    value: 'projectChangePanorama',
    businessType: 3,
    show: true,
    relNum: 0
  },
  {
    label: '项目中检',
    value: 'projectMidCheckForm',
    businessType: 4,
    show: true,
    relNum: 0
  },
  {
    label: '项目结题',
    value: 'projectConclusionForm',
    businessType: 5,
    show: true,
    relNum: 0
  },
  {
    label: '相关论文',
    value: 'paperManageFormPanorama',
    businessType: 6,
    show: true,
    relNum: 0
  },
  {
    label: '相关著作',
    value: 'workManageFormPanorama',
    businessType: 7,
    show: true,
    relNum: 0
  },
  {
    label: '相关专利',
    value: 'patentFormPanorama',
    businessType: 8,
    show: true,
    relNum: 0
  },
  {
    label: '相关获奖',
    value: 'awardFormPanorama',
    businessType: 9,
    show: true,
    relNum: 0
  }
])
const activeTab = ref({
  label: '项目立项',
  value: 'projectInitiationForm',
  businessType: 1,
  show: true,
  relNum: 1
})
onMounted(async () => {
  handleClickTab(tabs.value[0])
})
const handleClickTab = async (tab) => {
  const { code, data } = await getProjectPanoramaList({ id: props.curEditRow.id })
  if (code === 10000) {
    tabs.value[1].relNum = data[0].relNum
    tabs.value[2].relNum = data[1].relNum
    tabs.value[3].relNum = data[2].relNum
    tabs.value[4].relNum = data[3].relNum
    tabs.value[5].relNum = data[4].relNum
    tabs.value[6].relNum = data[5].relNum
    tabs.value[7].relNum = data[6].relNum
    tabs.value[8].relNum = data[7].relNum
  }
  activeTab.value = tab
  compUrl.value = defineAsyncComponent(components[activeTab.value.value])
  businessType.value = tabs.value.find(item => item.value === activeTab.value.value).businessType
}
// 返回
const handleBack = () => {
  emits('handleBack')
}
</script>
<style scoped lang="scss">
.project-panorama-form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .main-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 0;
    padding: 16px;
    .tabsDiv {
      display: flex;
      box-sizing: border-box;
      width: 100%;
      height: 58px;
      padding-left: 23px;
      padding-top: 18px;
      border-radius: 8px;
      background-color: var(--theme-card);
      ul {
        display: flex;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        font-size: 16px;
        li {
          display: flex;
          position: relative;
          flex-direction: column;
          align-items: center;
          margin-right: 32px;
          cursor: pointer;
          div:nth-child(1) {
            display: flex;
            align-items: center;
            height: 23px;
            font-weight: 400;
            font-size: 16px;
            color: var(--theme-text-2);
          }
          .bottomLine {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 3px;
            background-color: var(--theme-card);
          }
          &.active {
            div:nth-child(1) {
              font-weight: 500;
              font-size: 16px;
              color: var(--theme-primary);
            }
            .bottomLine {
              background-color: var(--theme-primary);
            }
          }
        }
      }
    }
    :deep(.panorama-list) {
      display: flex;
      position: relative;
      flex: 1;
      height: 0;
      margin-top: 16px;
      .common-form-title,
      .goback-btn {
        display: none;
      }
      .main-frame {
        padding: 0;
      }
      .empty-container {
        flex: 1;
        border-radius: 8px;
        background-color: var(--theme-card);
      }
    }
  }
}
</style>
