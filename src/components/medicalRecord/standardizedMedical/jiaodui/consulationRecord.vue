<template>
  <template v-if="!isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <header class="header" :id="'page_'+ item.page_ids + '_' + index">
          <WordHighlighter highlightClass="highlight" :query="props.lightQuery">
            <div class="time-card" :data-evidence-field="`consultation_record[${index}].consultation_time`"><span class="time-index">[{{ index }}]</span>{{item.consultation_time || '-'}}</div>
            <div class="typeTitle">{{curMedicalInfo.title}}</div>
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
        <commonMultiRecordEditRender :fieldInfo="fieldInfo" :formData="formData" :singleFormData="item" :childId="'page_'+ item.page_ids + '_' + index"></commonMultiRecordEditRender>
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
  name: 'ConsulationRecord',
  inheritAttrs: false
})
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonMultiRecordEditRender from '@/components/medicalRecord/standardizedMedical/jiaodui/commonMultiRecordEditRender.vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { onMounted, ref } from 'vue'
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

/** 构建证据路径前缀：consultation_record[index] */
const evidencePathPrefix = (index) => {
  return `consultation_record[${index}]`
}
const fieldInfo = [
  {
    label: '时间轴',
    key: 'consultation_time',
    component: 'el-date-picker',
    onlyEdit: true
  },
  {
    label: '基本信息',
    component: 'ul-li',
    rowCount: 3,
    children: [
      {
        label: '会诊类型',
        key: 'consultation_type',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '申请科室',
        key: 'request_department',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '被邀请科室',
        key: 'consultation_department',
        component: 'el-input',
        type: 'text'
      }
    ]
  },
  {
    label: '会诊摘要',
    key: 'consultation_abstract',
    component: 'singleDiv'
  },
  {
    label: '会诊意见',
    key: 'consultation_advice',
    component: 'singleDiv'
  }
]
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
    totalMedicalContent.value?.forEach((item, index) => {
      formData.value[index] = {
        uuid: uuidv4(),
        consultation_time: item.consultation_time,
        consultation_type: item.consultation_type,
        request_department: item.request_department,
        consultation_department: item.consultation_department,
        consultation_abstract: item.consultation_abstract,
        consultation_advice: item.consultation_advice,
        page_ids: item.page_ids ? item.page_ids.map(id => parseInt(id) + 1).join(',') : ''
      }
      if (item.page_ids) {
        pageIds.push(...item.page_ids)
        orderPageIds.push(item.page_ids)
      }
    })
    // 对pageIds进行去重处理
    medicalStore.setMedicalPageList([...new Set(pageIds)])
    medicalStore.setMedicalOrderPageList(orderPageIds)
    if (medicalStore.showOperationView) {
      oldTotalMedicalContent.value = res.rawData
      oldTotalMedicalContent.value?.forEach((item, index) => {
        if (formData.value[index]) {
          Object.assign(formData.value[index], {
            oldconsultation_time: item.consultation_time,
            oldconsultation_type: item.consultation_type,
            oldrequest_department: item.request_department,
            oldconsultation_department: item.consultation_department,
            oldconsultation_abstract: item.consultation_abstract,
            oldconsultation_advice: item.consultation_advice,
            oldpage_ids: item.page_ids ? item.page_ids.map(id => parseInt(id) + 1).join(',') : ''
          })
        }
      })
    }
    emits('updateCount', formData.value.length)
    loading.value = false
  }).catch((e) => {
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
    consultation_time: '',
    consultation_type: '',
    request_department: '',
    consultation_department: '',
    consultation_abstract: '',
    consultation_advice: '',
    page_ids: ''
  })
  return formData.value.length
}
// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  // 获取medicalStore.editingMedical的值，根据数组内的consultation_time，按照先后顺序排序
  const sortedMedical = medicalStore.editingMedical || []
  // 组装数据
  const params = sortedMedical.map(item => {
    return {
      consultation_time: item.consultation_time,
      consultation_type: item.consultation_type,
      request_department: item.request_department,
      consultation_department: item.consultation_department,
      consultation_abstract: item.consultation_abstract,
      consultation_advice: item.consultation_advice,
      page_ids: item.page_ids ? item.page_ids.replace(/，/g, ',').split(',').map(id => parseInt(id) - 1) : []
    }
  })
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
    // 找到修改的哪一次的会诊记录
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
  .title {
    font-weight: 600;
    color: var(--theme-text);
  }
  :deep(.el-input) {
    flex: 1;
    margin-left: 8px;
  }
}
</style>
