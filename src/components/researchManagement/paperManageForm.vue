<template>
  <div class="form-body-container" v-bind="$attrs">
    <commonFormTitle :mode="mode" :curEditRow="curEditRow" title="论文" @handleBack="handleBack" v-if="showHeader"/>
    <div class="main-frame">
      <div class="main-content">
        <commonFormLeftMenu ref="commonFormLeftMenuRef" title="论文管理" hrefIdPrefix="part" :renderInfo="fieldInfo" :containerRef="scrollContainer"></commonFormLeftMenu>
        <div class="menu-content">
          <el-scrollbar ref="scrollbarRef">
            <commonFormEditRender ref="commonFormEditRenderRef" :renderInfo="fieldInfo" :formData="formData" :businessType="businessType" @submit="handleSubmit" @cancel="handleCancel" v-if="mode === 'edit'" :auditStatus="curEditRow?.auditStatus || 0"/>
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
  name: 'PaperManageForm',
  inheritAttrs: false
})
import { ref, onMounted } from 'vue'
import commonFormTitle from '@/components/researchManagement/commonFormTitle.vue'
import commonFormLeftMenu from '@/components/researchManagement/commonFormLeftMenu.vue'
import commonFormEditRender from '@/components/researchManagement/commonFormEditRender.vue'
import commonFormRender from '@/components/researchManagement/commonFormRender.vue'
import commonFormApproveRender from '@/components/researchManagement/commonFormApproveRender.vue'
import { enum_journal_level, enum_gender, enum_author_type, enum_paper_type } from '@/components/researchManagement/enum/enum_researchManagement.js'
import { getUserSelectList, savePaper, getPaperDetail, approveProject, updatePaper, getProjectSelectList } from '@/api/api_scientific.js'
import { getAngencyAndDepartmentTreeList } from '@/api/api_home'
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
    default: 'edit'
  },
  businessType: {
    type: Number,
    default: 1
  },
  curEditRow: {
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
        label: item.name,
        value: item.id,
        departmentId: item.departmentId,
        departmentName: item.departmentName
      }
    })
  }
}
const getDepartmentList = async () => {
  const { code, data } = await getAngencyAndDepartmentTreeList()
  if (code === 10000) {
    departmentOptions.value = data || []
  }
}
const fieldInfo = ref([])
const projectOptions = ref([])
const getProjectList = async () => {
  const { code, data } = await getProjectSelectList({
    stage: props.businessType
  })
  if (code === 10000) {
    data.forEach(item => {
      projectOptions.value.push({
        label: item.projectName,
        value: item.id,
        ...item
      })
    })
  }
}
const init = async () => {
  if (props.mode === 'edit') {
    // 获取姓名和科室下拉列表
    await getNameList()
    await getDepartmentList()
    await getProjectList()
  }
  fieldInfo.value = [
    {
      label: '基本信息',
      component: 'ul-li',
      show: true,
      className: 'basicInfo',
      children: [
        {
          label: '论文标题',
          key: 'thesisTitle',
          component: 'el-input',
          type: 'text',
          className: 'width25',
          rules: [{
            required: true,
            message: '论文标题为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '第一单位',
          key: 'firstUnit',
          component: 'el-input',
          type: 'text',
          disabled: props.page === 'newProjectChange',
          className: 'width25',
          rules: [{
            required: true,
            message: '第一单位为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '科室',
          key: 'departmentId',
          viewKey: 'departmentName',
          component: 'el-cascader',
          enums: departmentOptions.value,
          className: 'width25',
          rules: [{
            required: true,
            message: '科室为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '发表年月',
          key: 'publicationDate',
          component: 'el-date-picker',
          type: 'month',
          customFormat: true,
          format: 'YYYY-MM',
          className: 'width25',
          rules: [{
            required: true,
            message: '发表年月为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '登记日期',
          key: 'registrationDate',
          component: 'el-date-picker',
          type: 'date',
          customFormat: true,
          format: 'YYYY-MM-DD',
          className: 'width25',
          rules: [{
            required: true,
            message: '登记日期为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '影响因子',
          key: 'impactFactor',
          component: 'el-input-number',
          type: 'number',
          precision: 2,
          max: 10000,
          min: 0,
          className: 'width25'
        },
        {
          label: '杂志名称',
          key: 'journalName',
          component: 'el-input',
          type: 'text',
          className: 'width25',
          rules: [{
            required: true,
            message: '杂志名称为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '杂志简称',
          key: 'journalAbbreviation',
          component: 'el-input',
          type: 'text',
          className: 'width25'
        },
        {
          label: '卷',
          key: 'volume',
          component: 'el-input',
          type: 'text',
          className: 'width25',
          rules: [{
            required: true,
            message: '卷为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '期',
          key: 'issue',
          component: 'el-input',
          type: 'text',
          className: 'width25',
          rules: [{
            required: true,
            message: '期为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '论文类型',
          key: 'thesisType',
          component: 'el-select',
          enums: enum_paper_type,
          className: 'width25',
          rules: [{
            required: true,
            message: '论文类型为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '期刊等级',
          key: 'journalLevel',
          component: 'el-select',
          enums: enum_journal_level,
          className: 'width25',
          rules: [{
            required: true,
            message: '期刊等级为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '科研秘书',
          key: 'academicSecretary',
          component: 'el-input-query',
          type: 'text',
          className: 'width25 last-line',
          rules: [{
            required: true,
            message: '科研秘书为必填项',
            trigger: 'change'
          }]
        }
      ]
    },
    {
      label: '作者',
      labelDesc: '*请列出所有作者',
      key: 'srmThesisPersonList',
      component: 'el-table',
      className: 'participantsInfo',
      show: true,
      addText: '添加1行作者信息',
      maxCount: 100,
      border: false,
      // needDrag: true,
      header: [
        {
          label: '序号',
          key: 'serialNumber',
          component: '',
          type: '',
          width: 40
        },
        {
          label: '是否院内',
          key: 'isOurCollege',
          component: 'el-checkbox',
          type: 'checkbox',
          width: props.mode === 'edit' ? 39 : 80
        },
        {
          label: '姓名',
          key: 'name',
          component: 'el-input',
          type: 'text',
          required: true,
          placeholder: '请填写或查询',
          operation: 'query',
          width: props.mode === 'edit' ? 110 : 80,
          rules: [{
            required: true,
            message: '姓名为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '性别',
          key: 'gender',
          viewKey: 'genderName',
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
          width: props.mode === 'edit' ? 100 : 110,
          rules: [{
            required: true,
            message: '单位名称为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '类型',
          key: 'type',
          component: 'el-select',
          enums: enum_author_type,
          required: true,
          width: props.mode === 'edit' ? 80 : 55,
          rules: [{
            required: true,
            message: '类型为必填项',
            trigger: 'change'
          }],
          onChange: async (value, row, localFormData) => {
            const selectedItem = enum_author_type.find(item => item.value === value)
            if (selectedItem) {
              console.log('selectedItem', selectedItem, row)
              const authorTypes = ['第一作者', '通讯作者']
              const existingType = authorTypes.find(type =>
                localFormData.value.srmThesisPersonList.filter(item => item.type === type).length > 1
              )
              if (existingType) {
                ElMessage.error(`${existingType}已存在`)
                row.type = ''
              }
            }
          }

        },
        {
          label: '操作',
          key: '',
          component: 'el-button',
          width: props.mode === 'edit' ? 30 : 50,
          editBtns: ['删除']
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
          width: props.mode === 'edit' ? 40 : 32
        },
        {
          label: '是否计入本项目',
          key: 'statisticFlag',
          component: 'el-checkbox',
          type: 'checkbox',
          width: props.mode === 'edit' ? 50 : 100
        },
        {
          label: '项目名称',
          key: 'projectId',
          viewKey: 'projectName',
          component: 'el-select',
          width: props.mode === 'edit' ? 120 : 100,
          enums: projectOptions.value,
          onChange: async (value, row) => {
            const selectedItem = projectOptions.value.find(item => item.value === value)
            if (selectedItem) {
              console.log('selectedItem', selectedItem, row)
              row.projectId = selectedItem.id
              row.projectCode = selectedItem.projectCode
              row.directorName = selectedItem.projectDirectorName
              row.agencyName = selectedItem.dependAgencyName
            } else {
              row.projectId = ''
              row.projectCode = ''
              row.directorName = ''
              row.agencyName = ''
            }
          }
        },
        {
          label: '项目编号',
          key: 'projectCode',
          component: 'el-input',
          type: 'text',
          disabled: true,
          width: 120
        },
        {
          label: '负责人',
          key: 'directorName',
          component: 'el-input',
          type: 'text',
          disabled: true,
          width: props.mode === 'edit' ? 120 : 100
        },
        {
          label: '单位名称',
          key: 'agencyName',
          component: 'el-input',
          type: 'text',
          disabled: true,
          width: props.mode === 'edit' ? 120 : 100
        },
        {
          label: '操作',
          key: '',
          component: 'el-button',
          width: props.mode === 'edit' ? 25 : 50,
          editBtns: ['删除']
        }
      ]
    },
    {
      label: '相关附件',
      labelDesc: '*附件上传论文全文',
      component: 'el-upload',
      show: true,
      key: 'fileList',
      accept: '.pdf, .docx, .xls, .xlsx',
      className: 'fileListInfo',
      selection: true,
      multipleSelectionKey: 'fileListMultipleSelection',
      header: [
        {
          label: '序号',
          key: '',
          width: props.mode === 'edit' ? 85 : 70
        },
        {
          label: '文件',
          key: 'fileName',
          width: props.mode === 'edit' ? 118 : 90
        },
        {
          label: props.mode === 'edit' ? '上传状态' : '提交时间',
          key: props.mode === 'edit' ? 'uploadStatus' : 'submitTime',
          width: props.mode === 'edit' ? 140 : 80
        },
        {
          label: '提交人',
          key: 'creator',
          width: 80,
          hidden: props.mode === 'edit'
        },
        {
          label: '操作',
          key: '',
          component: 'el-button',
          width: props.page === 'newProjectChange' ? 36 : 30,
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
      show: ((props.mode === 'view' && props.curEditRow.auditStatus !== 1) || props.mode.includes('approve')) && !props.projectId,
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
          width: 120
        },
        {
          label: '发起/审批时间',
          key: 'createTime',
          width: props.page === 'newProjectChange' ? 70 : 60
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
          width: ['edit', 'approve'].includes(props.mode) ? 140 : 100
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
          width: ['edit', 'approve'].includes(props.mode) ? 30 : 30,
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
  thesisTitle: '论文标题', // 论文标题
  firstUnit: '第一单位', // 第一单位
  departmentId: '', // 科室
  publicationDate: '2025-09', // 发表年月
  registrationDate: '2025-09-01', // 登记日期
  impactFactor: 81, // 影响因子
  journalName: '杂志名称', // 杂志名称
  journalAbbreviation: '杂志简称', // 杂志简称
  volume: '卷', // 卷
  issue: '期', // 期
  thesisType: '期刊论文', // 论文类型
  journalLevel: '中文核心', // 期刊等级
  academicSecretary: '张三', // 科研秘书
  srmThesisPersonList: [], // 作者
  srmBizProjectList: [], // 科研项目
  fileList: [],
  fileListMultipleSelection: [],
  researchFileList: [],
  researchFileListMultipleSelection: [],
  processTable: [],
  processList: [],
  approvaFileList: [],
  approvaFileListMultipleSelection: [],
  approvaRemarks: ''
})
const commonFormEditRenderRef = ref(null)
const commonFormApproveRenderRef = ref(null)
const getData = async (id) => {
  const res = await getPaperDetail({
    id
  })
  if (res.code === 10000) {
    const data = res.data
    console.log('data', data)
    formData.value = {
      thesisTitle: data.thesisTitle,
      firstUnit: data.firstUnit,
      publicationDate: data.publicationDate,
      registrationDate: data.registrationDate,
      impactFactor: data.impactFactor !== '' ? Number(data.impactFactor) : null,
      journalName: data.journalName,
      journalAbbreviation: data.journalAbbreviation,
      departmentId: data.agencyId ? [data.agencyId, data.departmentId] : '',
      departmentName: data.departmentName,
      volume: data.volume,
      issue: data.issue,
      thesisType: data.thesisType,
      journalLevel: data.journalLevel,
      academicSecretary: data.academicSecretary,
      srmThesisPersonList: data.srmThesisPersonList.map(item => {
        return {
          id: item.id,
          isOurCollege: item.isOurCollege,
          name: item.name,
          gender: item.gender ? Number(item.gender) : null,
          genderName: item.genderDesc,
          workNo: item.workNo,
          birthDate: item.birthDate,
          departmentName: item.departmentName,
          unitName: item.unitName,
          type: item.type
        }
      }),
      srmBizProjectList: data.srmBizProjectList.map(item => {
        return {
          id: item.id,
          projectId: item.projectId,
          projectCode: item.projectCode,
          projectName: item.projectName,
          directorName: item.directorName,
          agencyName: item.agencyName,
          statisticFlag: item.statisticFlag
        }
      }),
      fileList: data.files?.map(item => {
        return {
          id: item.id,
          fileName: item.fileName,
          submitTime: item.createTime,
          fileUrl: item.fileUrl,
          creator: item.creator
        }
      }),
      fileListMultipleSelection: [],
      researchFileList: data.researchFileList?.map(item => {
        return {
          id: item.id,
          fileName: item.fileName,
          creator: item.creator,
          submitTime: item.createTime,
          fileUrl: item.fileUrl
        }
      }),
      researchFileListMultipleSelection: [],
      processTable: data.flowOverviewVO?.flowTaskHistoryList?.map(item => ({
        handlerName: item.handlerName,
        stageName: item.stageName,
        auditRes: item.auditRes,
        auditRemarks: item.auditRemarks,
        createTime: item.createTime,
        fileVOList: item.fileVOList?.map(file => ({
          fileName: file.fileName,
          fileUrl: file.fileUrl
        })) || []
      })),
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
  if (props.curEditRow?.businessId || props.curEditRow?.id) {
    getData(props.curEditRow?.businessId || props.curEditRow?.id)
  }
})
// 取消编辑
const handleCancel = () => {
  console.log('执行取消')
  emits('handleBack')
}
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
    thesisTitle: editFormData.thesisTitle,
    fileIds: editFormData.fileList.map(item => item.id),
    firstUnit: editFormData.firstUnit,
    departmentId: editFormData.departmentId && editFormData.departmentId.length > 0 ? editFormData.departmentId[1] : '',
    publicationDate: editFormData.publicationDate || '',
    registrationDate: editFormData.registrationDate || '',
    impactFactor: editFormData.impactFactor || '',
    journalName: editFormData.journalName,
    journalAbbreviation: editFormData.journalAbbreviation,
    volume: editFormData.volume,
    issue: editFormData.issue,
    thesisType: editFormData.thesisType || '',
    journalLevel: editFormData.journalLevel || '',
    academicSecretary: editFormData.academicSecretary,
    srmBizProjectList: editFormData.srmBizProjectList.map(item => {
      return {
        projectId: item.projectId || '',
        statisticFlag: item.statisticFlag
      }
    }),
    srmThesisPersonList: editFormData.srmThesisPersonList.map(item => {
      return {
        isOurCollege: item.isOurCollege,
        name: item.name,
        gender: item.gender || '',
        workNo: item.workNo,
        birthDate: item.birthDate,
        departmentName: item.departmentName,
        unitName: item.unitName,
        type: item.type || ''
      }
    })
  }
  console.log('params', params)
  if (!props.curEditRow?.id) {
    const { code } = await savePaper(params)
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
    const { code } = await updatePaper(params)
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
              .width25:nth-child(4n) {
                margin-right: 0 !important;
              }
              .last-line {
                .custom-form-item {
                  margin-bottom: 24px;
                }
              }
            }
          }
        }
        :deep(.editMode) {
          .common-form {
            .participantsInfo {
              .el-table {
                .cell {
                  padding: 0 10px;
                }
              }
              .el-table__header {
                tr {
                  th:nth-child(1),
                  th:nth-child(2) {
                    .cell {
                      display: flex;
                      justify-content: center;
                      padding: 0;
                    }
                  }
                }
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
