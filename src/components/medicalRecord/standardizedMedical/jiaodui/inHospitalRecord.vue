<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">{{curMedicalInfo.title}}</div>
        </WordHighlighter>
      </header>
      <commonRecordRender :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery" :pathPrefix="'enter_record'"></commonRecordRender>
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
  name: 'InhospitalRecord',
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
const rowCount = ref(3)
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
    updateRowCount(3)
  } else {
    if (props.mode === 'proofread') {
      updateRowCount(3)
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
    label: '过敏史',
    key: 'allergy',
    component: 'singleDiv'
  },
  {
    label: '婚育史',
    key: 'marriage',
    component: 'singleDiv'
  },
  {
    label: '月经史',
    key: 'menstruation',
    component: 'singleDiv'
  },
  {
    label: '家族史',
    key: 'family',
    component: 'singleDiv'
  },
  {
    label: '体格检查',
    key: 'body_examination',
    component: 'singleDiv'
  },
  {
    label: '专科检查',
    key: 'specialist_examination',
    component: 'singleDiv'
  },
  {
    label: '辅助检查',
    key: 'ancillary_tests',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行辅助检查',
    maxCount: 20,
    border: false,
    buttonText: '切换日期格式',
    header: [
      {
        label: '序号',
        key: 'index',
        component: 'el-text',
        width: 15
      },
      {
        label: '检查日期',
        key: 'time',
        component: 'el-date-picker',
        type: 'date',
        customFormat: true,
        format: 'YYYY-MM-DD',
        width: 40
      },
      {
        label: '结果',
        key: 'content',
        component: 'el-input',
        type: 'text',
        width: 180
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 13,
        onlyEdit: true
      }
    ]
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
    className: 'proofreadTable',
    addText: '添加1行初步诊断',
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
        width: 240
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 13,
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
      medicalStore.setMedicalPageList(content.page_ids || [])
      medicalStore.setMedicalOrderPageList(content.page_ids || [])
      formData.value = {
        complain: content.complain,
        present: content.present,
        past: content.past,
        personal: content.personal,
        allergy: content.allergy,
        marriage: content.marriage,
        menstruation: content.menstruation,
        family: content.family,
        body_examination: content.body_examination,
        specialist_examination: content.specialist_examination,
        ancillary_tests: [],
        temperature: content.temperature,
        pulse: content.pulse,
        bp: content.bp,
        respiratory: content.respiratory,
        body_height: content.body_height,
        body_weight: content.body_weight,
        preliminary_diagnosis: [],
        page_ids: content.page_ids ? content.page_ids.map(id => parseInt(id) + 1).join(',') : ''
      }
      content.ancillary_tests?.forEach((item, index) => {
        formData.value.ancillary_tests.push({
          uuid: uuidv4(),
          time: item.time,
          content: item.content
        })
      })
      content.preliminary_diagnosis?.forEach((item, index) => {
        formData.value.preliminary_diagnosis.push({
          uuid: uuidv4(),
          name: item
        })
      })
      if (medicalStore.showOperationView) {
        const rawContent = data.rawData
        Object.assign(formData.value, {
          oldcomplain: rawContent.complain,
          oldpresent: rawContent.present,
          oldpast: rawContent.past,
          oldpersonal: rawContent.personal,
          oldallergy: rawContent.allergy,
          oldmarriage: rawContent.marriage,
          oldmenstruation: rawContent.menstruation,
          oldfamily: rawContent.family,
          oldbody_examination: rawContent.body_examination,
          oldspecialist_examination: rawContent.specialist_examination,
          oldancillary_tests: rawContent.ancillary_tests?.map((item, index) => ({
            time: item.time,
            content: item.content
          })) || [],
          oldtemperature: rawContent.temperature,
          oldpulse: rawContent.pulse,
          oldbp: rawContent.bp,
          oldrespiratory: rawContent.respiratory,
          oldbody_height: rawContent.body_height,
          oldbody_weight: rawContent.body_weight,
          oldpreliminary_diagnosis: rawContent.preliminary_diagnosis?.map(item => ({
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
    bp: medicalStore.editingMedical.bp,
    complain: medicalStore.editingMedical.complain,
    body_examination: medicalStore.editingMedical.body_examination,
    family: medicalStore.editingMedical.family,
    past: medicalStore.editingMedical.past,
    personal: medicalStore.editingMedical.personal,
    allergy: medicalStore.editingMedical.allergy,
    marriage: medicalStore.editingMedical.marriage,
    menstruation: medicalStore.editingMedical.menstruation,
    specialist_examination: medicalStore.editingMedical.specialist_examination,
    ancillary_tests: medicalStore.editingMedical.ancillary_tests.map(({ uuid, ...rest }) => rest),
    preliminary_diagnosis: medicalStore.editingMedical.preliminary_diagnosis.map(item => item.name),
    present: medicalStore.editingMedical.present,
    pulse: medicalStore.editingMedical.pulse,
    respiratory: medicalStore.editingMedical.respiratory,
    body_height: medicalStore.editingMedical.body_height,
    body_weight: medicalStore.editingMedical.body_weight,
    temperature: medicalStore.editingMedical.temperature,
    page_ids: pageIds,
    address: totalMedicalContent.value.address,
    age: totalMedicalContent.value.age,
    career: totalMedicalContent.value.career,
    enter_time: totalMedicalContent.value.enter_time,
    marital: totalMedicalContent.value.marital,
    nation: totalMedicalContent.value.nation,
    sex: totalMedicalContent.value.sex,
    visit_id: totalMedicalContent.value.visit_id
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
    // margin-bottom: -16px;
    // padding-bottom: 12px;
    // border-bottom: 1px solid #e4e4e4;
    .ul-2 {
      li:nth-child(1),
      li:nth-child(2),
      li:nth-child(3) {
        width: 33.3333% !important;
      }
      li:nth-child(3) {
        padding-right: 0;
      }
      // li:nth-child(2) {
      //   width: 66.71% !important;
      //   padding-right: 0;
      // }
      li:nth-child(4) {
        width: 100% !important;
        padding-right: 0;
      }
    }
    .ul-3 {
      li:nth-child(1) {
        width: 33.3333% !important;
      }
      li:nth-child(2) {
        width: 33.3333% !important;
      }
      li:nth-child(3) {
        width: 33.3333% !important;
        padding-right: 0;
      }
    }
  }
}
// :deep(.section:nth-child(14)) {
//   padding-bottom: 17px;
//   border-bottom: 1px solid #e4e4e4;
// }
</style>
