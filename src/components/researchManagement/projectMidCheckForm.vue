<template>
  <div class="form-body-container">
    <commonFormTitle :mode="mode" :projectId="selectedProjectId" :curEditRow="curEditRow" title="中检" :needView="true" @handleBack="handleBack" v-if="showHeader"/>
    <div class="main-frame">
      <div class="main-content">
        <commonFormLeftMenu ref="commonFormLeftMenuRef" title="项目中检" hrefIdPrefix="part" :renderInfo="fieldInfo" :containerRef="scrollContainer"></commonFormLeftMenu>
        <div class="menu-content">
          <el-scrollbar ref="scrollbarRef">
            <panoramaTitle title="中检" :id="panoramaTitleId" v-if="['projectPanoramaForm'].includes(page)"/>
            <commonFormEditRender ref="commonFormEditRenderRef" :businessType="businessType" :renderInfo="fieldInfo" :formData="formData" @submit="handleSubmit" @cancel="handleCancel" v-if="mode === 'edit'" :auditStatus="curEditRow?.auditStatus || 0"/>
            <commonFormRender :businessType="businessType" :renderInfo="fieldInfo" :formData="formData" @submit="handleSubmit" @cancel="handleCancel" v-if="mode === 'view'"/>
            <commonFormApproveRender ref="commonFormApproveRenderRef" :renderInfo="fieldInfo" :formData="formData" :businessType="businessType" @approve="handleApprove" v-if="mode === 'approve'"/>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ProjectMidCheckForm',
  inheritAttrs: false
})
import { ref, onMounted } from 'vue'
import commonFormTitle from '@/components/researchManagement/commonFormTitle.vue'
import commonFormLeftMenu from '@/components/researchManagement/commonFormLeftMenu.vue'
import commonFormEditRender from '@/components/researchManagement/commonFormEditRender.vue'
import commonFormRender from '@/components/researchManagement/commonFormRender.vue'
import panoramaTitle from '@/components/researchManagement/panoramaTitle.vue'
import commonFormApproveRender from '@/components/researchManagement/commonFormApproveRender.vue'
import { getUserSelectList, getProjectSelectList, getProjectMiddleDetail, saveProjectMiddle, getProjectDetail, approveProject, getProjectMiddlePanorama } from '@/api/api_scientific.js'
import { getPermissionStructure } from '@/api/api_home'
import { ElMessage } from 'element-plus'
import { useTobeDoneStore } from '@/store/tobeDoneStore'
const tobeDoneStore = useTobeDoneStore()
const scrollbarRef = ref(null)
const scrollContainer = ref(null)
const emits = defineEmits(['handleBack'])
const props = defineProps({
  showHeader: {
    type: Boolean,
    default: true
  },
  page: { // 父页面
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'view'
  },
  curEditRow: {
    type: Object,
    default: () => ({})
  },
  businessType: {
    type: Number,
    default: 4
  },
  activeTab: {
    type: Object,
    default: () => ({})
  }
})
const nameOptions = ref([])
const departmentOptions = ref([])
// 获取姓名下拉列表
const getNameList = async () => {
  const { code, data } = await getUserSelectList()
  if (code === 10000) {
    nameOptions.value = data.map(item => {
      return {
        label: item.userName,
        value: item.id,
        departmentId: item.departmentId,
        departmentName: item.departmentName
      }
    })
  }
}
const getDepartmentList = async () => {
  const { code, data } = await getPermissionStructure()
  departmentOptions.value = []
  if (code === 10000) {
    data.forEach(item => {
      departmentOptions.value.push({
        label: item.name,
        value: item.id
      })
    })
  }
}
const fieldInfo = ref([])
const projectOptions = ref([])
const getProjectList = async () => {
  const { code, data } = await getProjectSelectList({
    stage: 4
  })
  if (code === 10000) {
    data.forEach(item => {
      projectOptions.value.push({
        label: item.projectName,
        value: item.id,
        projectCode: item.projectCode
      })
    })
  }
}
const selectedProjectId = ref('') // 项目id
const init = async () => {
  if (props.mode === 'edit') {
    // 获取姓名下拉列表
    await getNameList()
    // 获取科室列表
    await getDepartmentList()
    // 获取项目列表
    await getProjectList()
  }

  fieldInfo.value = [
    {
      label: '中检信息',
      component: 'ul-li',
      show: true,
      className: 'basicInfo',
      children: [
        {
          label: '项目名称',
          key: 'projectName',
          component: 'el-select',
          enums: projectOptions.value,
          className: 'width25',
          rules: [{
            required: true,
            message: '请选择项目名称',
            trigger: 'change'
          }],
          onChange: async (value, localFormData) => {
            const selectedItem = projectOptions.value.find(item => item.value === value)
            if (selectedItem) {
              localFormData.value.projectCode = selectedItem.projectCode || ''
              selectedProjectId.value = selectedItem.value
              const { code, data } = await getProjectDetail(
                {
                  id: selectedItem.value
                })
              if (code === 10000) {
                localFormData.value.projectName = data.projectName
                localFormData.value.projectCode = data.projectCode
                localFormData.value.researchDateRange = [data.researchStartTime, data.researchEndTime]
                localFormData.value.startDate = `${data.projectApprovalYear}-${String(data.projectApprovalMonth).padStart(2, '0')}`
                localFormData.value.leader_userName = data.projectDirector.userName
                localFormData.value.leader_userId = data.projectDirector.userId
                localFormData.value.leader_departmentId = data.projectDirector.departmentId
                localFormData.value.leader_departmentName = data.projectDirector.departmentName
                localFormData.value.totalMoney = data.totalMoney
              }

              // nextTick(() => {
              //   commonFormEditRenderRef.value?.validateForm()
              // })
            } else {
              selectedProjectId.value = ''
              formData.value = {
                rojectName: '',
                projectCode: '',
                researchDateRange: '',
                startDate: '',
                leader_userName: '',
                leader_userId: '',
                leader_departmentId: '',
                leader_departmentName: '',
                totalMoney: null,
                receiveMoney: null,
                reimburseMoney: null,
                balance: null,
                planningIndicators: '',
                finishPlanningIndicators: '',
                mainWorkAndResult: '',
                problem: '',
                researchWork: '',
                feeUse: '',
                fileList: [],
                fileListMultipleSelection: [],
                processTable: [],
                processList: [],
                approvaFileList: [],
                approvaFileListMultipleSelection: [],
                approvaRemarks: ''
              }
            }
          }
        },
        {
          label: '项目编号',
          key: 'projectCode',
          component: 'el-input',
          type: 'text',
          disabled: true,
          className: 'width25',
          rules: [{
            required: true,
            message: '项目编号为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '立项计划完成年月',
          key: 'researchDateRange',
          component: 'el-date-picker',
          type: 'daterange',
          disabled: true,
          customFormat: true,
          format: 'YYYY-MM-DD',
          className: 'width25',
          rules: [{
            validator(rule, value, callback) {
              if (!value || !Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
                callback(new Error('研究期限为必填项'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }]
        },
        {
          label: '立项年月',
          key: 'startDate',
          component: 'el-date-picker',
          type: 'date',
          disabled: true,
          customFormat: true,
          format: 'YYYY-MM',
          className: 'width25',
          rules: [{
            required: true,
            message: '立项年月为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '项目负责人',
          key: 'leader_userId',
          viewKey: 'leader_userName',
          component: 'el-select',
          enums: nameOptions.value,
          type: 'text',
          disabled: true,
          className: 'width25',
          rules: [{
            required: true,
            message: '项目负责人为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '项目负责人所属科室',
          key: 'leader_departmentName',
          component: 'el-input',
          disabled: true,
          className: 'width25',
          rules: [{
            required: true,
            message: '项目负责人所属科室为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '总经费（万）',
          key: 'totalMoney',
          component: 'el-input-number',
          type: 'number',
          disabled: true,
          precision: 6,
          max: 10000,
          className: 'width25',
          rules: [{
            required: true,
            message: '总经费（万）为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '到账金额（万）',
          key: 'receiveMoney',
          component: 'el-input-number',
          type: 'number',
          precision: 6,
          max: 10000,
          className: 'width25 marginR0'
        },
        {
          label: '已报销金额（万）',
          key: 'reimburseMoney',
          component: 'el-input-number',
          type: 'number',
          precision: 6,
          max: 10000,
          className: 'width25'
        },
        {
          label: '余额（万）',
          key: 'balance',
          component: 'el-input-number',
          type: 'number',
          precision: 6,
          max: 10000,
          className: 'width25'
        },
        {
          label: '计划指标',
          key: 'planningIndicators',
          component: 'el-input',
          type: 'textarea',
          className: 'width100',
          maxlength: 1000,
          rules: [{
            required: true,
            message: '计划指标为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '已完成计划指标',
          key: 'finishPlanningIndicators',
          component: 'el-input',
          type: 'textarea',
          className: 'width100',
          maxlength: 1000,
          rules: [{
            required: true,
            message: '已完成计划指标为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '研究工作主要进展和阶段性成果',
          key: 'mainWorkAndResult',
          component: 'el-input',
          type: 'textarea',
          className: 'width100',
          maxlength: 1000,
          rules: [{
            required: true,
            message: '研究工作主要进展和阶段性成果为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '项目实际存在的问题',
          key: 'problem',
          component: 'el-input',
          type: 'textarea',
          className: 'width100',
          maxlength: 1000,
          rules: [{
            required: true,
            message: '项目实际存在的问题为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '年月至年月的研究工作',
          key: 'researchWork',
          component: 'el-input',
          type: 'textarea',
          className: 'width100',
          maxlength: 1000,
          rules: [{
            required: true,
            message: '年月至年月的研究工作为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '资金到位，使用情况',
          key: 'feeUse',
          component: 'el-input',
          type: 'textarea',
          className: 'width100',
          maxlength: 1000,
          rules: [{
            required: true,
            message: '资金到位，使用情况为必填项',
            trigger: 'blur'
          }]
        }
      ]
    },
    {
      label: '相关附件',
      component: 'el-upload',
      show: true,
      key: 'fileList',
      accept: '.pdf, .docx, .xls, .xlsx',
      className: 'fileListTable',
      selection: true,
      multipleSelectionKey: 'fileListMultipleSelection',
      header: [
        {
          label: '序号',
          key: '',
          width: props.mode === 'edit' ? 85 : 80
        },
        {
          label: '文件',
          key: 'fileName',
          width: props.mode === 'edit' ? 118 : 100
        },
        {
          label: props.mode === 'edit' ? '上传状态' : '提交时间',
          key: props.mode === 'edit' ? 'uploadStatus' : 'submitTime',
          width: props.mode === 'edit' ? 140 : 100
        },
        {
          label: '操作',
          key: '',
          component: 'el-button',
          width: props.mode === 'edit' ? 31 : 26,
          editBtns: ['删除'],
          onlyReadBtns: ['预览', '下载']
        }
      ]
    },
    {
      label: '进度及日志',
      component: 'process-table',
      key: 'processTable',
      key2: 'processList',
      accept: '.pdf, .docx, .xls, .xlsx',
      className: 'processTable',
      needRowClass: true,
      show: (props.mode === 'view' && props.curEditRow.auditStatus !== 1) || props.page === 'projectApproveForm',
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
    },
    {
      label: '流程审批',
      component: 'el-approval',
      show: props.mode.includes('approve'),
      key: 'approvaFileList',
      accept: '.pdf, .docx, .xls, .xlsx',
      className: 'approvaFileListInfo',
      selection: true,
      multipleSelectionKey: 'approvaFileListMultipleSelection',
      header: [
        {
          label: '序号',
          key: '',
          width: ['edit', 'approve'].includes(props.mode) ? 85 : 80
        },
        {
          label: '文件',
          key: 'fileName',
          width: ['edit', 'approve'].includes(props.mode) ? 118 : 100
        },
        {
          label: ['edit', 'approve'].includes(props.mode) ? '上传状态' : '提交时间',
          key: ['edit', 'approve'].includes(props.mode) ? 'uploadStatus' : 'submitTime',
          width: ['edit', 'approve'].includes(props.mode) ? 140 : 100
        },
        {
          label: '操作',
          key: '',
          component: 'el-button',
          width: ['edit', 'approve'].includes(props.mode) ? 40 : 40,
          editBtns: ['删除'],
          onlyReadBtns: ['预览', '下载']
        }
      ],
      children: [
        {
          label: '审批备注',
          key: 'approvaRemarks',
          component: 'el-input',
          type: 'textarea',
          maxlength: 1000,
          className: 'width100 last-line'
        }
      ]
    }
  ]
}
const formData = ref({
  projectName: '',
  projectCode: '',
  researchDateRange: '',
  startDate: '',
  leader_userName: '',
  leader_userId: '',
  leader_departmentId: '',
  leader_departmentName: '',
  totalMoney: null,
  receiveMoney: null,
  reimburseMoney: null,
  balance: null,
  planningIndicators: '',
  finishPlanningIndicators: '',
  mainWorkAndResult: '',
  problem: '',
  researchWork: '',
  feeUse: '',
  fileList: [],
  fileListMultipleSelection: [],
  processTable: [],
  processList: [],
  approvaFileList: [],
  approvaFileListMultipleSelection: [],
  approvaRemarks: ''
})
const panoramaTitleId = ref('')
const toGetMiddleDetail = async () => {
  let res = {}
  // 我的待办用businessId，其他用id
  if (props.page === 'projectPanoramaForm') {
    res = await getProjectMiddlePanorama({
      projectId: props.curEditRow.businessId || props.curEditRow.id
    })
    if (res.code === 10000) {
      panoramaTitleId.value = res.data.id
    }
  } else {
    res = await getProjectMiddleDetail({
      id: props.curEditRow.businessId || props.curEditRow.id
    })
    if (res.code === 10000) {
      selectedProjectId.value = res.data.projectId
    }
  }
  if (res.code === 10000) {
    const data = res.data
    console.log('data', data)
    formData.value = {
      projectName: data.projectName,
      projectCode: data.projectCode,
      researchDateRange: [data.researchStartTime, data.researchEndTime],
      startDate: `${data.projectApprovalYear}-${String(data.projectApprovalMonth).padStart(2, '0')}`,
      leader_userName: data.projectDirectorName,
      leader_userId: data.projectDirectorUserId,
      leader_departmentId: data.departmentId,
      leader_departmentName: data.projectDirectorDept,
      totalMoney: data.totalMoney,
      receiveMoney: data.receiveMoney,
      reimburseMoney: data.reimburseMoney,
      balance: data.balance,
      planningIndicators: data.planningIndicators,
      finishPlanningIndicators: data.finishPlanningIndicators,
      mainWorkAndResult: data.mainWorkAndResult,
      problem: data.problem,
      researchWork: data.researchWork,
      feeUse: data.feeUse,
      fileList: data.files.map(item => {
        return {
          id: item.id,
          fileName: item.fileName,
          submitTime: item.createTime,
          fileUrl: item.fileUrl
        }
      }),
      fileListMultipleSelection: [],
      processTable: data.flowOverviewVO?.flowTaskHistoryList.map(item => {
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
      }),
      processList: data.flowOverviewVO?.flowProcessList.map(item => {
        return {
          label: item.name,
          user: `${item.operator || '-'}（${item.operatorDeptName || '-'}` + `${item.departmentManager === 1 ? '负责人）' : '）'}`,
          nodeStatus: item.nodeStatus
        }
      }),
      approvaFileList: [],
      approvaFileListMultipleSelection: [],
      approvaRemarks: ''
    }
    console.log('formData', formData.value)
  }
}
onMounted(async () => {
  // el-scrollbar 内部的 wrap
  scrollContainer.value = scrollbarRef.value.wrapRef
  await init()
  if (props.curEditRow?.id) {
    toGetMiddleDetail()
  }
})
// 取消编辑
const handleCancel = () => {
  // formData.value = JSON.parse(JSON.stringify(oldFormData.value))
  console.log('执行取消或返回')
  emits('handleBack')
}
const commonFormEditRenderRef = ref(null)
const commonFormApproveRenderRef = ref(null)
// 返回
const handleBack = async () => {
  if (props.mode === 'edit') {
    const status = await commonFormEditRenderRef.value.judgeBack()
    console.log('status', status)
    if (status === 'confirm') {
      // 用户点击了“确认”
      console.log('执行暂存')
      handleSubmit(1)
    } else if (status === 'cancel') {
      // 用户点击了“取消”
      console.log('有变更，执行继续返回')
      emits('handleBack')
    } else if (status === 'no-change') {
      // 无变更，直接取消
      emits('handleBack')
    }
  } else {
    // 非编辑模式，直接返回
    emits('handleBack')
  }
}
// 提交
const handleSubmit = async (auditStatus) => {
  console.log('执行提交')
  const editFormData = commonFormEditRenderRef.value.getFormData()
  console.log('editFormData', editFormData)
  // 判断editFormData.fileList中的status是否存在uploading状态，若存在，则阻止提交
  const uploading = editFormData.fileList.some(item => item.status === 'uploading')
  if (uploading) {
    ElMessage.error('有文件正在上传，请等待文件上传完成或删除文件后再提交')
    return
  }
  const params = {
    id: props.curEditRow?.id,
    projectId: selectedProjectId.value,
    auditStatus, // 1暂存 2提交
    balance: editFormData.balance,
    feeUse: editFormData.feeUse,
    finishPlanningIndicators: editFormData.finishPlanningIndicators,
    mainWorkAndResult: editFormData.mainWorkAndResult,
    planningIndicators: editFormData.planningIndicators,
    problem: editFormData.problem,
    receiveMoney: editFormData.receiveMoney,
    reimburseMoney: editFormData.reimburseMoney,
    researchWork: editFormData.researchWork,
    fileIds: editFormData.fileList.map(item => item.id)
  }
  console.log('params', params)
  const { code } = await saveProjectMiddle(params)
  if (code === 10000) {
    console.log(auditStatus === 1)
    if (auditStatus === 1) {
      ElMessage.success('已暂存，可以随时回来继续')
    } else {
      ElMessage.success('提交成功')
      tobeDoneStore.setTobeDoneNum()
    }
    emits('handleBack')
  }
}
// 审批
const handleApprove = async (status) => {
  console.log('执行审批')
  console.log('status', status)
  const editFormData = commonFormApproveRenderRef.value.getFormData()
  console.log('editFormData', editFormData)
  // 判断editFormData.approvaFileList中的status是否存在uploading状态，若存在，则阻止提交
  const uploading = editFormData.approvaFileList.some(item => item.status === 'uploading')
  if (uploading) {
    ElMessage.error('有文件正在上传，请等待文件上传完成或删除文件后再审批')
    return
  }
  const params = {
    auditRemark: editFormData.approvaRemarks,
    auditRes: status,
    businessId: props.curEditRow.businessId,
    businessType: props.businessType,
    fileIds: editFormData.approvaFileList.map(item => item.id)
  }
  const { code, data } = await approveProject(params)
  console.log('code', code, data)
  if (code === 10000) {
    ElMessage.success('审批成功')
    tobeDoneStore.setTobeDoneNum()
    emits('handleBack')
  }
}
</script>
<style scoped lang="scss">
.form-body-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .empty-container {
    position: relative;
    flex: 1;
    border-radius: 8px;
    background-color: var(--theme-card);
  }
  .goback-btn {
    justify-content: space-between;
    padding-right: 16px;
  }
  .main-frame {
    display: flex;
    flex: 1;
    height: 0;
    padding: 16px;
    .main-content {
      display: flex;
      width: 100%;
      height: 100%;
      border-radius: 6px;
      .menu-content {
        flex: 1;
        box-sizing: border-box;
        width: 100%;
        margin-left: 16px;
        padding: 0;
        border-radius: 8px;
        :deep(.el-scrollbar) {
          .el-scrollbar__view {
            height: 100%;
          }
        }
        // 非通用样式，特殊处理
        :deep(.common-form) {
          .basicInfo {
            padding-bottom: 0;
            .commonUl-li {
              .width25 {
                &:nth-child(4) {
                  margin-right: 0;
                }
                &:nth-last-child(-n + 4) {
                  .el-form-item {
                    margin-bottom: 24px;
                  }
                }
              }
              .width50 {
                width: calc(100% - (100% - 261px)/2 - 174px);
              }
            }
          }
        }
        :deep(.readonlyMode) {
          .common-form {
            .basicInfo {
              padding-bottom: 24px;
              .commonUl-li {
                .custom-form-item {
                  margin-bottom: 0 !important;
                }
                .last-line {
                  margin-bottom: 0;
                }
                .width50 {
                  width: calc(100% - (100% - 60px)/2 - 40px);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
