<template>
  <div class="projectResearchPanorama">
    <template v-if="activeTab.relNum > 0">
      <commonFormLeftMenu ref="commonFormLeftMenuRef" :title="title" hrefIdPrefix="timePart" :renderInfo="formData" :containerRef="scrollContainer"></commonFormLeftMenu>
      <div class="section-container">
        <header class="big-header">{{title}}</header>
        <div class="timeline">
          <el-scrollbar ref="scrollbarRef">
            <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="'timePart' + index" :id="'timePart' + index">
              <commonRecordTimeLine/>
              <div class="timeline-right marginT24">
                <header class="header">
                  <div class="time-card">
                    <i class="iconfont icon-shijian-2"></i>
                    <span>{{item.commitTime || '-'}}</span>
                    <span class="operation-person">操作人：{{item.committerName || '-'}}（{{item.committerDepartment || '-'}}）</span>
                  </div>
                </header>
                <commonFormRender :renderInfo="fieldInfo" :formData="item"></commonFormRender>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </template>
    <template v-else>
      <emptyMedicalRecord :loading="loading"></emptyMedicalRecord>
    </template>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ProjectResearchPanorama',
  inheritAttrs: false
})
import { ref, onMounted } from 'vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import commonFormRender from '@/components/researchManagement/commonFormRender.vue'
import commonFormLeftMenu from '@/components/researchManagement/commonFormLeftMenu.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { getProjectResearchPanoramaDetail } from '@/api/api_scientific'
const props = defineProps({
  activeTab: {
    type: Object,
    default: () => ({})
  },
  curEditRow: {
    type: Object,
    default: () => ({})
  }
})
const scrollbarRef = ref(null)
const scrollContainer = ref(null)
const title = ref('项目研究')
const loading = ref(false)
const fieldInfo = [
  {
    label: '项目研究',
    component: 'ul-li',
    show: true,
    className: 'basicInfo',
    children: [
      {
        label: '研究ID',
        key: 'projectId',
        component: 'el-input',
        type: 'text',
        className: 'width25 last-line'
      }
    ]
  },
  {
    label: '基本信息',
    component: 'ul-li',
    show: true,
    className: 'basicInfo',
    children: [
      {
        label: '项目名称',
        key: 'projectName',
        component: 'el-input',
        type: 'text',
        className: 'width25 last-line',
        rules: [{
          required: true
        }]
      },
      {
        label: '项目编号',
        key: 'projectCode',
        component: 'el-input',
        type: 'text',
        className: 'width25 last-line',
        rules: [{
          required: true
        }]
      }
    ]
  },
  {
    label: '附件补充',
    component: 'el-upload',
    show: true,
    key: 'fileList',
    className: 'fileListInfo',
    selection: true,
    multipleSelectionKey: 'fileListMultipleSelection',
    header: [
      {
        label: '序号',
        key: '',
        width: 100
      },
      {
        label: '文件',
        key: 'fileName',
        width: 100
      },
      {
        label: '提交时间',
        key: 'createTime',
        width: 100
      },
      {
        label: '操作',
        key: '',
        width: 28,
        onlyReadBtns: ['预览', '下载']
      }
    ],
    children: [
      {
        label: '补充说明',
        key: 'supplementary_instruction',
        component: 'el-input',
        type: 'textarea',
        maxlength: 1000
      }
    ]
  },
  {
    label: '',
    component: 'process-table',
    key: 'processTable',
    key2: 'processList',
    accept: '.pdf, .docx, .xls, .xlsx',
    className: 'processTable',
    needRowClass: true,
    show: true,
    header: [
      {
        label: '审批人',
        key: 'handlerName',
        width: 80
      },
      {
        label: '步骤名称',
        key: 'stageName',
        width: 80
      },
      {
        label: '审批结果',
        key: 'auditRes',
        width: 80
      },
      {
        label: '审批意见',
        key: 'auditRemarks',
        width: 80
      },
      {
        label: '审批附件',
        key: 'fileVOList',
        width: 150
      },
      {
        label: '发起/审批时间',
        key: 'createTime',
        width: 60
      }
    ]
  }
]
const formData = ref([])

const getData = async () => {
  getProjectResearchPanoramaDetail({ projectId: props.curEditRow?.id }).then(res => {
    if (res.code === 10000) {
      formData.value = res.data.map(it => {
        it.label = it.commitTime
        it.show = true
        it.processTable = it.flowOverviewVO?.flowTaskHistoryList.map(item => {
          return {
            handlerName: item.handlerName,
            stageName: item.stageName,
            auditRes: item.auditRes,
            auditRemarks: item.auditRemarks,
            fileVOList: item.fileVOList?.map(file => ({
              fileName: file.fileName,
              fileUrl: file.fileUrl
            })) || [],
            createTime: item.createTime
          }
        })
        it.processList = it.flowOverviewVO?.flowProcessList.map(item => {
          return {
            label: item.name,
            user: `${item.operator || '-'}（${item.operatorDeptName || '-'}` + `${item.departmentManager === 1 ? '负责人）' : '）'}`,
            nodeStatus: item.nodeStatus
          }
        })
        return it
      })
    }
  })
}

onMounted(async () => {
  scrollContainer.value = scrollbarRef.value.wrapRef
  if (props.curEditRow?.id) {
    getData()
  }
})
</script>
<style scoped lang="scss">
@use '@/components/researchManagement/style/commonTimeLineFormRender.scss';
</style>
