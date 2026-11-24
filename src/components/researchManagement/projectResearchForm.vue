<template>
  <div class="form-body-container">
    <commonFormTitle :mode="mode" :projectId="projectId" title="研究" :curEditRow="curEditRow" :needView="true" @handleBack="handleBack" v-if="showHeader"/>
    <div class="main-frame">
      <div class="main-content">
        <commonFormLeftMenu ref="commonFormLeftMenuRef" title="项目研究" hrefIdPrefix="part" :renderInfo="fieldInfo" :containerRef="scrollContainer"></commonFormLeftMenu>
        <div class="menu-content">
          <el-scrollbar ref="scrollbarRef">
            <commonFormEditRender ref="commonFormEditRenderRef" :renderInfo="fieldInfo" :formData="formData" :businessType="businessType" @submit="handleSubmit" @cancel="handleCancel" v-if="mode === 'edit'" :auditStatus="curEditRow?.auditStatus || 0"/>
            <commonFormRender :renderInfo="fieldInfo" :formData="formData" :businessType="businessType" @submit="handleSubmit" @cancel="handleCancel" v-if="mode === 'view'"/>
            <commonFormApproveRender ref="commonFormApproveRenderRef" :renderInfo="fieldInfo" :formData="formData" :businessType="businessType" @approve="handleApprove" v-if="mode === 'approve'"/>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ProjectResearchForm',
  inheritAttrs: false
})
import { ref, onMounted } from 'vue'
import commonFormTitle from '@/components/researchManagement/commonFormTitle.vue'
import commonFormLeftMenu from '@/components/researchManagement/commonFormLeftMenu.vue'
import commonFormEditRender from '@/components/researchManagement/commonFormEditRender.vue'
import commonFormRender from '@/components/researchManagement/commonFormRender.vue'
import commonFormApproveRender from '@/components/researchManagement/commonFormApproveRender.vue'
import { saveProjectResearch, updateProjectResearch, getProjectSelectList, getProjectResearchDetail, approveProject } from '@/api/api_scientific.js'
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
  businessType: {
    type: Number,
    default: 2
  },
  curEditRow: {
    type: Object
  }
})
const fieldInfo = ref([])
const projectOptions = ref([])
const getProjectList = async () => {
  const { code, data } = await getProjectSelectList({
    stage: 2
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
const projectId = ref('') // 项目id
const init = async () => {
  await getProjectList()
  fieldInfo.value = [
    {
      label: '基本信息',
      component: 'ul-li',
      show: true,
      className: 'basicInfo',
      children: [
        {
          label: '项目名称',
          key: 'projectName',
          component: 'el-select',
          enums: projectOptions.value,
          className: 'width25 last-line',
          rules: [{
            required: true,
            message: '项目名称为必填项',
            trigger: 'change'
          }],
          onChange: (value, localFormData) => {
            const selectedItem = projectOptions.value.find(item => item.value === value)
            if (selectedItem) {
              localFormData.value.projectCode = selectedItem.projectCode || ''
              projectId.value = selectedItem.value
              // nextTick(() => {
              //   if (localFormData.value.projectCode) {
              //     commonFormEditRenderRef.value?.validateForm()
              //   }
              // })
            } else {
              localFormData.value.projectCode = ''
              projectId.value = ''
            }
          }
        },
        {
          label: '项目编号',
          key: 'projectCode',
          component: 'el-input',
          type: 'text',
          disabled: true,
          className: 'width25 last-line',
          rules: [{
            required: true,
            message: '项目编号为必填项',
            trigger: 'blur'
          }]
        }
      ]
    },
    {
      label: '附件补充',
      component: 'el-upload',
      show: true,
      key: 'fileList',
      accept: '.pdf, .docx, .xls, .xlsx',
      className: 'fileListTable',
      selection: true,
      multipleSelectionKey: 'fileListMultipleSelection',
      required: true,
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
      ],
      children: [
        {
          label: '补充说明',
          key: 'description',
          component: 'el-input',
          type: 'textarea',
          maxlength: 1000,
          nullDefaultValue: '无'
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
  fileList: [],
  fileListMultipleSelection: [],
  description: '',
  processTable: [],
  processList: [],
  approvaFileList: [],
  approvaFileListMultipleSelection: [],
  approvaRemarks: ''
})
const getData = async () => {
  const { code, data } = await getProjectResearchDetail({
    // 我的待办用businessId，其他用id
    id: props.curEditRow.businessId || props.curEditRow.id
  })
  if (code === 10000) {
    console.log('data', data)
    projectId.value = data.projectId
    formData.value = {
      projectName: data.projectName,
      projectCode: data.projectCode,
      fileList: data.fileList.map(item => {
        return {
          id: item.id,
          fileName: item.fileName,
          submitTime: item.createTime,
          fileUrl: item.fileUrl
        }
      }),
      fileListMultipleSelection: [],
      description: data.description,
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
    getData()
  }
})
// 取消编辑
const handleCancel = () => {
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
    auditStatus, // 1暂存 2提交
    fileIds: editFormData.fileList.map(item => item.id),
    projectId: projectId.value,
    description: editFormData.description
  }
  console.log('params', params)
  if (auditStatus === 2) {
    // 提交对附件做校验
    if (params.fileIds.length === 0) {
      ElMessage.error('附件补充为必填项')
      return false
    }
  }
  if (!props.curEditRow.id) {
    const { code } = await saveProjectResearch(params)
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
  } else {
    const { code } = await updateProjectResearch(params)
    if (code === 10000) {
      if (auditStatus === 1) {
        ElMessage.success('已暂存，可以随时回来继续')
      } else {
        ElMessage.success('提交成功')
        tobeDoneStore.setTobeDoneNum()
      }
      emits('handleBack')
    }
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
    tobeDoneStore.setTobeDoneNum()
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
              .custom-form-item {
                margin-bottom: 24px;
              }
            }
          }
        }
        :deep(.readonlyMode) {
          .common-form {
            .basicInfo {
              padding-bottom: 24px;
              .commonUl-li {
                .last-line {
                  margin-bottom: 0;
                }
                .custom-form-item {
                  margin-bottom: 0;
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
