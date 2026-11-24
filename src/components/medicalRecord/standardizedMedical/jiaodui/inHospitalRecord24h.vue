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
      <commonRecordEditRender ref="commonRecordEditRenderRef" :curMedicalInfo="curMedicalInfo" :fieldInfo="fieldInfo" :formData="formData"></commonRecordEditRender>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="props.agencyName + '-' + curMedicalInfo.title"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'InHospitalRecord24h',
  inheritAttrs: false
})
// 基本信息
import { ref } from 'vue'
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
// if (props.mode === 'proofread') {
//   rowCount.value = 2
// }
// const updateRowCount = (count) => {
//   rowCount.value = count
//   fieldInfo[0].rowCount = count
//   fieldInfo[1].rowCount = count
// }
// watch(() => props.isEdit, (val) => {
//   if (val) {
//     updateRowCount(2)
//   } else {
//     if (props.mode === 'proofread') {
//       updateRowCount(2)
//     } else {
//       updateRowCount(3)
//     }
//   }
// })
const fieldInfo = [
  {
    label: '',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '入院时间',
        key: 'enter_time',
        component: 'el-date-picker'
        // rules: {
        //   trigger: 'change',
        //   validator: (rule, value, callback) => {
        //     // 如果入院时间和出院时间都有值，检查出院时间是否早于入院时间
        //     if (value && medicalStore.editingMedical?.exit_time) {
        //       const enterTime = new Date(value).getTime()
        //       const outTime = new Date(medicalStore.editingMedical.exit_time).getTime()
        //       if (outTime < enterTime) {
        //         callback(new Error('出院时间不能早于入院时间'))
        //         return
        //       }
        //     }
        //     callback()
        //   }
        // }
      },
      {
        label: '出院时间',
        key: 'exit_time',
        component: 'el-date-picker'
        // rules: {
        //   trigger: 'change',
        //   validator: (rule, value, callback) => {
        //     // 如果出院时间和入院时间都有值，检查出院时间是否早于入院时间
        //     if (value && medicalStore.editingMedical?.exit_time) {
        //       const enterTime = new Date(medicalStore.editingMedical.enter_time).getTime()
        //       const outTime = new Date(value).getTime()
        //       if (outTime < enterTime) {
        //         callback(new Error('出院时间不能早于入院时间'))
        //         return
        //       }
        //     }
        //     callback()
        //   }
        // }
      },
      // {
      //   label: '页码',
      //   key: 'page_ids',
      //   component: 'el-input',
      //   type: 'text'
      // }
    ]
  },
  {
    label: '主诉',
    key: 'complain',
    component: 'singleDiv'

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
    className: 'proofreadTable',
    addText: '添加1行入院诊断',
    maxCount: 20,
    border: false,
    buttonText: '存储诊断',
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
  },
  {
    label: '诊疗经过',
    key: 'treatment',
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
    buttonText: '存储诊断',
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
  },
  {
    label: '出院情况',
    key: 'out_description',
    component: 'singleDiv'
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
// if (props.isEdit) {
//   updateRowCount(2)
// }
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
        complain: content.complain,
        enter_description: content.enter_description,
        treatment: content.treatment,
        out_description: content.out_description,
        enter_diagnosis: [],
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
  let pageIds = medicalStore.editingMedical.page_ids
  if (pageIds) {
    pageIds = pageIds.replace(/，/g, ',').split(',').map(id => parseInt(id) - 1)
  }
  const params = {
    name: medicalStore.editingMedical.name,
    complain: medicalStore.editingMedical.complain,
    enter_time: medicalStore.editingMedical.enter_time,
    exit_time: medicalStore.editingMedical.exit_time,
    treatment: medicalStore.editingMedical.treatment,
    out_description: medicalStore.editingMedical.out_description,
    enter_diagnosis: medicalStore.editingMedical.enter_diagnosis.map(item => item.name),
    out_diagnosis: medicalStore.editingMedical.out_diagnosis.map(item => item.name),
    enter_description: medicalStore.editingMedical.enter_description,
    out_advice: medicalStore.editingMedical.out_advice.map(item => item.name),
    page_ids: pageIds
  }
  return params
}
const commonRecordEditRenderRef = ref(null)
// 校验
const getValidateResult = async () => {
  const result = await commonRecordEditRenderRef.value.validateForm()
  return result
}
defineExpose({
  saveOldData,
  recoverOldData,
  getEditingMedicalContent,
  getData,
  getValidateResult
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
    .ul-3 {
      li:nth-child(3) {
        padding-right: 0;
      }
    }
  }
}
</style>
