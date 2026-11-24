<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">{{props.agencyName}}-{{curMedicalInfo.title}}</div>
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
  name: 'FirstMedicalRecord',
  inheritAttrs: false
})
// 基本信息
import { ref } from 'vue'
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
const fieldInfo = [
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
  },
  {
    label: '病例特点',
    key: 'description',
    component: 'singleDivArray'
  },
  {
    label: '诊断依据',
    key: 'diagnostic_basis',
    component: 'singleDivArray'
  },
  {
    label: '鉴别诊断',
    key: 'differential_diagnosis',
    component: 'singleDivArray'
  },
  {
    label: '诊疗计划',
    key: 'plan',
    component: 'singleDivArray'
  }
]
const totalMedicalContent = ref()
loading.value = true
const getData = () => {
  getMedicalDetailsData(props).then(data => {
    if (data && data.content) {
      totalMedicalContent.value = data.content
      const content = data.content
      medicalStore.setMedicalPageList(content.page_ids || [])
      formData.value = {
        preliminary_diagnosis: [],
        description: content.description,
        diagnostic_basis: content.diagnostic_basis,
        plan: content.plan,
        differential_diagnosis: content.differential_diagnosis
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
    description: medicalStore.editingMedical.description?.split('\n'),
    diagnostic_basis: medicalStore.editingMedical.diagnostic_basis?.split('\n'),
    differential_diagnosis: medicalStore.editingMedical.differential_diagnosis?.split('\n'),
    plan: medicalStore.editingMedical.plan?.split('\n'),
    preliminary_diagnosis: medicalStore.editingMedical.preliminary_diagnosis.map(item => item.name),
    postoperative_record: totalMedicalContent.value.postoperative_record,
    postoperative_time: totalMedicalContent.value.postoperative_time,
    preoperative_summary: totalMedicalContent.value.preoperative_summary,
    preoperative_time: totalMedicalContent.value.preoperative_time,
    ward_records: totalMedicalContent.value.ward_records,
    ward_doctor: totalMedicalContent.value.ward_doctor,
    ward_time: totalMedicalContent.value.ward_time,
    other_record: totalMedicalContent.value.other_record,
    other_record_time: totalMedicalContent.value.other_record_time,
    page_ids: totalMedicalContent.value.page_ids
  }
  return params
}
defineExpose({
  saveOldData,
  recoverOldData,
  getEditingMedicalContent,
  getData
})
// 处理form中的textarea数组字段
// const handleArrayFiled = (formData) => {
//   const newFormData = {}
//   for (const key in formData) {
//     if (['description', 'diagnostic_basis', 'differential_diagnosis', 'plan', 'postoperative_record', 'preoperative_summary', 'ward_records'].includes(key)) {
//       newFormData[key] = formData[key].join('\n')
//     } else {
//       newFormData[key] = formData[key]
//     }
//   }
//   return newFormData
// }
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.header {
  padding-bottom: 24px;
  border-bottom: 1px solid #e4e4e4;
}
</style>
