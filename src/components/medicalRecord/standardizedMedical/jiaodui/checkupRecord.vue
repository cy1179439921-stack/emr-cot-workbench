<template>
  <template v-if="!isEdit && formData.length > 0">
    <!-- <div class="allPages"> -->
    <!-- <template v-if="!medicalStore.showOperationView">
        <div class="title">所有页码：{{ allPages }}</div>
      </template>
      <template v-else>
        <div class="title">所有页码：
          <DiffViewer :original="oldAllPages" :polished="allPages"></DiffViewer>
        </div>
      </template> -->
    <!-- </div> -->
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <header class="header">
          <WordHighlighter highlightClass="highlight" :query="props.lightQuery">
            <div class="time-card" :data-evidence-field="`course_record.ward_records[${index}].time`"><span class="time-index">[{{ index }}]</span>{{item.time || '-'}}</div>
            <!-- <div class="typeTitle">{{props.agencyName || '-'}}-{{curMedicalInfo.title}}</div> -->
            <div class="typeTitle">{{curMedicalInfo.title}}</div>
            <div class="typeTitle2"><span class="content-ellipsis" :title="item.doctor" :data-evidence-field="evidencePathPrefix(index) + '.doctor'">{{item.doctor || '-'}}</span>医师查房</div>
          </WordHighlighter>
        </header>
        <commonRecordRender :fieldInfo="fieldInfo" :formData="item" :lightQuery="lightQuery" :pathPrefix="evidencePathPrefix(index)"></commonRecordRender>
      </div>
    </div>
  </template>
  <template v-else-if="isEdit && formData.length > 0">
    <div class="allPages">
      <div class="title">所有页码</div>
      <el-input v-model="allPages" placeholder="请填写页码，如 12"></el-input>
    </div>
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
import commonMultiRecordEditRender from '@/components/medicalRecord/standardizedMedical/jiaodui/commonMultiRecordEditRender.vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { ref, onMounted } from 'vue'
import WordHighlighter from 'vue-word-highlighter'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
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
const formData = ref([])

/** 构建证据路径前缀：course_record.ward_records[index] */
const evidencePathPrefix = (index) => {
  return `course_record.ward_records[${index}]`
}

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
        label: '查房医师',
        key: 'doctor',
        component: 'el-input',
        type: 'text',
        onlyEdit: true
      }
    ]
  },
  {
    label: '查房记录',
    key: 'content',
    component: 'singleDiv'
  }
]
const totalMedicalContent = ref()
const oldTotalMedicalContent = ref()
loading.value = true
const allPages = ref('')
const oldAllPages = ref('')
const getData = () => {
  getMedicalDetailsData(props).then(res => {
    if (res && res.jsonData) {
      totalMedicalContent.value = res.jsonData
      totalMedicalContent.value.ward_records.forEach((item, index) => {
        formData.value[index] = {
          uuid: uuidv4(),
          time: item.time,
          doctor: item.doctor,
          content: item.content
        }
      })
      if (medicalStore.showOperationView) {
        oldTotalMedicalContent.value = res.rawData
        oldAllPages.value = oldTotalMedicalContent.value.page_ids.map(id => parseInt(id) + 1).join(',')
        oldTotalMedicalContent.value.other_records?.forEach((item, index) => {
          if (formData.value[index]) {
            Object.assign(formData.value[index], {
              oldtime: item.time,
              olddoctor: item.doctor,
              oldcontent: item.content
            })
          }
        })
      }
      emits('updateCount', formData.value.length)
      loading.value = false
    }
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
    doctor: '',
    content: ''
  })
  return formData.value.length
}
// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  // 获取medicalStore.editingMedical的值，根据数组内的time，按照先后顺序排序
  const sortedMedical = medicalStore.editingMedical
  let pageIds = allPages.value
  if (pageIds) {
    pageIds = pageIds.replace(/，/g, ',').split(',').map(id => parseInt(id) - 1)
  }
  // 组装数据
  const params = {
    first_record: totalMedicalContent.value.first_record,
    visit_id: totalMedicalContent.value.visit_id,
    other_records: totalMedicalContent.value.other_records,
    ward_records: sortedMedical.map(item => {
      return {
        time: item.time,
        doctor: item.doctor,
        content: item.content
      }
    }),
    page_ids: pageIds
  }
  return params
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
.header {
  margin-bottom: 24px;
}
:deep(.typeTitle) {
  margin-bottom: 10px !important;
}
:deep(.typeTitle2) {
  span {
    display: inline-block;
    max-width: calc(100% - 100px);
  }
}
.allPages {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding-left: 24px;
  padding-right: 24px;
  // .title {
  //   font-weight: 600;
  //   color: var(--theme-text);
  // }
  :deep(.el-input) {
    flex: 1;
    margin-left: 8px;
  }
}
</style>
