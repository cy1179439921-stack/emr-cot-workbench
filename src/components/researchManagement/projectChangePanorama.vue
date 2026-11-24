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
  name: 'ProjectChangePanorama',
  inheritAttrs: false
})
import { ref, onMounted } from 'vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import commonFormRender from '@/components/researchManagement/commonFormRender.vue'
import commonFormLeftMenu from '@/components/researchManagement/commonFormLeftMenu.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { getProjectChangePanoramaDetail } from '@/api/api_scientific'
import lodash from 'lodash'
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
const title = ref('项目变更')
const loading = ref(false)
const fieldInfo = [
  {
    label: '项目变更',
    component: 'ul-li',
    show: true,
    className: 'basicInfo',
    children: [
      {
        label: '变更ID',
        key: 'project_change_id',
        component: 'el-input',
        type: 'text',
        className: 'width25 last-line'
      }
    ]
  },
  {
    label: '',
    key: 'change_record',
    component: 'el-record',
    className: 'changeRecord',
    show: true,
    children: [
      {
        label: '基本信息',
        key: 'changebasicInfo',
        component: 'el-table',
        className: 'changebasicInfo',
        needTitleLine: true,
        show: true,
        border: false,
        header: [
          {
            label: '字段',
            key: 'field',
            width: 200
          },
          {
            label: '原信息',
            key: 'oldValue',
            width: 200
          },
          {
            label: '现信息',
            key: 'newValue',
            width: 60
          }
        ]
      },
      {
        label: '项目负责人信息',
        key: 'projectDirectorChangeRecord',
        component: 'el-table',
        className: 'changebasicInfo',
        needTitleLine: true,
        show: true,
        border: false,
        header: [
          {
            label: '字段',
            key: 'field',
            width: 200
          },
          {
            label: '原信息',
            key: 'oldValue',
            width: 200
          },
          {
            label: '现信息',
            key: 'newValue',
            width: 60
          }
        ]
      },
      {
        label: '项目参与人信息',
        key: 'projectParticipantChangeRecord',
        component: 'el-table',
        className: 'participantsInfo',
        needTitleLine: true,
        show: true,
        border: false,
        needRowClass: true,
        header: [
          {
            label: '',
            key: 'changeMethod',
            width: 80
          },
          {
            label: '是否院内',
            key: 'inHospital',
            width: 80
          },
          {
            label: '姓名',
            key: 'userName',
            width: 80
          },
          {
            label: '性别',
            key: 'sexName',
            width: 80
          },
          {
            label: '工号',
            key: 'workCode',
            width: 80
          },
          {
            label: '出生年月',
            key: 'birthday',
            width: 80
          },
          {
            label: '学位',
            key: 'degree',
            width: 80
          },
          {
            label: '职称',
            key: 'title',
            width: 80
          },
          {
            label: '单位名称',
            key: 'unitName',
            width: 80
          }
        ]
      },
      {
        label: '立项任务书及相关附件',
        component: 'el-upload',
        show: true,
        key: 'fileList',
        accept: '.pdf, .docx, .xls, .xlsx',
        className: 'fileListInfo',
        needTitleLine: true,
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
            key: 'submitTime',
            width: 100
          },
          {
            label: '操作',
            key: 'changeMethod',
            width: 15
          }
        ]
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
  getProjectChangePanoramaDetail({ projectId: props.curEditRow?.id }).then(res => {
    if (res.code === 10000) {
      formData.value = res.data.map(it => {
        it.label = it.commitTime
        it.show = true
        it.project_change_id = it.id
        it.changebasicInfo = it.baseChangeRecord
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
        it.fileList = it.fileChangeRecord.map(file => {
          return {
            uuid: file.id,
            fileName: file.oldValue.fileName,
            submitTime: file.oldValue.createTime,
            changeMethod: file.changeMethod
          }
        })
        const arr = []
        it.projectParticipantChangeRecord?.forEach(item => {
          if (item.changeMethod === '修改') {
            // 对比item.oldValue和item.newValue，不一样的部分添加到arr中
            const fieldsToCheck = ['inHospital', 'userName', 'sex', 'workCode', 'birthday', 'degree', 'title', 'unitName']
            const changeTextArr = fieldsToCheck.reduce((acc, field) => {
              if (item.oldValue[field] !== item.newValue[field]) {
                acc.push(item.newValue[field])
              }
              return acc
            }, [])
            const oldIndex = lodash.findIndex(enum_gender, { value: item.oldValue.sex })
            const newIndex = lodash.findIndex(enum_gender, { value: item.newValue.sex })
            item.oldValue.sexName = oldIndex > -1 ? enum_gender[oldIndex].label : ''
            item.newValue.sexName = newIndex > -1 ? enum_gender[newIndex].label : ''
            arr.push({ ...item.oldValue, changeMethod: '原信息' })
            arr.push({ ...item.newValue, changeMethod: '变更信息', changeTextArr })
          }
          if (item.changeMethod === '新增') {
            const newIndex = lodash.findIndex(enum_gender, { value: item.newValue.sex })
            item.newValue.sexName = newIndex > -1 ? enum_gender[newIndex].label : ''
            arr.push({ ...item.newValue, changeMethod: '新增信息' })
          }
          if (item.changeMethod === '删除') {
            const oldIndex = lodash.findIndex(enum_gender, { value: item.oldValue.sex })
            item.oldValue.sexName = oldIndex > -1 ? enum_gender[oldIndex].label : ''
            arr.push({ ...item.oldValue, changeMethod: '删除信息' })
          }
        })
        console.log(arr, 'arr')
        it.projectParticipantChangeRecord = arr
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
.projectResearchPanorama {
  .timeline {
    :deep(.medical-body) {
      .changeRecord {
        margin-top: 0 !important;
        padding-left: 0 !important;
        .change-record {
          border-top: none !important;
          .section-title2 {
            padding-left: 16px;
          }
        }
      }
    }
  }
}
</style>
