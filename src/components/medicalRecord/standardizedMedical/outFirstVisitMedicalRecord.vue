<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">{{curMedicalInfo.title}}</div>
        </WordHighlighter>
      </header>
      <commonRecordRender :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery"></commonRecordRender>
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
  name: 'OutFirstVisitMedicalRecord',
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
        label: '就诊时间',
        key: 'inspectionTime',
        component: 'el-date-picker'
      },
      {
        label: '就诊科室',
        key: 'inspectionDepartment',
        component: 'el-input',
        type: 'text'
      }
    ]
  },
  {
    label: '主诉',
    key: 'chiefComplaint',
    component: 'singleDiv'

  },
  {
    label: '现病史',
    key: 'presentHistory',
    component: 'singleDiv'
  },
  {
    label: '既往史',
    key: 'pastHistory',
    component: 'singleDiv'
  },
  {
    label: '过敏史',
    key: 'allergicHistory',
    component: 'singleDiv'
  },
  {
    label: '过敏症状',
    key: 'allergicSign',
    component: 'singleDiv'
  },
  {
    label: '体格检查',
    key: 'physicalExamination',
    component: 'singleDiv'
  },
  {
    label: '辅助检查项目',
    key: 'assistExamItem',
    component: 'singleDiv'
  },
  {
    label: '辅助检查结果',
    key: 'assistExamResult',
    component: 'singleDiv'
  },
  {
    label: '诊断',
    key: 'mainDiagnosis',
    component: 'singleDiv'
  },
  {
    label: '诊疗意见',
    key: 'treatOpinion',
    component: 'singleDiv'
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
      formData.value = content
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
// const getEditingMedicalContent = () => {
//   const params = {
//     name: medicalStore.editingMedical.name,
//     address: medicalStore.editingMedical.address,
//     bp: medicalStore.editingMedical.bp,
//     complain: medicalStore.editingMedical.complain,
//     description: medicalStore.editingMedical.description,
//     enter_time: medicalStore.editingMedical.enter_time,
//     family: medicalStore.editingMedical.family,
//     past: medicalStore.editingMedical.past,
//     personal: medicalStore.editingMedical.personal,
//     preliminary_diagnosis: medicalStore.editingMedical.preliminary_diagnosis.map(item => item.name),
//     present: medicalStore.editingMedical.present,
//     pulse: medicalStore.editingMedical.pulse,
//     respiratory: medicalStore.editingMedical.respiratory,
//     temperature: medicalStore.editingMedical.temperature,
//     page_ids: [...medicalStore.editingMedical.page_ids]
//   }
//   return params
// }
defineExpose({
  saveOldData,
  recoverOldData,
  // getEditingMedicalContent,
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
        width: 20.1% !important;
      }
      li:nth-child(2) {
        width: 79.9% !important;
      }
      // li:nth-child(3) {
      //   width: 62.74% !important;
      //   padding-right: 0;
      // }
    }
  }
}
:deep(.section:nth-child(12)) {
  padding-bottom: 17px;
  border-bottom: 1px solid #e4e4e4;
}
</style>
