<template>
  <template v-if="!isEdit && formData && formData.commonField.length > 0">
    <div class="medical-body">
      <header class="header">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">{{props.agencyName || '-'}}-{{curMedicalInfo.title}}</div>
          <div class="typeTitle2">记录时间：{{formData.time || '-'}}</div>
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
      <commonRecordEditRender :fieldInfo="fieldInfo" :formData="formData"></commonRecordEditRender>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="props.agencyName + '-' + curMedicalInfo.title"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'Diagnosis',
  inheritAttrs: false
})

// 基本信息
import { ref } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonRecordEditRender from '@/components/medicalRecord/standardizedMedical/jiaodui/commonRecordEditRender.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
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
    label: '基本信息',
    component: 'ul-li',
    rowCount: 2,
    onlyEdit: true,
    children: [
      {
        label: '记录时间',
        key: 'time',
        component: 'el-date-picker',
        // customFormat: true,
        // format: 'YYYY-MM-DD HH:mm',
        onlyEdit: true
      }
    ]
  },
  {
    label: props.curMedicalInfo.title,
    key: 'commonField',
    component: 'singleDivArray'
  }
]
const totalMedicalContent = ref()
loading.value = true
const getData = () => {
  getMedicalDetailsData(props).then(res => {
    if (res && res.content) {
      totalMedicalContent.value = res.content
      medicalStore.setMedicalPageList(res.content.page_ids || [])
      switch (props.curMedicalInfo.title) {
        case '术前小结':
          formData.value = {
            time: res.content.preoperative_time || '',
            commonField: res.content.preoperative_summary || []
          }
          break
        case '术后小结':
          formData.value = {
            time: res.content.postoperative_time || '',
            commonField: res.content.postoperative_record || []
          }
          break
      }
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
// 新建病历
const addMedicalRecord = () => {
  formData.value = {
    time: '',
    commonField: []
  }
  return formData.value.length
}
// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  const params = {
    description: totalMedicalContent.value.description,
    diagnostic_basis: totalMedicalContent.value.diagnostic_basis,
    differential_diagnosis: totalMedicalContent.value.differential_diagnosis,
    // follow_up_care: medicalStore.editingMedical.follow_up_care,
    plan: totalMedicalContent.value.plan,
    postoperative_record: props.curMedicalInfo.title === '术后小结' ? medicalStore.editingMedical.commonField.split('\n') : totalMedicalContent.value.postoperative_record,
    postoperative_time: props.curMedicalInfo.title === '术后小结' ? medicalStore.editingMedical.time : totalMedicalContent.value.postoperative_time,
    preliminary_diagnosis: totalMedicalContent.value.preliminary_diagnosis,
    preoperative_summary: props.curMedicalInfo.title === '术前小结' ? medicalStore.editingMedical.commonField.split('\n') : totalMedicalContent.value.preoperative_summary,
    preoperative_time: props.curMedicalInfo.title === '术前小结' ? medicalStore.editingMedical.time : totalMedicalContent.value.preoperative_time,
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
  addMedicalRecord,
  getEditingMedicalContent,
  getData
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e4e4;
}
</style>
