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
  name: 'AwardFormPanorama',
  inheritAttrs: false
})
import { ref, onMounted } from 'vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import commonFormRender from '@/components/researchManagement/commonFormRender.vue'
import commonFormLeftMenu from '@/components/researchManagement/commonFormLeftMenu.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { getAwardPanoramaDetail } from '@/api/api_scientific'
import { enum_gender } from '@/components/researchManagement/enum/enum_researchManagement.js'
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
const title = ref('相关获奖')
const loading = ref(false)
const fieldInfo = [
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
        className: 'width25',
        rules: [{
          required: true
        }]
      },
      {
        label: '证书编号',
        key: 'certificateNo',
        component: 'el-input',
        type: 'text',
        className: 'width25',
        rules: [{
          required: true
        }]
      },
      {
        label: '获奖级别',
        key: 'awardLevel',
        component: 'el-input',
        type: 'text',
        className: 'width25',
        rules: [{
          required: true
        }]
      },
      {
        label: '登记日期',
        key: 'registrationDate',
        component: 'el-input',
        type: 'text',
        className: 'width25',
        rules: [{
          required: true
        }]
      },
      {
        label: '获奖日期',
        key: 'awardDate',
        component: 'el-input',
        type: 'text',
        className: 'width25 last-line',
        rules: [{
          required: true
        }]
      },
      {
        label: '颁证单位',
        key: 'certifyingAgency',
        component: 'el-input',
        type: 'text',
        className: 'width25 last-line',
        rules: [{
          required: true
        }]
      },
      {
        label: '获奖等级',
        key: 'awardGrade',
        component: 'el-input',
        type: 'text',
        className: 'width25 last-line',
        rules: [{
          required: true
        }]
      },
      {
        label: '科研秘书',
        key: 'academicSecretary',
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
    label: '获奖人员',
    key: 'srmAwardPersonList',
    component: 'el-table',
    className: 'participantsInfo',
    show: true,
    addText: '添加1行获奖人员信息',
    maxCount: 30,
    border: false,
    // needDrag: true,
    header: [
      {
        label: '序号',
        key: 'serialNumber',
        component: '',
        type: '',
        width: 60
      },
      {
        label: '是否院内',
        key: 'isOurCollege',
        component: 'el-checkbox',
        type: 'checkbox',
        width: 80
      },
      {
        label: '姓名',
        key: 'name',
        component: 'el-input',
        type: 'text',
        required: true,
        placeholder: '请填写或查询',
        operation: 'query',
        width: 80,
        rules: [{
          required: true
        }]
      },
      {
        label: '性别',
        key: 'gender',
        viewKey: 'genderDesc',
        component: 'el-select',
        enums: enum_gender,
        width: 80
      },
      {
        label: '工号',
        key: 'workNo',
        component: 'el-input',
        type: 'text',
        width: 80
      },
      {
        label: '出生年月',
        key: 'birthDate',
        component: 'el-date-picker',
        type: 'month',
        customFormat: true,
        format: 'YYYY-MM',
        width: 80
      },
      {
        label: '科室',
        key: 'departmentName',
        component: 'el-input',
        type: 'text',
        width: 80
      },
      {
        label: '单位名称',
        key: 'unitName',
        component: 'el-input',
        type: 'text',
        required: true,
        width: 120,
        rules: [{
          required: true
        }]
      },
      {
        label: '获奖位次',
        key: 'awardRank',
        type: 'text',
        component: 'el-input',
        disabled: true,
        width: 60
      }
    ]
  },
  {
    label: '科研项目',
    key: 'srmBizProjectList',
    component: 'el-table',
    className: 'participantsInfo',
    show: true,
    addText: '添加1行科研项目信息',
    maxCount: 100,
    border: false,
    // needDrag: true,
    header: [
      {
        label: '序号',
        key: 'serialNumber',
        component: '',
        type: '',
        width: 47
      },
      {
        label: '是否计入本项目',
        key: 'statisticFlag',
        component: 'el-checkbox',
        type: 'checkbox',
        width: 100
      },
      {
        label: '项目名称',
        key: 'projectName',
        component: 'el-select',
        width: 100
        // enums: projectOptions.value,
      },
      {
        label: '项目编号',
        key: 'projectCode',
        component: 'el-input',
        type: 'text',
        disabled: true,
        width: 100
      },
      {
        label: '负责人',
        key: 'directorName',
        component: 'el-input',
        type: 'text',
        disabled: true,
        width: 100
      },
      {
        label: '单位名称',
        key: 'agencyName',
        component: 'el-input',
        type: 'text',
        disabled: true,
        width: 100
      }
    ]
  },
  {
    label: '相关附件',
    component: 'el-upload',
    show: true,
    key: 'files',
    className: 'fileListInfo',
    selection: true,
    multipleSelectionKey: 'fileListMultipleSelection',
    header: [
      {
        label: '序号',
        key: '',
        width: 40
      },
      {
        label: '文件',
        key: 'fileName',
        width: 60
      },
      {
        label: '提交时间',
        key: 'createTime',
        width: 50
      },
      {
        label: '提交人',
        key: 'creator',
        width: 40
      },
      {
        label: '操作',
        key: '',
        width: 19,
        onlyReadBtns: ['预览', '下载']
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
  getAwardPanoramaDetail({ projectId: props.curEditRow?.id }).then(res => {
    if (res.code === 10000) {
      formData.value = res.data.map(it => {
        it.label = it.commitTime
        it.show = true
        it.fileListMultipleSelection = []
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
// formData.value = []
</script>
<style scoped lang="scss">
@use '@/components/researchManagement/style/commonTimeLineFormRender.scss';
</style>
