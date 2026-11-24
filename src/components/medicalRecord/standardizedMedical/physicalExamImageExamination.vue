<template>
  <template v-if="!isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <header class="header">
          <WordHighlighter highlightClass="highlight" :query="lightQuery">
            <div class="time-card"><i class="iconfont icon-shijian-2"></i>{{item.reportTime || '-'}}</div>
            <div class="typeTitle">{{item.name || '-'}}</div>
            <div class="typeTitle2">科室：{{item.examDepartment || '-'}}</div>
          </WordHighlighter>
        </header>
        <commonRecordRender :fieldInfo="fieldInfo" :formData="item" :lightQuery="lightQuery"></commonRecordRender>
      </div>

    </div>
  </template>
  <template v-else-if="isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <commonMultiRecordEditRender :fieldInfo="fieldInfo" :formData="formData" :singleFormData="item"></commonMultiRecordEditRender>
      </div>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="medicalInfo.typeName"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'PhysicalExamImageExamination',
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
import _ from 'lodash'
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
  isEdit: {
    type: Boolean
  },
  mode: {
    type: String
  }
})
const loading = ref(false)
const medicalInfo = ref({
  typeName: '影像检查'
})
const formData = ref([])
const rowCount = ref(5)
const fieldInfo = [
  {
    label: '时间轴',
    key: 'time',
    component: 'el-date-picker',
    onlyEdit: true
  },
  {
    label: '基本信息',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '科室',
        key: 'examDepartment',
        component: 'el-input',
        type: 'text',
        onlyEdit: true
      },
      {
        label: '检查项目',
        key: 'name',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '检查部位',
        key: 'examPart',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '检查类型',
        key: 'examType',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '检查时间',
        key: 'reportTime',
        component: 'el-date-picker'
      }
    ]
  },
  {
    label: '检查所见',
    key: 'medicalExplanation',
    component: 'singleDiv'
  },
  {
    label: '诊断',
    key: 'conclusion',
    component: 'singleDiv'
  }
]
loading.value = true
const getData = () => {
  getMedicalDetailsData(props).then(res => {
    if (!res) {
      loading.value = false
      return
    }
    formData.value = res.content
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
defineExpose({
  saveOldData,
  recoverOldData,
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
  .section:nth-child(3) {
    margin-top: 12px;
  }
}
</style>
