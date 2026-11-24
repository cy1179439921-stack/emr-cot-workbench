<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">{{curMedicalInfo.title}}</div>
        </WordHighlighter>
      </header>
      <commonRecordRender :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery" :pathPrefix="'course_record.first_record'"></commonRecordRender>
    </div>
  </template>
  <template v-else-if="isEdit && formData">
    <div class="medical-body">
      <header class="header borderB">
        <div class="typeTitle">{{curMedicalInfo.title}}</div>
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
import { ref, onMounted } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonRecordEditRender from '@/components/medicalRecord/standardizedMedical/jiaodui/commonRecordEditRender.vue'
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
    label: '',
    component: 'ul-li',
    rowCount: 2,
    children: [
      {
        label: '首次病程时间',
        key: 'course_time',
        component: 'el-date-picker'
      }
    ]
  },
  {
    label: '初步诊断',
    key: 'preliminary_diagnosis',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行初步诊断',
    maxCount: 20,
    border: false,
    buttonText: '使用诊断',
    buttonText3: '一键去除首数字',
    buttonKey: 'preliminary_diagnosis',
    header: [
      {
        label: '序号',
        key: 'index',
        component: 'el-text',
        width: 20
      },
      {
        label: '诊断名称',
        key: 'name',
        component: 'el-input',
        type: 'text',
        width: 260
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
    label: '病例特点',
    key: 'description',
    component: 'singleDiv'
  },
  {
    label: '诊断依据',
    key: 'diagnostic_basis',
    component: 'singleDiv'
  },
  {
    label: '鉴别诊断',
    key: 'differential_diagnosis',
    component: 'singleDiv'
  },
  {
    label: '诊疗计划',
    key: 'plan',
    component: 'singleDiv'
  }
]
const totalMedicalContent = ref()
loading.value = true
const getData = () => {
  getMedicalDetailsData(props).then(data => {
    if (data && data.jsonData) {
      totalMedicalContent.value = data.jsonData
      const content = data.jsonData
      medicalStore.setMedicalPageList(content.page_ids || [])
      medicalStore.setMedicalOrderPageList(content.page_ids || [])
      formData.value = {
        preliminary_diagnosis: [],
        description: content.first_record.description,
        course_time: content.first_record.course_time,
        diagnostic_basis: content.first_record.diagnostic_basis,
        plan: content.first_record.plan,
        differential_diagnosis: content.first_record.differential_diagnosis,
        page_ids: content.page_ids ? content.page_ids.map(id => parseInt(id) + 1).join(',') : ''
      }
      content.first_record.preliminary_diagnosis?.forEach((item, index) => {
        formData.value.preliminary_diagnosis.push({
          uuid: uuidv4(),
          name: item
        })
      })
      if (medicalStore.showOperationView) {
        const rawContent = data.rawData
        Object.assign(formData.value, {
          oldpreliminary_diagnosis: rawContent.first_record.preliminary_diagnosis.map(item => ({ name: item })),
          olddescription: rawContent.first_record.description,
          oldcourse_time: rawContent.first_record.course_time,
          olddiagnostic_basis: rawContent.first_record.diagnostic_basis,
          oldplan: rawContent.first_record.plan,
          olddifferential_diagnosis: rawContent.first_record.differential_diagnosis,
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
    first_record: {
      course_time: medicalStore.editingMedical.course_time,
      description: medicalStore.editingMedical.description,
      diagnostic_basis: medicalStore.editingMedical.diagnostic_basis,
      differential_diagnosis: medicalStore.editingMedical.differential_diagnosis,
      plan: medicalStore.editingMedical.plan,
      preliminary_diagnosis: medicalStore.editingMedical.preliminary_diagnosis.map(item => item.name)
    },
    other_records: totalMedicalContent.value.other_records,
    visit_id: totalMedicalContent.value.visit_id,
    ward_records: totalMedicalContent.value.ward_records,
    page_ids: pageIds
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
:deep(.ul-1) {
  margin-top: 24px;
}
:deep(.readOnly) {
  .commonUl-li {
    margin-top: 16px;
  }
}
</style>
