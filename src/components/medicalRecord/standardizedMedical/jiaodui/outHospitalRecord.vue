<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">{{curMedicalInfo.title}}</div>
        </WordHighlighter>
      </header>
      <commonRecordRender :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery" :pathPrefix="'exit_record'"></commonRecordRender>
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
  name: 'OuthospitalRecord',
  inheritAttrs: false
})
import { ref, watch, onMounted } from 'vue'
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
  // {
  //   label: '',
  //   component: 'ul-li',
  //   rowCount: rowCount.value,
  //   children: [
  //   ]
  // },
  {
    label: '入院情况',
    key: 'enter_description',
    component: 'singleDiv'
  },
  {
    label: '入院诊断',
    key: 'enter_diagnosis',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行入院诊断',
    maxCount: 20,
    border: false,
    buttonText: '使用诊断',
    buttonText2: '存储诊断',
    buttonText3: '一键去除首数字',
    buttonKey: 'preliminary_diagnosis',
    hasInput: true,
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
    label: '诊疗情况',
    key: 'treatment',
    component: 'singleDiv'
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
    className: 'proofreadTable',
    addText: '添加1行出院诊断',
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
    label: '出院医嘱',
    key: 'out_advice',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行出院医嘱',
    maxCount: 20,
    border: false,
    hasInput: true,
    buttonText3: '一键去除首数字',
    header: [
      {
        label: '序号',
        key: 'index',
        component: 'el-text',
        width: 20
      },
      {
        label: '医嘱内容',
        key: 'name',
        component: 'el-input',
        type: 'text',
        width: 200
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
  updateRowCount(2)
}
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
        enter_description: content.enter_description,
        enter_diagnosis: [],
        treatment: Array.isArray(content.treatment) ? content.treatment.join('') : content.treatment,
        out_description: content.out_description,
        out_diagnosis: [],
        out_advice: [],
        page_ids: content.page_ids ? content.page_ids.map(id => parseInt(id) + 1).join(',') : ''
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
      if (medicalStore.showOperationView) {
        const rawContent = data.rawData
        Object.assign(formData.value, {
          oldenter_description: rawContent.enter_description,
          oldenter_diagnosis: rawContent.enter_diagnosis?.map(item => ({
            name: item
          })),
          oldtreatment: Array.isArray(rawContent.treatment) ? rawContent.treatment.join('') : rawContent.treatment,
          oldout_description: rawContent.out_description,
          oldout_diagnosis: rawContent.out_diagnosis?.map(item => ({
            name: item
          })),
          oldout_advice: rawContent.out_advice?.map(item => ({
            name: item
          })),
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
    enter_description: medicalStore.editingMedical.enter_description,
    enter_diagnosis: medicalStore.editingMedical.enter_diagnosis.map(item => item.name),
    out_advice: medicalStore.editingMedical.out_advice.map(item => item.name),
    out_description: medicalStore.editingMedical.out_description,
    out_diagnosis: medicalStore.editingMedical.out_diagnosis.map(item => item.name),
    treatment: medicalStore.editingMedical.treatment,
    page_ids: pageIds,
    exit_time: totalMedicalContent.value.exit_time,
    inhospital_days: totalMedicalContent.value.inhospital_days
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
  // .commonUl-li {
  //   margin-bottom: -16px;
  // }
}
:deep(.section:nth-child(4)) {
  padding-bottom: 17px;
  border-bottom: 1px solid #e4e4e4;
}
</style>
