<template>
  <template v-if="!isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <header class="header">
          <WordHighlighter highlightClass="highlight" :query="props.lightQuery">
            <div class="time-card"><i class="iconfont icon-shijian-2"></i>{{item.ward_time || '-'}}</div>
            <div class="typeTitle">{{props.agencyName || '-'}}-{{curMedicalInfo.title}}</div>
            <div class="typeTitle2"><span class="content-ellipsis" :title="item.ward_doctor">{{item.ward_doctor || '-'}}</span>医师查房</div>
          </WordHighlighter>
        </header>
        <commonRecordRender :fieldInfo="fieldInfo" :formData="item" :lightQuery="lightQuery"></commonRecordRender>
      </div>
    </div>
  </template>
  <template v-else-if="isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="item.uuid">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <commonMultiRecordEditRender :fieldInfo="fieldInfo" :formData="formData" :singleFormData="item"></commonMultiRecordEditRender>
        <el-button link type="danger" class="deleteDiv" @click="handleDelete(index)"><i class="iconfont icon-shanchu2"></i>删除</el-button>
      </div>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="props.agencyName + '-' + curMedicalInfo.title"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'CheckupRecord',
  inheritAttrs: false
})
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonMultiRecordEditRender from '@/components/medicalRecord/standardizedMedical/commonMultiRecordEditRender.vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
// 基本信息
import { ref } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
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
// const medicalInfo = ref({
//   hospital: 'XXX医院',
//   dcotorName: '-'
// })
const formData = ref([])
const fieldInfo = [
  {
    label: '时间轴',
    key: 'ward_time',
    component: 'el-date-picker',
    onlyEdit: true
  },
  {
    label: '基本信息',
    component: 'ul-li',
    rowCount: 2,
    onlyEdit: true,
    children: [
      {
        label: '查房医生',
        key: 'ward_doctor',
        component: 'el-input',
        type: 'text',
        onlyEdit: true
      }
    ]
  },
  {
    label: '查房记录',
    key: 'ward_records',
    component: 'singleDiv'
  }
]
const totalMedicalContent = ref()
loading.value = true
const getData = () => {
  getMedicalDetailsData(props).then(res => {
    if (res && res.content) {
      totalMedicalContent.value = res.content
      medicalStore.setMedicalPageList(res.content.page_ids || [])
      res.content.ward_records.forEach((item, index) => {
        formData.value[index] = {
          uuid: uuidv4(),
          ward_time: res.content.ward_time[index],
          ward_doctor: res.content.ward_doctor[index],
          ward_records: item
        }
      })
      loading.value = false
    }
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
  formData.value.push({
    uuid: uuidv4(),
    ward_time: '',
    ward_doctor: '',
    ward_records: ''
  })
  return formData.value.length
}
// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  const params = {
    description: totalMedicalContent.value.description,
    diagnostic_basis: totalMedicalContent.value.diagnostic_basis,
    differential_diagnosis: totalMedicalContent.value.differential_diagnosis,
    plan: totalMedicalContent.value.plan,
    postoperative_record: totalMedicalContent.value.postoperative_record,
    preliminary_diagnosis: totalMedicalContent.value.preliminary_diagnosis,
    postoperative_time: totalMedicalContent.value.postoperative_time,
    preoperative_summary: totalMedicalContent.value.preoperative_summary,
    preoperative_time: totalMedicalContent.value.preoperative_time,
    ward_records: medicalStore.editingMedical.map(item => item.ward_records),
    ward_doctor: medicalStore.editingMedical.map(item => item.ward_doctor),
    ward_time: medicalStore.editingMedical.map(item => item.ward_time),
    other_record: totalMedicalContent.value.other_record,
    other_record_time: totalMedicalContent.value.other_record_time,
    page_ids: totalMedicalContent.value.page_ids
  }
  return params
}
const emits = defineEmits(['updateCount'])
// 删除某一份
const handleDelete = (deleteIndex) => {
  const deleteUUID = formData.value[deleteIndex].uuid
  formData.value.splice(deleteIndex, 1)
  // 获取已经保存的临时数据
  const savedData = _.cloneDeep(medicalStore.editingMedical)
  // 找到修改的哪一次的查房记录
  const index = savedData.findIndex(item => item.uuid === deleteUUID)
  // 替换掉数组的某个索引的值
  savedData.splice(index, 1)
  medicalStore.setEditingMedical(savedData)
  emits('updateCount', formData.value.length)
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
.medical-body {
  display: flex;
  margin-top: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
:deep(.typeTitle2) {
  span {
    display: inline-block;
    max-width: calc(100% - 100px);
  }
}
</style>
