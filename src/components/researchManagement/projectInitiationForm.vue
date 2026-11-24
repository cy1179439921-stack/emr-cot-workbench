<template>
  <div class="form-body-container" v-bind="$attrs">
    <commonFormTitle :mode="mode" :curEditRow="curEditRow" title="立项" @handleBack="handleBack" v-if="showHeader"/>
    <div class="main-frame">
      <div class="main-content">
        <commonFormLeftMenu ref="commonFormLeftMenuRef" title="项目立项" hrefIdPrefix="part" :renderInfo="fieldInfo" :containerRef="scrollContainer"></commonFormLeftMenu>
        <div class="menu-content">
          <el-scrollbar ref="scrollbarRef">
            <panoramaTitle title="立项" :id="curEditRow.projectApprovalId" v-if="['projectPanoramaForm'].includes(page)"/>
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
  name: 'ProjectInitiationForm',
  inheritAttrs: false
})
import { ref, onMounted, nextTick } from 'vue'
import commonFormTitle from '@/components/researchManagement/commonFormTitle.vue'
import commonFormLeftMenu from '@/components/researchManagement/commonFormLeftMenu.vue'
import commonFormEditRender from '@/components/researchManagement/commonFormEditRender.vue'
import commonFormRender from '@/components/researchManagement/commonFormRender.vue'
import commonFormApproveRender from '@/components/researchManagement/commonFormApproveRender.vue'
import panoramaTitle from '@/components/researchManagement/panoramaTitle.vue'
import { enum_project_type, enum_project_level, enum_project_source, enum_project_property, enum_gender, enum_education, enum_degree, enum_title } from '@/components/researchManagement/enum/enum_researchManagement.js'
import { validateMobileNumber, validateFixedPhone, validateIdCard } from '@/utils/validate.js'
import { getUserSelectList, saveProject, getProjectDetail, approveProject, updateProject, getProjectSelectList, saveProjectChange, updateProjectChange, getUpdateChangeDetail, getProjectInitialPanoramaDetail } from '@/api/api_scientific.js'
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
    default: 'edit'
  },
  businessType: {
    type: Number,
    default: 1
  },
  curEditRow: {
    type: Object,
    default: () => ({})
  },
  projectId: {
    type: String,
    default: ''
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
    stage: props.businessType
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
const selectedProjectId = ref('')
const init = async () => {
  if (props.mode === 'edit') {
    // 获取姓名和科室下拉列表
    await getNameList()
    await getDepartmentList()
  }
  // 项目变更页面引用
  if (props.page === 'newProjectChange') {
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
          label: '项目名称',
          key: 'projectName',
          component: props.page === 'newProjectChange' ? 'el-select' : 'el-input',
          type: 'text',
          className: 'width25',
          enums: projectOptions.value,
          rules: [{
            required: true,
            message: '项目名称为必填项',
            trigger: 'blur'
          }],
          onChange: async (value, localFormData) => {
            const selectedItem = projectOptions.value.find(item => item.value === value)
            if (selectedItem) {
              localFormData.value.projectCode = selectedItem.projectCode || ''
              selectedProjectId.value = selectedItem.value
              await getData(selectedItem.value, 'change')
              nextTick(() => {
                commonFormEditRenderRef.value?.validateForm()
              })
            } else {
              selectedProjectId.value = ''
              formData.value = {
                projectName: '',
                projectCode: '',
                researchDateRange: ['', ''],
                startDate: '',
                totalMoney: null,
                specialMoney: null,
                selfFinancingMoney: null,
                matchMoney: null,
                projectType: null,
                projectTypeName: '',
                projectLevel: null,
                projectLevelName: '',
                projectSource: null,
                projectSourceName: '',
                projectSubkey: '',
                projectAttribute: null,
                projectAttributeName: '',
                dependAgencyId: '',
                dependAgencyName: '',
                remarks: '',
                leader_userName: '',
                leader_userId: '',
                leader_sex: null,
                leader_sexName: '',
                leader_workCode: '',
                leader_departmentId: '',
                leader_departmentName: '',
                leader_birthday: '',
                leader_phone: '',
                leader_educationalBackground: '',
                leader_degree: '',
                leader_email: '',
                leader_idCardNum: '',
                leader_title: '',
                leader_fixedTelephone: '',
                projectParticipantList: [],
                fileList: [],
                fileListMultipleSelection: [],
                researchFileList: [],
                researchFileListMultipleSelection: [],
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
          disabled: props.page === 'newProjectChange',
          className: 'width25',
          rules: [{
            required: true,
            message: '项目编号为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '研究期限',
          key: 'researchDateRange',
          component: 'el-date-picker',
          type: 'daterange',
          customFormat: true,
          format: 'YYYY-MM-DD',
          className: 'width25',
          rules: [{
            required: true,
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
          type: 'month',
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
          label: '总经费（万）',
          key: 'totalMoney',
          component: 'el-input-number',
          type: 'number',
          precision: 6,
          max: 10000,
          min: 0,
          className: 'width25',
          rules: [{
            required: true,
            message: '总经费（万）为必填项',
            trigger: 'blur'
          }]
        },
        {
          label: '专项经费（万）',
          key: 'specialMoney',
          component: 'el-input-number',
          type: 'number',
          precision: 6,
          max: 10000,
          min: 0,
          className: 'width25'
        },
        {
          label: '自筹经费（万）',
          key: 'selfFinancingMoney',
          component: 'el-input-number',
          type: 'number',
          precision: 6,
          max: 10000,
          min: 0,
          className: 'width25'
        },
        {
          label: '匹配经费（万）',
          key: 'matchMoney',
          component: 'el-input-number',
          type: 'number',
          precision: 6,
          max: 10000,
          min: 0,
          className: 'width25'
        },
        {
          label: '项目类别',
          key: 'projectType',
          viewKey: 'projectTypeName',
          component: 'el-select',
          enums: enum_project_type,
          className: 'width25',
          rules: [{
            required: true,
            message: '项目类别为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '项目级别',
          key: 'projectLevel',
          viewKey: 'projectLevelName',
          component: 'el-select',
          enums: enum_project_level,
          className: 'width25',
          rules: [{
            required: true,
            message: '项目级别为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '项目来源',
          key: 'projectSource',
          viewKey: 'projectSourceName',
          component: 'el-select',
          enums: enum_project_source,
          className: 'width25',
          rules: [{
            required: true,
            message: '项目来源为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '项目子项',
          key: 'projectSubkey',
          component: 'el-input',
          type: 'text',
          className: 'width25',
          rules: [{
            required: true,
            message: '项目子项为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '项目属性',
          key: 'projectAttribute',
          viewKey: 'projectAttributeName',
          component: 'el-select',
          enums: enum_project_property,
          className: 'width25'
        },
        {
          label: '依托单位',
          key: 'dependAgencyId',
          viewKey: 'dependAgencyName',
          component: 'el-select',
          enums: departmentOptions,
          className: 'width25'
        },
        {
          label: '备注',
          key: 'remarks',
          component: 'el-input',
          type: 'textarea',
          maxlength: 1000,
          className: 'width100 last-line'
        }
      ]
    },
    {
      label: '项目负责人信息',
      component: 'ul-li',
      className: 'leaderInfo',
      show: true,
      children: [
        {
          label: '姓名',
          key: 'leader_userId',
          viewKey: 'leader_userName',
          component: 'el-select',
          enums: nameOptions.value,
          className: 'width25',
          filterable: true,
          rules: [{
            required: true,
            message: '姓名为必填项',
            trigger: 'change'
          }],
          onChange: (value, localFormData) => {
            // 找到选中的用户
            const selectedUser = nameOptions.value.find(user => user.value === value)
            console.log('selectedUser', selectedUser)
            if (selectedUser) {
              localFormData.value.leader_userId = selectedUser.value || ''
              localFormData.value.leader_departmentName = selectedUser.departmentName || ''
              localFormData.value.leader_departmentId = selectedUser.departmentId || ''
            } else {
              localFormData.value.leader_userId = ''
              localFormData.value.leader_departmentName = ''
              localFormData.value.leader_departmentId = ''
            }
          }
        },
        {
          label: '性别',
          key: 'leader_sex',
          viewKey: 'leader_sexName',
          component: 'el-select',
          enums: enum_gender,
          className: 'width25',
          rules: [{
            required: true,
            message: '性别为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '工号',
          key: 'leader_workCode',
          component: 'el-input',
          type: 'text',
          className: 'width25'
        },
        {
          label: '科室',
          key: 'leader_departmentName',
          component: 'el-input',
          type: 'text',
          className: 'width25',
          disabled: true
          // rules: [{
          //   required: true,
          //   message: '科室为必填项',
          //   trigger: 'change'
          // }]
        },
        {
          label: '出生年月',
          key: 'leader_birthday',
          component: 'el-date-picker',
          type: 'month',
          customFormat: true,
          format: 'YYYY-MM',
          className: 'width25'
        },
        {
          label: '手机号',
          key: 'leader_phone',
          component: 'el-input',
          maxlength: 11,
          type: 'text',
          className: 'width25',
          rules: [{
            validator: validateMobileNumber(false), trigger: 'blur'
          }]
        },
        {
          label: '学历',
          key: 'leader_educationalBackground',
          component: 'el-select',
          enums: enum_education,
          className: 'width25'
        },
        {
          label: '学位',
          key: 'leader_degree',
          component: 'el-select',
          enums: enum_degree,
          className: 'width25'
        },
        {
          label: '电子邮箱',
          key: 'leader_email',
          component: 'el-input',
          type: 'text',
          className: 'width25 last-line'
        },
        {
          label: '固定电话',
          key: 'leader_fixedTelephone',
          component: 'el-input',
          type: 'text',
          className: 'width25 last-line',
          rules: [{
            validator: validateFixedPhone(false), trigger: 'blur'
          }]
        },
        {
          label: '职称',
          key: 'leader_title',
          component: 'el-select',
          enums: enum_title,
          className: 'width25 last-line'
        },
        {
          label: '身份证号',
          key: 'leader_idCardNum',
          component: 'el-input',
          type: 'text',
          className: 'width25 last-line',
          rules: [{
            validator: validateIdCard(false), trigger: 'blur'
          }]
        }
      ]
    },
    {
      label: '项目参与人信息',
      key: 'projectParticipantList',
      component: 'el-table',
      className: 'participantsInfo',
      show: true,
      addText: '添加1行项目参与人信息',
      maxCount: 100,
      border: false,
      // needDrag: true,
      header: [
        {
          label: '是否院内',
          key: 'inHospital',
          component: 'el-checkbox',
          type: 'checkbox',
          width: props.mode === 'edit' ? 39 : 80
        },
        {
          label: '姓名',
          key: 'userName',
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
          key: 'sex',
          viewKey: 'sexName',
          component: 'el-select',
          enums: enum_gender,
          width: 80
        },
        {
          label: '工号',
          key: 'workCode',
          component: 'el-input',
          type: 'text',
          width: 80
        },
        {
          label: '出生年月',
          key: 'birthday',
          component: 'el-date-picker',
          type: 'month',
          customFormat: true,
          format: 'YYYY-MM',
          width: 80
        },
        {
          label: '学位',
          key: 'degree',
          component: 'el-select',
          enums: enum_degree,
          required: true,
          width: 80,
          rules: [{
            required: true,
            message: '学位为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '职称',
          key: 'title',
          component: 'el-select',
          enums: enum_title,
          required: true,
          width: 80,
          rules: [{
            required: true,
            message: '职称为必填项',
            trigger: 'change'
          }]
        },
        {
          label: '单位名称',
          key: 'unitName',
          component: 'el-input',
          type: 'text',
          required: true,
          width: 80,
          rules: [{
            required: true,
            message: '单位名称为必填项',
            trigger: 'blur'
          }]
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
      label: '立项任务书及相关附件',
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
          width: props.mode === 'edit' ? 85 : 50
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
        // {
        //   label: '提交人',
        //   key: 'creator',
        //   hidden: props.page !== 'projectPanoramaForm',
        //   width: 100
        // },
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
      label: '研究附件',
      component: 'el-upload',
      show: props.mode === 'view' && props.page === 'projectPanoramaForm',
      key: 'researchFileList',
      accept: '.pdf, .docx, .xls, .xlsx',
      className: 'researchFileListInfo',
      selection: true,
      multipleSelectionKey: 'researchFileListMultipleSelection',
      header: [
        {
          label: '序号',
          key: '',
          width: 50
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
          label: '提交人',
          key: 'creator',
          width: 100
        },
        {
          label: '操作',
          key: '',
          component: 'el-button',
          width: 30,
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
  projectName: '',
  projectCode: '',
  researchDateRange: ['2025-09-01', '2026-09-30'],
  startDate: '2025-09',
  totalMoney: 103,
  specialMoney: 81,
  selfFinancingMoney: 16,
  matchMoney: 6,
  projectType: 2,
  projectTypeName: '',
  projectLevel: 1,
  projectLevelName: '',
  projectSource: 2,
  projectSourceName: '国家科技支撑计划',
  projectSubkey: '项目子项1',
  projectAttribute: 1,
  projectAttributeName: '牵头',
  dependAgencyId: '',
  dependAgencyName: '',
  remarks: '北京市海淀区西二旗333',
  leader_userName: '',
  leader_userId: '',
  leader_sex: 1,
  leader_sexName: '男',
  leader_workCode: '工号001',
  leader_departmentId: '',
  leader_departmentName: '',
  leader_birthday: '1970-01',
  leader_phone: '15010905851',
  leader_educationalBackground: '研究生',
  leader_degree: '博士',
  leader_email: '110@email.com',
  leader_idCardNum: '11010819470418489X',
  leader_title: '高级工程师',
  leader_fixedTelephone: '6573811',
  projectParticipantList: [],
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
const getData = async (projectId, operate) => {
  let res = {}
  if (props.businessType === 3 && props.curEditRow.id && !operate) { // 项目变更且是修改模式
    res = await getUpdateChangeDetail({
      id: props.curEditRow.id
    })
    if (res.code === 10000) {
      // 项目变更的重新提交和修改模式，需要传入projectId
      selectedProjectId.value = res.data.projectId
    }
  } else if (props.page === 'projectPanoramaForm') {
    res = await getProjectInitialPanoramaDetail({
      id: projectId
    })
  } else {
    res = await getProjectDetail({
      id: projectId
    })
  }
  if (res.code === 10000) {
    const data = res.data
    console.log('data', data)
    formData.value = {
      projectName: (projectId || props.businessType === 1) ? data.projectName : data.projectId,
      projectCode: data.projectCode,
      researchDateRange: data.researchStartTime && data.researchEndTime ? [data.researchStartTime, data.researchEndTime] : ['', ''],
      startDate: data.projectApprovalYear && data.projectApprovalMonth ? `${data.projectApprovalYear}-${String(data.projectApprovalMonth).padStart(2, '0')}` : '',
      totalMoney: data.totalMoney,
      specialMoney: data.specialMoney,
      selfFinancingMoney: data.selfFinancingMoney,
      matchMoney: data.matchMoney,
      projectType: data.projectType,
      projectTypeName: data.projectTypeName,
      projectLevel: data.projectLevel,
      projectLevelName: data.projectLevelName,
      projectSource: data.projectSource,
      projectSourceName: data.projectSourceName,
      projectSubkey: data.projectSubkey,
      projectAttribute: data.projectAttribute,
      projectAttributeName: data.projectAttributeName,
      dependAgencyId: data.dependAgencyId,
      dependAgencyName: data.dependAgencyName,
      remarks: data.remarks,
      leader_userName: data.projectDirector.userName,
      leader_userId: data.projectDirector.userId,
      leader_sex: data.projectDirector.sex,
      leader_sexName: data.projectDirector.sex === 1 ? '男' : data.projectDirector.sex === 2 ? '女' : null,
      leader_workCode: data.projectDirector.workCode,
      leader_departmentId: data.projectDirector.departmentId,
      leader_departmentName: data.projectDirector.departmentName,
      leader_birthday: data.projectDirector.birthday,
      leader_phone: data.projectDirector.phone,
      leader_educationalBackground: data.projectDirector.educationalBackground,
      leader_degree: data.projectDirector.degree,
      leader_email: data.projectDirector.email,
      leader_idCardNum: data.projectDirector.idCardNum,
      leader_title: data.projectDirector.title,
      leader_fixedTelephone: data.projectDirector.fixedTelephone,
      projectParticipantList: data.projectParticipantList.map(item => {
        return {
          id: item.id,
          inHospital: item.inHospital,
          userName: item.userName,
          userId: item.userId,
          sex: item.sex,
          sexName: item.sex === 1 ? '男' : item.sex === 2 ? '女' : null,
          workCode: item.workCode,
          birthday: item.birthday,
          degree: item.degree,
          title: item.title,
          unitName: item.unitName
        }
      }),
      fileList: data.fileList?.map(item => {
        return {
          id: item.id,
          fileName: item.fileName,
          submitTime: item.createTime,
          fileUrl: item.fileUrl
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
  if (props.projectId || props.curEditRow?.projectId) {
    // props.projectId是查看项目信息按钮使用
    getData(props.projectId || props.curEditRow.projectId)
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
  if (props.businessType === 3 && !editFormData.projectName) {
    ElMessage.error('项目名称为必填项')
    return
  }
  const params = {
    id: props.curEditRow?.id,
    auditStatus, // 1暂存 2提交
    dependAgencyId: editFormData.dependAgencyId,
    fileIds: editFormData.fileList.map(item => item.id),
    matchMoney: editFormData.matchMoney,
    projectApprovalMonth: editFormData.startDate ? Number(editFormData.startDate.split('-')[1]) : '',
    projectApprovalYear: editFormData.startDate ? Number(editFormData.startDate.split('-')[0]) : '',
    projectAttribute: editFormData.projectAttribute,
    projectCode: editFormData.projectCode,
    projectDirector: {
      birthday: editFormData.leader_birthday,
      degree: editFormData.leader_degree,
      departmentId: editFormData.leader_departmentId,
      educationalBackground: editFormData.leader_educationalBackground,
      email: editFormData.leader_email,
      fixedTelephone: editFormData.leader_fixedTelephone,
      idCardNum: editFormData.leader_idCardNum,
      phone: editFormData.leader_phone,
      sex: editFormData.leader_sex,
      title: editFormData.leader_title,
      userId: editFormData.leader_userId,
      workCode: editFormData.leader_workCode
    },
    projectLevel: editFormData.projectLevel,
    projectName: editFormData.projectName,
    projectParticipantList: editFormData.projectParticipantList,
    projectSource: editFormData.projectSource,
    projectSubkey: editFormData.projectSubkey,
    projectType: editFormData.projectType,
    remarks: editFormData.remarks,
    researchEndTime: editFormData.researchDateRange ? editFormData.researchDateRange[1] : '',
    researchStartTime: editFormData.researchDateRange ? editFormData.researchDateRange[0] : '',
    selfFinancingMoney: editFormData.selfFinancingMoney,
    specialMoney: editFormData.specialMoney,
    totalMoney: editFormData.totalMoney
  }
  console.log('params', params)
  if (props.businessType === 1) { // 项目立项
    console.log('执行项目立项')
    if (!props.curEditRow?.id) {
      const { code } = await saveProject(params)
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
      const { code } = await updateProject(params)
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
  } else if (props.businessType === 3) { // 项目变更
    params.projectId = selectedProjectId.value
    console.log('执行项目变更')
    if (!props.curEditRow?.id) {
      const { code } = await saveProjectChange(params)
      if (code === 10000) {
        console.log(auditStatus === 1)
        if (auditStatus === 1) {
          ElMessage.success('已暂存，可以随时回来继续')
        } else {
          ElMessage.success('提交成功')
        }
        emits('handleBack')
      }
    } else {
      const { code } = await updateProjectChange(params)
      if (code === 10000) {
        if (auditStatus === 1) {
          ElMessage.success('已暂存，可以随时回来继续')
        } else {
          ElMessage.success('提交成功')
        }
        emits('handleBack')
      }
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
          .leaderInfo {
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
                  th:nth-child(1) {
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
            .basicInfo,
            .leaderInfo {
              padding-bottom: 24px;
            }
          }
        }
      }
    }
  }
}
</style>
