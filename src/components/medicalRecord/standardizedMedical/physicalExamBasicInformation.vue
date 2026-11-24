<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header borderB">
        <WordHighlighter highlightClass="highlight" :query="lightQuery">
          <div class="typeTitle">{{props.agencyName || '-'}}-基础信息</div>
          <div class="title-line">
            <!-- <div class="left">就诊号：{{formData.visit_id || '-'}}</div> -->
            <div class="right">体检编号：{{formData.physicalNum || '-'}}</div>
          </div>
        </WordHighlighter>
      </header>
      <commonRecordRender :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery"></commonRecordRender>
    </div>
  </template>
  <template v-else-if="isEdit && formData">
    <div class="medical-body">
      <header class="header borderB">
        <div class="typeTitle">{{props.agencyName || '-'}}-病案首页</div>
      </header>
      <commonRecordEditRender :curMedicalInfo="curMedicalInfo" :fieldInfo="fieldInfo" :formData="formData"></commonRecordEditRender>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="(props.agencyName || '-') + '-病案首页'"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'PhysicalExamBasicInformation',
  inheritAttrs: false
})
// 基本信息
import { ref } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonRecordEditRender from '@/components/medicalRecord/standardizedMedical/commonRecordEditRender.vue'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import _ from 'lodash'
// const emits = defineEmits(['updatePatientInfo'])
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
const rowCount = ref(5)
const fieldInfo = [
  {
    label: '基本信息',
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
        label: '性别',
        key: 'sex',
        component: 'el-select',
        enums: [
          {
            label: '男',
            value: '男'
          },
          {
            label: '女',
            value: '女'
          }
        ]
      },
      {
        label: '婚姻状况',
        key: 'marital',
        component: 'el-select',
        enums: [
          {
            label: '未婚',
            value: '未婚'
          },
          {
            label: '已婚',
            value: '已婚'
          },
          {
            label: '离婚',
            value: '离婚'
          },
          {
            label: '丧偶',
            value: '丧偶'
          }
        ]
      },
      {
        label: '身份证号',
        key: 'id_num',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '出生日期',
        key: 'birthday',
        component: 'el-date-picker',
        type: 'date',
        customFormat: true,
        format: 'YYYY-MM-DD'
      },
      // {
      //   label: '健康号',
      //   key: 'age',
      //   component: 'el-input',
      //   type: 'text'
      // },

      {
        label: '体检类型',
        key: 'physicalType',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '年龄',
        key: 'age',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '文化程度',
        key: 'educationalLevel',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '工种',
        key: 'profession',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '岗位年龄',
        key: 'workAge',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '住址',
        key: 'address',
        component: 'el-input',
        type: 'textarea'
      }
    ]
  },
  {
    label: '打印信息',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '采集人',
        key: 'collector',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '采集时间',
        key: 'collectTime',
        component: 'el-date-picker'
      },
      {
        label: '打印人',
        key: 'print',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '打印时间',
        key: 'printTime',
        component: 'el-date-picker'
      }
    ]
  }
]
loading.value = true
const getData = () => {
  getMedicalDetailsData(props).then(data => {
    if (data && data.content) {
      formData.value = data.content
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
defineExpose({
  saveOldData,
  recoverOldData,
  getData
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
</style>
