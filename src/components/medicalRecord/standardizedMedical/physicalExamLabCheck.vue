<template>
  <template v-if="!isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <template v-if="index < loadedCount">
        <commonRecordTimeLine/>
        <div class="timeline-right marginT24">
          <header class="header">
            <WordHighlighter highlightClass="highlight" :query="lightQuery">
              <div class="time-card"><i class="iconfont icon-shijian-2"></i>{{item.time || '-'}}</div>
              <div class="typeTitle">{{item.type || '-'}}</div>
              <div class="typeTitle2">科室：{{item.department || '-'}}</div>
            </WordHighlighter>
          </header>
          <commonRecordRender :fieldInfo="fieldInfo" :formData="item" :lightQuery="lightQuery"></commonRecordRender>
        </div>
      </template>

    </div>
  </template>
  <template v-else-if="isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <commonMultiRecordEditRender :curMedicalInfo="curMedicalInfo" :fieldInfo="getEditFieldInfo(fieldInfo)" :formData="formData" :singleFormData="item"></commonMultiRecordEditRender>
      </div>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="medicalInfo.typeName"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'PhysicalExamLabCheck',
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
import { v4 as uuidv4 } from 'uuid'
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
  typeName: '实验室检查'
})
const formData = ref([])
const rowCount = ref(5)
const fieldInfo = [
  {
    label: '检验信息',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '检验项目',
        key: 'type',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '标本类型',
        key: 'specimen_type',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '送检时间',
        key: 'time',
        component: 'el-date-picker'
      }
    ]
  },
  {
    label: '',
    key: 'content',
    component: 'el-table',
    addText: '添加1行检验信息',
    maxCount: 40,
    border: false,
    needRowClass: true,
    rowKey: 'name',
    header: [
      {
        label: '序号',
        key: 'index',
        component: 'el-text',
        width: props.mode === 'proofread' ? 50 : 50
      },
      {
        label: '名称',
        key: 'name',
        component: 'el-input',
        type: 'text',
        width: 120
      },
      {
        label: '结果',
        key: 'value',
        component: 'el-input',
        type: 'text',
        width: 80
      },
      {
        label: '状态',
        key: 'state',
        width: 80,
        isTag: true
      },
      {
        label: '参考范围',
        key: 'range',
        component: 'el-input',
        type: 'text',
        width: 80
      },
      {
        label: '单位',
        key: 'unit',
        component: 'el-input',
        type: 'text',
        width: 80
      },
      {
        label: '默认值',
        key: 'defaultValue',
        component: 'el-input',
        type: 'text',
        width: 80
      }
      // {
      //   label: '上限值',
      //   key: 'upperLimitValue',
      //   component: 'el-input',
      //   type: 'text',
      //   width: 80
      // },
      // {
      //   label: '下限值',
      //   key: 'LowerLimitValue',
      //   component: 'el-input',
      //   type: 'text',
      //   width: 40
      // }
    ]
  },
  {
    label: '检验诊断',
    key: 'diagnosis',
    component: 'singleDiv'
  }
]
const getEditFieldInfo = (fieldInfo) => {
  // 去除不需要编辑的字段-状态
  const newFieldInfo = _.cloneDeep(fieldInfo)
  newFieldInfo[3].header = newFieldInfo[3].header.filter(item => item.key !== 'state')
  return newFieldInfo
}
loading.value = true
const loadedCount = ref(0)
const getData = () => {
  getMedicalDetailsData(props).then(res => {
    if (!res) {
      loading.value = false
      return
    }
    formData.value = res.content
    loading.value = false
    // 初始加载前两个
    loadedCount.value = Math.min(2, formData.value.length)

    // 每隔一定时间加载一个
    if (formData.value.length > 2) {
      for (let i = 2; i < formData.value.length; i++) {
        setTimeout(() => {
          loadedCount.value++
        }, (i - 1) * 100)
      }
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
    time: '',
    type: '',
    department: '',
    diagnosis: '',
    specimen_type: '',
    content: [],
    page_ids: []
  })
  return formData.value.length
}

defineExpose({
  saveOldData,
  recoverOldData,
  addMedicalRecord,
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
  :deep(.el-table) {
    margin-top: 12px;
  }
  :deep(.common-record-render) {
    .commonUl-li {
      ul {
        li:nth-child(1) {
          width: auto;
          min-width: 20%;
          max-width: 50%;
          margin-right: 20px;
        }
      }
    }
  }
}
</style>
