<template>
  <template v-if="!isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <header class="header" :id="'page_'+ item.page_ids + '_' + index">
          <WordHighlighter highlightClass="highlight" :query="lightQuery">
            <div class="time-card" :data-evidence-field="`operations[${index}].start_time`"><span class="time-index">[{{ index }}]</span>{{item.start_time || '-'}}</div>
            <div class="typeTitle" :data-evidence-field="`operations[${index}].op_name`">{{item.op_name || '-'}}</div>
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
  name: 'SurgeryRecord',
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
  typeName: '手术记录'
})
const formData = ref([])

/** 构建证据路径前缀：operations[index] */
const evidencePathPrefix = (index) => {
  return `operations[${index}]`
}
const rowCount = ref(5)
if (props.mode === 'proofread') {
  rowCount.value = 3
}
const updateRowCount = (count) => {
  rowCount.value = count
  fieldInfo[1].rowCount = count
  // fieldInfo[2].rowCount = count
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
    key: 'start_time',
    component: 'el-date-picker',
    onlyEdit: true
  },
  {
    label: '基本信息',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '手术开始时间',
        key: 'start_time'
      },
      {
        label: '手术结束时间',
        key: 'end_time',
        component: 'el-date-picker'
      },
      {
        label: '手术名称',
        key: 'op_name',
        component: 'el-input',
        type: 'text',
        onlyEdit: true
      },
      {
        label: '手术持续时间',
        key: 'duration',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '手术性质',
        key: 'property',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '切口类型',
        key: 'incision_type',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '麻醉方法',
        key: 'anesthesia',
        component: 'el-input',
        type: 'text'
      }
    ]
  },
  {
    label: '术前诊断',
    key: 'pre_diagnosis',
    component: 'singleDiv'
  },
  {
    label: '术中诊断',
    key: 'intra_diagnosis',
    component: 'singleDiv'
  },
  {
    label: '手术经过',
    key: 'process',
    component: 'singleDiv'
  }
]
if (props.isEdit) {
  updateRowCount(2)
}
const getEditFieldInfo = (fieldInfo) => {
  // 去除fieldInfo中的检查时间
  const newFieldInfo = _.cloneDeep(fieldInfo)
  newFieldInfo[1].children = newFieldInfo[1].children.filter(item => item.label !== '手术开始时间')
  return newFieldInfo
}
loading.value = true

const getData = () => {
  getMedicalDetailsData(props).then(res => {
    if (!res) {
      loading.value = false
      return
    }
    const pageIds = []
    const orderPageIds = []
    res.jsonData.forEach((item, index) => {
      formData.value[index] = {
        uuid: uuidv4(),
        op_name: item.op_name,
        start_time: item.start_time,
        end_time: item.end_time || '',
        duration: item.duration,
        property: item.property,
        incision_type: item.incision_type,
        anesthesia: item.anesthesia,
        pre_diagnosis: item.pre_diagnosis,
        intra_diagnosis: item.intra_diagnosis,
        process: item.process,
        bleeding_volume: item.bleeding_volume,
        start_end_time: item.start_end_time,
        page_ids: item.page_ids ? item.page_ids.map(id => parseInt(id) + 1).join(',') : ''
      }
      if (item.page_ids) {
        pageIds.push(...item.page_ids)
        orderPageIds.push(item.page_ids)
      }
    })
    if (medicalStore.showOperationView) {
      res.rawData.forEach((item, index) => {
        if (formData.value[index]) {
          Object.assign(formData.value[index], {
            oldop_name: item.op_name,
            oldstart_time: item.start_time,
            oldend_time: item.end_time || '',
            oldduration: item.duration,
            oldproperty: item.property,
            oldincision_type: item.incision_type,
            oldanesthesia: item.anesthesia,
            oldpre_diagnosis: item.pre_diagnosis,
            oldintra_diagnosis: item.intra_diagnosis,
            oldprocess: item.process,
            oldbleeding_volume: item.bleeding_volume,
            oldstart_end_time: item.start_end_time,
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
    start_time: '',
    end_time: '',
    anesthesia: '',
    bleeding_volume: '',
    duration: '',
    incision_type: '',
    intra_diagnosis: '',
    op_name: '',
    pre_diagnosis: '',
    process: '',
    property: '',
    start_end_time: '',
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
