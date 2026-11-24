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
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="item.uuid">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <commonMultiRecordEditRender :curMedicalInfo="curMedicalInfo" :fieldInfo="getEditFieldInfo(fieldInfo)" :formData="formData" :singleFormData="item"></commonMultiRecordEditRender>
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
  name: 'LabCheck',
  inheritAttrs: false
})
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonMultiRecordEditRender from '@/components/medicalRecord/standardizedMedical/commonMultiRecordEditRender.vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
// 基本信息
import { ref, watch } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
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
if (props.mode === 'proofread') {
  rowCount.value = 3
}
const updateRowCount = (count) => {
  rowCount.value = count
  fieldInfo[1].rowCount = count
  fieldInfo[2].rowCount = count
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
    label: '基本信息',
    component: 'ul-li',
    rowCount: 2,
    onlyEdit: true,
    children: [
      {
        label: '科室',
        key: 'department',
        component: 'el-input',
        type: 'text',
        onlyEdit: true
      }
    ]
  },
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
        // customFormat: true,
        // format: 'YYYY-MM-DD HH:mm'
      }
    ]
  },
  {
    label: '',
    key: 'content',
    component: 'el-table',
    addText: '添加1行检验信息',
    maxCount: 100,
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
        width: 80
      },
      {
        label: '结果',
        key: 'value',
        component: 'el-input',
        type: 'text',
        width: 80,
        needJudge: true
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
        width: 80,
        needJudge: true
      },
      {
        label: '单位',
        key: 'unit',
        component: 'el-input',
        type: 'text',
        width: props.mode === 'proofread' ? 43 : 25,
        editWidth: 80
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 35,
        onlyEdit: true
      }
    ]
  },
  {
    label: '检验诊断',
    key: 'diagnosis',
    component: 'singleDiv'
  }
]
if (props.isEdit) {
  updateRowCount(2)
}
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
    const pageIds = []
    res.content.forEach((item, index) => {
      const content = []
      item.content.forEach((item, index) => {
        content.push({
          uuid: uuidv4(),
          ...item
        })
      })
      formData.value[index] = {
        uuid: uuidv4(),
        type: item.type,
        specimen_type: item.specimen_type,
        time: item.time,
        department: item.department,
        diagnosis: item.diagnosis,
        content,
        page_ids: item.page_ids || []
      }
      if (item.page_ids) {
        pageIds.push(...item.page_ids)
      }
    })
    // 对pageIds进行去重处理
    medicalStore.setMedicalPageList([...new Set(pageIds)])
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
// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  console.log('medicalStore.editingMedical', medicalStore.editingMedical)
  const content = _.cloneDeep(medicalStore.editingMedical)
  // 删除content中的uuid
  content.forEach(item => {
    delete item.uuid
    item.content.forEach(item => {
      delete item.uuid
    })
  })
  return content
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
