<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">{{props.agencyName || '-'}}-{{curMedicalInfo.title}}</div>
        </WordHighlighter>
      </header>
      <commonRecordRender :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery"></commonRecordRender>
    </div>
  </template>
  <template v-else-if="isEdit && formData">
    <div class="medical-body">
      <header class="header borderB">
        <div class="typeTitle">{{props.agencyName || '-'}}-{{curMedicalInfo.title}}</div>
      </header>
      <commonRecordEditRender :curMedicalInfo="curMedicalInfo" :fieldInfo="fieldInfo" :formData="formData"></commonRecordEditRender>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="props.agencyName + '-' + curMedicalInfo.title"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'InhospitalRecord',
  inheritAttrs: false
})
// 基本信息
import { ref, watch } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonRecordEditRender from '@/components/medicalRecord/standardizedMedical/commonRecordEditRender.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
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
const rowCount = ref(3)
if (props.mode === 'proofread') {
  rowCount.value = 2
}
const updateRowCount = (count) => {
  rowCount.value = count
  fieldInfo[0].rowCount = count
  fieldInfo[1].rowCount = count
}
watch(() => props.isEdit, (val) => {
  if (val) {
    updateRowCount(2)
  } else {
    if (props.mode === 'proofread') {
      updateRowCount(2)
    } else {
      updateRowCount(3)
    }
  }
})
const fieldInfo = [
  {
    label: '',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '姓名',
        key: 'name',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '入院时间',
        key: 'enter_time',
        component: 'el-date-picker'
        // customFormat: true,
        // format: 'YYYY-MM-DD HH:mm'
      },
      {
        label: '出生地',
        key: 'address',
        component: 'el-input',
        type: 'textarea'
      }
    ]
  },
  {
    label: '主诉',
    key: 'complain',
    component: 'singleDiv'

  },
  {
    label: '现病史',
    key: 'present',
    component: 'singleDiv'
  },
  {
    label: '既往史',
    key: 'past',
    component: 'singleDiv'
  },
  {
    label: '个人史',
    key: 'personal',
    component: 'singleDiv'
  },
  {
    label: '婚育史',
    key: 'marriage',
    component: 'singleDiv'
  },
  {
    label: '家族史',
    key: 'family',
    component: 'singleDiv'
  },
  {
    label: '体格检查',
    key: 'description',
    component: 'singleDiv'
  },
  {
    label: '体温（°C）',
    key: 'temperature',
    component: 'singleDiv'
  },
  {
    label: '脉搏（次/分）',
    key: 'pulse',
    component: 'singleDiv'
  },
  {
    label: '血压（收缩压/舒张压 mmHG）',
    key: 'bp',
    component: 'singleDiv'
  },
  {
    label: '呼吸（次/分）',
    key: 'respiratory',
    component: 'singleDiv'
  },
  {
    label: '身高（cm）',
    key: 'body_height',
    component: 'singleDiv'
  },
  {
    label: '体重（kg）',
    key: 'body_weight',
    component: 'singleDiv'
  },
  {
    label: '初步诊断',
    key: 'preliminary_diagnosis',
    component: 'el-table',
    addText: '添加1行初步诊断',
    maxCount: 20,
    border: false,
    header: [
      {
        label: '序号',
        key: 'index',
        component: 'el-text',
        width: props.mode === 'proofread' ? 80 : 89
      },
      {
        label: '诊断名称',
        key: 'name',
        component: 'el-input',
        type: 'text',
        width: 100
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 30,
        onlyEdit: true
      }
    ]
  }
]
if (props.isEdit) {
  updateRowCount(2)
}
loading.value = true

const getData = () => {
  getMedicalDetailsData(props).then(data => {
    if (data && data.content) {
      const content = data.content
      medicalStore.setMedicalPageList(content.page_ids || [])
      formData.value = {
        name: content.name,
        enter_time: content.enter_time,
        address: content.address,
        complain: content.complain,
        present: content.present,
        past: content.past,
        personal: content.personal,
        marriage: content.marriage,
        family: content.family,
        description: content.description,
        temperature: content.temperature,
        pulse: content.pulse,
        bp: content.bp,
        respiratory: content.respiratory,
        body_height: content.body_height,
        body_weight: content.body_weight,
        preliminary_diagnosis: [],
        page_ids: content.page_ids
      }
      content.preliminary_diagnosis.forEach((item, index) => {
        formData.value.preliminary_diagnosis.push({
          uuid: uuidv4(),
          name: item
        })
      })
    } else {
      formData.value = ''
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}
getData()
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
  const params = {
    name: medicalStore.editingMedical.name,
    address: medicalStore.editingMedical.address,
    bp: medicalStore.editingMedical.bp,
    complain: medicalStore.editingMedical.complain,
    description: medicalStore.editingMedical.description,
    enter_time: medicalStore.editingMedical.enter_time,
    family: medicalStore.editingMedical.family,
    past: medicalStore.editingMedical.past,
    personal: medicalStore.editingMedical.personal,
    marriage: medicalStore.editingMedical.marriage,
    preliminary_diagnosis: medicalStore.editingMedical.preliminary_diagnosis.map(item => item.name),
    present: medicalStore.editingMedical.present,
    pulse: medicalStore.editingMedical.pulse,
    respiratory: medicalStore.editingMedical.respiratory,
    body_height: medicalStore.editingMedical.body_height,
    body_weight: medicalStore.editingMedical.body_weight,
    temperature: medicalStore.editingMedical.temperature,
    page_ids: [...medicalStore.editingMedical.page_ids]
  }
  return params
}
defineExpose({
  saveOldData,
  recoverOldData,
  getEditingMedicalContent,
  getData
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.typeTitle {
  margin-bottom: 24px;
}
:deep(.section) {
  .commonUl-li {
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e4e4;
    .ul-2 {
      li:nth-child(1) {
        width: 33.29% !important;
      }
      li:nth-child(2) {
        width: 66.71% !important;
        padding-right: 0;
      }
      li:nth-child(3) {
        width: 100% !important;
        padding-right: 0;
      }
    }
    .ul-3 {
      li:nth-child(1) {
        width: 19.5% !important;
      }
      li:nth-child(2) {
        width: 17.76% !important;
      }
      li:nth-child(3) {
        width: 62.74% !important;
        padding-right: 0;
      }
    }
  }
}
:deep(.section:nth-child(14)) {
  padding-bottom: 17px;
  border-bottom: 1px solid #e4e4e4;
}
</style>
