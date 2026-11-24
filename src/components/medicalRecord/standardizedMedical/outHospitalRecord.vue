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
  name: 'OuthospitalRecord',
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
const rowCount = ref(4)
if (props.mode === 'proofread') {
  rowCount.value = 3
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
      updateRowCount(3)
    } else {
      updateRowCount(4)
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
        label: '出院时间',
        key: 'exit_time',
        component: 'el-date-picker'
        // customFormat: true,
        // format: 'YYYY-MM-DD HH:mm'
      },
      {
        label: '住院天数',
        key: 'inhospital_days',
        component: 'el-input',
        type: 'text'
      }
    ]
  },
  {
    label: '入院情况',
    key: 'enter_description',
    component: 'singleDiv'
  },
  {
    label: '入院诊断',
    key: 'enter_diagnosis',
    component: 'el-table',
    addText: '添加1行入院诊断',
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
    label: '诊疗情况',
    key: 'treatment',
    component: 'singleDivArray'
  },
  {
    label: '出院情况',
    key: 'out_description',
    component: 'singleDiv'
  },
  {
    label: '出院诊断',
    key: 'out_diagnosis',
    component: 'el-table',
    addText: '添加1行出院诊断',
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
    label: '出院医嘱',
    key: 'out_advice',
    component: 'el-table',
    addText: '添加1行出院医嘱',
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
        label: '医嘱内容',
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
        exit_time: content.exit_time,
        inhospital_days: content.inhospital_days,
        enter_description: content.enter_description,
        enter_diagnosis: [],
        treatment: content.treatment || [],
        out_description: content.out_description,
        out_diagnosis: [],
        out_advice: [],
        page_ids: content.page_ids
      }
      content.enter_diagnosis.forEach((item, index) => {
        formData.value.enter_diagnosis.push({
          uuid: uuidv4(),
          name: item
        })
      })
      content.out_diagnosis.forEach((item, index) => {
        formData.value.out_diagnosis.push({
          uuid: uuidv4(),
          name: item
        })
      })
      content.out_advice.forEach((item, index) => {
        formData.value.out_advice.push({
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
    enter_description: medicalStore.editingMedical.enter_description,
    enter_diagnosis: medicalStore.editingMedical.enter_diagnosis.map(item => item.name),
    enter_time: medicalStore.editingMedical.enter_time,
    exit_time: medicalStore.editingMedical.exit_time,
    inhospital_days: medicalStore.editingMedical.inhospital_days,
    out_advice: medicalStore.editingMedical.out_advice.map(item => item.name),
    out_description: medicalStore.editingMedical.out_description,
    out_diagnosis: medicalStore.editingMedical.out_diagnosis.map(item => item.name),
    treatment: medicalStore.editingMedical.treatment.split('\n'),
    page_ids: medicalStore.editingMedical.page_ids
  }
  return params
}

defineExpose({
  saveOldData,
  recoverOldData,
  getEditingMedicalContent,
  getData
})
// 处理form中的数组字段
// const handleArrayFiled = (formData) => {
//   const newFormData = {}
//   for (const key in formData) {
//     if (Array.isArray(formData[key])) {
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
.typeTitle {
  margin-bottom: 24px;
}
:deep(.section) {
  .commonUl-li {
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e4e4;
  }
}
:deep(.section:nth-child(4)) {
  padding-bottom: 17px;
  border-bottom: 1px solid #e4e4e4;
}
</style>
