<template>
  <div class="form-body-container">
    <commonFormTitle :mode="mode" :curEditRow="curEditRow" title="变更" :needView="true" @handleBack="handleBack" v-if="showHeader"/>
    <div class="main-frame">
      <div class="main-content">
        <commonFormLeftMenu ref="commonFormLeftMenuRef" title="变更信息" hrefIdPrefix="part" :renderInfo="fieldInfo" :containerRef="scrollContainer"></commonFormLeftMenu>
        <div class="menu-content">
          <el-scrollbar ref="scrollbarRef">
            <commonFormRender :renderInfo="fieldInfo" :formData="formData" :businessType="businessType" @cancel="handleCancel" v-if="mode === 'view'"/>
            <commonFormApproveRender ref="commonFormApproveRenderRef" :renderInfo="fieldInfo" :formData="formData" :businessType="businessType" @approve="handleApprove" v-if="mode === 'approve'"/>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ProjectChangeForm',
  inheritAttrs: false
})
import { ref, onMounted } from 'vue'
import commonFormTitle from '@/components/researchManagement/commonFormTitle.vue'
import commonFormLeftMenu from '@/components/researchManagement/commonFormLeftMenu.vue'
import commonFormRender from '@/components/researchManagement/commonFormRender.vue'
import commonFormApproveRender from '@/components/researchManagement/commonFormApproveRender.vue'
import { getProjectSelectList, getProjectChangeDetail, approveProject } from '@/api/api_scientific.js'
import { ElMessage } from 'element-plus'
import { useTobeDoneStore } from '@/store/tobeDoneStore'
// eslint-disable-next-line no-unused-vars
import { enum_gender } from '@/components/researchManagement/enum/enum_researchManagement.js'
import lodash from 'lodash'

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
    default: 3
  },
  curEditRow: {
    type: Object,
    default: () => ({})
  }
})
const fieldInfo = ref([])
const projectOptions = ref([])
const getProjectList = async () => {
  const { code, data } = await getProjectSelectList({
    stage: 3
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
const formData = ref({
  changebasicInfo: [],
  participantsInfo: [],
  fileList: [],
  processTable: [],
  processList: []
})
const init = async () => {
  await getProjectList()
  fieldInfo.value = [
    {
      label: '变更记录',
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
const getData = async () => {
  const { code, data } = await getProjectChangeDetail({
    // 项目研究用projectId 我的待办用businessId，其他用id
    id: props.curEditRow.businessId || props.curEditRow.id
  })
  if (code === 10000) {
    const arr = []

    data.projectParticipantChangeRecord?.forEach(item => {
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
      // if (item?.newValue) {
      //   arr.push({ ...item.newValue, changeMethod: getChangeMethodNew(item.changeMethod) })
      // }
      // if (item?.oldValue) {
      //   arr.push({ ...item.oldValue, changeMethod: getChangeMethodOld(item.changeMethod) })
      // }
    })

    data?.projectDirectorChangeRecord.forEach(item => {
      enum_gender.forEach(v => {
        if (v.value === item.newValue) {
          item.initNewValue = item.newValue
          item.newValue = v.label
        } else if (v.value === item.oldValue) {
          item.initOldValue = item.newValue
          item.oldValue = v.label
        }
      })
    })
    formData.value = {
      changebasicInfo: data.baseChangeRecord,
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
      fileList: data.fileChangeRecord.map(file => {
        return {
          uuid: file.id,
          fileName: file.oldValue.fileName,
          submitTime: file.oldValue.createTime,
          changeMethod: file.changeMethod
        }
      }),
      projectParticipantChangeRecord: arr,
      projectDirectorChangeRecord: data.projectDirectorChangeRecord,
      approvaFileList: [],
      approvaFileListMultipleSelection: [],
      approvaRemarks: ''
    }
    console.log('formData222', formData.value)
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
  // formData.value = JSON.parse(JSON.stringify(oldFormData.value))
  console.log('执行取消')
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
    } else if (status === 'cancel') {
      // 用户点击了“取消”
      console.log('有变更，执行继续返回')
    } else if (status === 'no-change') {
      // 无变更，直接取消
      emits('handleBack')
    }
  } else {
    // 非编辑模式，直接返回
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
// 变成UI显示的变更方法
// const getChangeMethodOld = (changeMethod) => {
//   switch (changeMethod) {
//     case '修改':
//       return '原信息'
//     case '新增':
//       return '新增信息'
//     case '删除':
//       return '删除信息'
//     default:
//       return ''
//   }
// }
// const getChangeMethodNew = (changeMethod) => {
//   switch (changeMethod) {
//     case '修改':
//       return '变更信息'
//     case '新增':
//       return '新增信息'
//     case '删除':
//       return '删除信息'
//     default:
//       return ''
//   }
// }
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
        // 非通用样式，特殊处理
        :deep(.common-form) {
          .basicInfo {
            padding-bottom: 0;
            .commonUl-li {
              .width25:nth-child(4n) {
                margin-right: 0;
              }
              .last-line {
                .custom-form-item {
                  margin-bottom: 24px;
                }
              }
            }
          }
          .leaderInfo {
            padding-bottom: 0;
            .commonUl-li {
              .width25:nth-child(4n) {
                margin-right: 0;
              }
              .last-line {
                .custom-form-item {
                  margin-bottom: 24px;
                }
              }
            }
          }
          .participantsInfo {
            .el-table {
              .cell {
                padding: 0 21px;
              }
            }
          }
        }
        :deep(.readonlyMode) {
          .common-form {
            .last-line {
              margin-bottom: 0;
              .custom-form-item {
                margin-bottom: 0 !important;
              }
            }
            .basicInfo {
              padding-bottom: 24px;
            }
          }
        }
      }
    }
  }
}
</style>
