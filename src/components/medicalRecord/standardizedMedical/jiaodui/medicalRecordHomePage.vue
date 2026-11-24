<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header borderB">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">病案首页</div>
          <!-- <div class="title-line"> -->
          <!-- <div class="left">就诊号：{{formData.visit_id || '-'}}</div> -->
          <!-- <div class="right">病案号：{{formData.document_id || '-'}}</div> -->
          <!-- </div> -->
        </WordHighlighter>
      </header>
      <commonRecordRender :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery" :pathPrefix="'basic_information'"></commonRecordRender>
    </div>
  </template>
  <template v-else-if="isEdit && formData">
    <div class="medical-body">
      <header class="header borderB">
        <div class="typeTitle">病案首页</div>
      </header>
      <commonRecordEditRender ref="commonRecordEditRenderRef" :curMedicalInfo="curMedicalInfo" :fieldInfo="fieldInfo" :formData="formData"></commonRecordEditRender>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="(props.agencyName || '-') + '-病案首页'"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'MedicalRecordHomePage',
  inheritAttrs: false
})
// 基本信息
import { ref, watch, onMounted } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonRecordEditRender from '@/components/medicalRecord/standardizedMedical/jiaodui/commonRecordEditRender.vue'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
const props = defineProps({
  lightQuery: {
    type: String
  },
  curMedicalInfo: {
    type: Object
  },
  medicalRecordId: {
    type: String
  },
  agencyName: {
    type: String,
    default: '-'
  },
  isEdit: {
    type: Boolean
  },
  mode: {
    type: String
  }
})
const loading = ref(false)
const formData = ref('')
const rowCount = ref(5)
if (props.mode === 'proofread') {
  rowCount.value = 3
}
const updateRowCount = (count) => {
  rowCount.value = count
  fieldInfo[0].rowCount = count
  fieldInfo[1].rowCount = count
  fieldInfo[2].rowCount = count
  fieldInfo[3].rowCount = count
  fieldInfo[4].rowCount = count
}
watch(() => props.isEdit, (val) => {
  if (val) {
    updateRowCount(3)
  } else {
    if (props.mode === 'proofread') {
      updateRowCount(3)
    } else {
      updateRowCount(5)
    }
  }
})

// 校验住院次数
const validateInteger = (rule, value, callback) => {
  if (value || value === 0) {
    if (value < 1) {
      callback(new Error('第几次住院≥1'))
    } else if (!Number.isInteger(value)) {
      callback(new Error('第几次住院必须是整数'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}
const fieldInfo = [
  {
    label: '基本信息',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '文档编号',
        key: 'document_id',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '性别',
        key: 'sex',
        component: 'el-select',
        enums: [
          {
            label: '男',
            value: '男'
          },
          {
            label: '女',
            value: '女'
          }
        ]
      },
      {
        label: '出生日期',
        key: 'birthday',
        component: 'el-date-picker',
        type: 'date',
        customFormat: true,
        format: 'YYYY-MM-DD'
      },
      {
        label: '年龄',
        key: 'age',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '职业',
        key: 'career',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '婚姻',
        key: 'marital',
        component: 'el-select',
        enums: [
          {
            label: '未婚',
            value: '未婚'
          },
          {
            label: '已婚',
            value: '已婚'
          },
          {
            label: '离婚',
            value: '离婚'
          },
          {
            label: '丧偶',
            value: '丧偶'
          }
        ]
      }
    ]
  },
  {
    label: '入出院信息',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '入院时间',
        key: 'enter_time',
        component: 'el-date-picker'
      },
      {
        label: '出院时间',
        key: 'exit_time',
        component: 'el-date-picker'
      },
      {
        label: '住院天数',
        key: 'inhospital_days',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '第几次住院',
        key: 'inhospital_number',
        component: 'el-input-number',
        type: 'number',
        stepStrictly: true,
        rules: [{
          validator: validateInteger,
          trigger: 'blur'
        }]
      },
      {
        label: '入院途径',
        key: 'enter_way',
        component: 'el-select',
        enums: [
          {
            label: '急诊',
            value: '急诊'
          },
          {
            label: '门诊',
            value: '门诊'
          },
          {
            label: '其他医疗医院转入',
            value: '其他医疗医院转入'
          },
          {
            label: '其他',
            value: '其他'
          }
        ]
      },
      {
        label: '入院科室',
        key: 'in_department',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '出院科室',
        key: 'out_department',
        component: 'el-input',
        type: 'text'
      }
    ]
  },
  {
    label: '门（急）诊诊断信息',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '诊断名称',
        key: 'clinic_diagnosis_name',
        component: 'el-input'
      },
      {
        label: '疾病编码',
        key: 'clinic_diagnosis_icd10',
        component: 'el-input'
      }
    ]
  },
  {
    label: '出院诊断-主要诊断',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '诊断名称',
        key: 'main_diagnosis_name',
        component: 'el-input'
      },
      {
        label: '疾病编码',
        key: 'main_diagnosis_icd10',
        component: 'el-input'
      }
    ]
  },
  {
    label: '出院诊断-其他诊断',
    key: 'other_diagnosis',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行其他诊断',
    maxCount: 20,
    border: false,
    buttonText3: '一键去除首数字',
    hasInput: true,
    hasInputButtonText: '赋值编码',
    header: [
      {
        label: '序号',
        key: '',
        component: '',
        type: '',
        width: 20
      },
      {
        label: '诊断名称',
        key: 'name',
        component: 'el-input',
        type: 'text',
        width: props.mode === 'proofread' ? 174 : 100
      },
      {
        label: '疾病编码',
        key: 'code',
        component: 'el-input',
        type: 'text',
        width: props.mode === 'proofread' ? 100 : 112
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 20,
        onlyEdit: true
      }
    ]
  },
  {
    label: '手术信息',
    key: 'operations',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行手术信息',
    maxCount: 8,
    border: false,
    header: [
      {
        label: '序号',
        key: '',
        component: '',
        type: '',
        width: 20
      },
      {
        label: '手术及操作编码',
        key: 'operation_code',
        component: 'el-input',
        type: 'text',
        width: 100
      },
      {
        label: '手术及操作日期',
        key: 'operation_time',
        component: 'el-date-picker',
        type: 'date',
        customFormat: true,
        format: 'YYYY-MM-DD',
        width: 100
      },
      {
        label: '手术及操作名称',
        key: 'operation_name',
        component: 'el-input',
        type: 'text',
        width: 100
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 20,
        onlyEdit: true
      }
    ]
  }
]
if (props.isEdit) {
  updateRowCount(3)
}
const totalMedicalContent = ref()
loading.value = true
const getData = () => {
  getMedicalDetailsData(props).then(data => {
    if (data && data.jsonData) {
      totalMedicalContent.value = data.jsonData
      const content = data.jsonData
      formData.value = {
        document_id: content.document_id,
        name: content.name,
        sex: content.sex,
        birthday: content.birthday,
        age: content.age,
        career: content.career,
        marital: content.marital,
        enter_time: content.enter_time,
        inhospital_days: content.inhospital_days,
        inhospital_number: content.inhospital_number,
        in_department: content.in_department,
        out_department: content.out_department,
        enter_way: content.enter_way,
        exit_time: content.exit_time,
        address: content.address,
        clinic_diagnosis_icd10: content.clinic_diagnosis_icd10,
        clinic_diagnosis_name: content.clinic_diagnosis_name,
        main_diagnosis_icd10: content.main_diagnosis_icd10,
        main_diagnosis_name: content.main_diagnosis_name,
        other_diagnosis: [],
        operations: [],
        page_ids: content.page_ids ? content.page_ids.map(id => parseInt(id) + 1).join(',') : ''
      }
      medicalStore.setMedicalPageList(content.page_ids || [])
      medicalStore.setMedicalOrderPageList(content.page_ids || [])
      content.other_diagnosis_name.forEach((item, index) => {
        formData.value.other_diagnosis.push({
          uuid: uuidv4(),
          name: item,
          code: content.other_diagnosis_icd10[index]
        })
      })
      content.operations_name.forEach((item, index) => {
        formData.value.operations.push({
          uuid: uuidv4(),
          operation_name: item,
          operation_code: content.operations_code[index],
          operation_time: content.operations_time[index]
        })
      })
      if (medicalStore.showOperationView) {
        const rawContent = data.rawData
        Object.assign(formData.value, {
          olddocument_id: rawContent.document_id,
          oldname: rawContent.name,
          oldsex: rawContent.sex,
          oldbirthday: rawContent.birthday,
          oldage: rawContent.age,
          oldcareer: rawContent.career,
          oldmarital: rawContent.marital,
          oldenter_time: rawContent.enter_time,
          oldinhospital_days: rawContent.inhospital_days,
          oldinhospital_number: rawContent.inhospital_number,
          oldin_department: rawContent.in_department,
          oldout_department: rawContent.out_department,
          oldenter_way: rawContent.enter_way,
          oldexit_time: rawContent.exit_time,
          oldaddress: rawContent.address,
          oldclinic_diagnosis_icd10: rawContent.clinic_diagnosis_icd10,
          oldclinic_diagnosis_name: rawContent.clinic_diagnosis_name,
          oldmain_diagnosis_icd10: rawContent.main_diagnosis_icd10,
          oldmain_diagnosis_name: rawContent.main_diagnosis_name,
          oldother_diagnosis: rawContent.other_diagnosis_name?.map((item, index) => ({
            name: item,
            code: rawContent.other_diagnosis_icd10?.[index]
          })) || [],
          oldoperations: rawContent.operations_name?.map((item, index) => ({
            operation_name: item,
            operation_code: rawContent.operations_code?.[index],
            operation_time: rawContent.operations_time?.[index]
          })) || [],
          oldpage_ids: rawContent.page_ids ? rawContent.page_ids.map(id => parseInt(id) + 1).join(',') : ''
        })
      }
    } else {
      formData.value = ''
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}
onMounted(() => {
  getData()
})

const oldFormData = ref([])
// 保存旧数据
const saveOldData = () => {
  oldFormData.value = _.cloneDeep(formData.value)
}
// 恢复旧数据
const recoverOldData = () => {
  formData.value = _.cloneDeep(oldFormData.value)
  oldFormData.value = []
}
// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  let pageIds = medicalStore.editingMedical.page_ids
  if (pageIds) {
    pageIds = pageIds.replace(/，/g, ',').split(',').map(id => parseInt(id) - 1)
  }
  const params = {
    page_ids: pageIds,
    document_id: medicalStore.editingMedical.document_id,
    sex: medicalStore.editingMedical.sex,
    birthday: medicalStore.editingMedical.birthday,
    age: medicalStore.editingMedical.age,
    career: medicalStore.editingMedical.career,
    marital: medicalStore.editingMedical.marital,
    address: medicalStore.editingMedical.address,
    enter_time: medicalStore.editingMedical.enter_time,
    exit_time: medicalStore.editingMedical.exit_time,
    inhospital_days: medicalStore.editingMedical.inhospital_days,
    inhospital_number: medicalStore.editingMedical.inhospital_number,
    enter_way: medicalStore.editingMedical.enter_way,
    in_department: medicalStore.editingMedical.in_department,
    out_department: medicalStore.editingMedical.out_department,
    clinic_diagnosis_icd10: medicalStore.editingMedical.clinic_diagnosis_icd10,
    clinic_diagnosis_name: medicalStore.editingMedical.clinic_diagnosis_name,
    main_diagnosis_icd10: medicalStore.editingMedical.main_diagnosis_icd10,
    main_diagnosis_name: medicalStore.editingMedical.main_diagnosis_name,
    other_diagnosis_icd10: medicalStore.editingMedical.other_diagnosis.map(item => item.code),
    other_diagnosis_name: medicalStore.editingMedical.other_diagnosis.map(item => item.name),
    operations_code: medicalStore.editingMedical.operations.map(item => item.operation_code),
    operations_name: medicalStore.editingMedical.operations.map(item => item.operation_name),
    operations_time: medicalStore.editingMedical.operations.map(item => item.operation_time),
    country: totalMedicalContent.value.country,
    phone: totalMedicalContent.value.phone,
    id_num: totalMedicalContent.value.id_num,
    inhospital_cost: totalMedicalContent.value.inhospital_cost,
    name: totalMedicalContent.value.name
  }
  return params
}
const commonRecordEditRenderRef = ref(null)
// 检验
const getValidateResult = async () => {
  const result = await commonRecordEditRenderRef.value.validateForm()
  return result
}
defineExpose({
  saveOldData,
  recoverOldData,
  getEditingMedicalContent,
  getData,
  getValidateResult
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
</style>
