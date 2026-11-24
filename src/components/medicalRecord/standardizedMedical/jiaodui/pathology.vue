<template>
  <template v-if="!isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <header class="header" :id="'page_'+ item.page_ids + '_' + index">
          <WordHighlighter highlightClass="highlight" :query="lightQuery">
            <div class="time-card" :data-evidence-field="`pathologies[${index}].time`"><span class="time-index">[{{ index }}]</span>{{item.time || '-'}}</div>
            <div class="typeTitle">病理</div>
          </WordHighlighter>
        </header>
        <commonRecordRender :fieldInfo="fieldInfo" :formData="item" :lightQuery="lightQuery" :pathPrefix="evidencePathPrefix(index)"></commonRecordRender>
      </div>
    </div>
  </template>
  <template v-else-if="isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="item.uuid">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <commonMultiRecordEditRender :fieldInfo="getEditFieldInfo(fieldInfo)" :formData="formData" :singleFormData="item" :childId="'page_'+ item.page_ids + '_' + index"></commonMultiRecordEditRender>
        <el-button link type="danger" class="deleteDiv" @click="handleDelete(index)"><i class="iconfont icon-shanchu2"></i>删除</el-button>
      </div>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="medicalInfo.typeName"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'Pathology',
  inheritAttrs: false
})
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonMultiRecordEditRender from '@/components/medicalRecord/standardizedMedical/jiaodui/commonMultiRecordEditRender.vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
// 基本信息
import { ref, watch, onMounted } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { useMedicalStore } from '@/store/medicalStore'
import { ElMessageBox } from 'element-plus'
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
  isEdit: {
    type: Boolean
  },
  mode: {
    type: String
  }
})
const loading = ref(false)
const medicalInfo = ref({
  typeName: '病理'
})
const formData = ref([])

/** 构建证据路径前缀：pathologies[index] */
const evidencePathPrefix = (index) => {
  return `pathologies[${index}]`
}
const rowCount = ref(5)
if (props.mode === 'proofread') {
  rowCount.value = 3
}
const updateRowCount = (count) => {
  rowCount.value = count
}
watch(() => props.isEdit, (val) => {
  if (val) {
    updateRowCount(2)
  } else {
    if (props.mode === 'proofread') {
      updateRowCount(3)
    } else {
      updateRowCount(5)
    }
  }
})
const fieldInfo = [
  {
    label: '时间轴',
    key: 'time',
    component: 'el-date-picker',
    onlyEdit: true
  },
  {
    label: '报告时间',
    key: 'time',
    component: 'labelWithContent'
  },
  {
    label: '基本信息',
    component: 'ul-li',
    rowCount: 3,
    children: [
      {
        label: '送检科室',
        key: 'department',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '送检样本',
        key: 'specimen',
        component: 'el-input',
        type: 'text'
      }
    ]
  },
  {
    label: '巨检（肉眼所见）',
    key: 'gross_description',
    component: 'singleDiv'
  },
  {
    label: '病理诊断',
    key: 'diagnosis',
    component: 'singleDiv'
  }
]
if (props.isEdit) {
  updateRowCount(2)
}
const getEditFieldInfo = (fieldInfo) => {
  // 去除fieldInfo中的报告时间
  const newFieldInfo = _.cloneDeep(fieldInfo.filter(item => item.label !== '报告时间'))
  return newFieldInfo
}
const totalMedicalContent = ref()
const oldTotalMedicalContent = ref()
loading.value = true
const getData = () => {
  getMedicalDetailsData(props).then(res => {
    if (!res) {
      loading.value = false
      return
    }
    const pageIds = []
    const orderPageIds = []
    totalMedicalContent.value = res.jsonData
    formData.value = []
    totalMedicalContent.value.forEach((item, index) => {
      formData.value[index] = {
        uuid: uuidv4(),
        time: item.time,
        pathologies_number: item.pathologies_number,
        department: item.department,
        specimen: item.specimen,
        gross_description: item.gross_description,
        diagnosis: item.diagnosis,
        page_ids: item.page_ids ? item.page_ids.map(id => parseInt(id) + 1).join(',') : ''
      }
      if (item.page_ids) {
        pageIds.push(...item.page_ids)
        orderPageIds.push(item.page_ids)
      }
    })
    if (medicalStore.showOperationView) {
      oldTotalMedicalContent.value = res.rawData
      oldTotalMedicalContent.value?.forEach((item, index) => {
        if (formData.value[index]) {
          Object.assign(formData.value[index], {
            oldtime: item.time,
            oldpathologies_number: item.pathologies_number,
            olddepartment: item.department,
            oldspecimen: item.specimen,
            oldgross_description: item.gross_description,
            olddiagnosis: item.diagnosis,
            oldpage_ids: item.page_ids ? item.page_ids.map(id => parseInt(id) + 1).join(',') : ''
          })
        }
      })
    }
    // 对pageIds进行去重处理
    medicalStore.setMedicalPageList([...new Set(pageIds)])
    medicalStore.setMedicalOrderPageList(orderPageIds)
    emits('updateCount', formData.value.length)
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
// 新建病历
const addMedicalRecord = () => {
  formData.value.push({
    uuid: uuidv4(),
    time: '',
    pathologies_number: '',
    department: '',
    specimen: '',
    gross_description: '',
    diagnosis: '',
    page_ids: ''
  })
  return formData.value.length
}
// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  const content = _.cloneDeep(medicalStore.editingMedical) || []
  content.forEach(item => {
    if (item) {
      // 如果item.page_ids有中文逗号，则先转成英文逗号，再转成数组
      if (item.page_ids) {
        item.page_ids = item.page_ids.replace(/，/g, ',').split(',').map(id => parseInt(id) - 1)
      }
    }
  })
  // 删除content中的uuid
  content.forEach(item => {
    delete item.uuid
  })
  return content
}
const emits = defineEmits(['updateCount'])
// 删除某一份
const handleDelete = (deleteIndex) => {
  ElMessageBox.confirm('删除后无法恢复，确认删除吗？', '删除', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
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
  }).catch(() => {
    // 取消删除
  })
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
.medical-body {
  display: flex;
  margin-top: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
