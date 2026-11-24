<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header advice-header">
        <!-- <WordHighlighter highlightClass="highlight" :query="lightQuery"> -->
        <div class="typeTitle">{{tabType === 1 ? '长期医嘱' : '临时医嘱'}}</div>
        <div class="title-line">
          <el-radio-group v-model="tabType">
            <el-radio-button :value="1">长期医嘱</el-radio-button>
            <el-radio-button :value="2">临时医嘱</el-radio-button>
          </el-radio-group>
        </div>
        <!-- </WordHighlighter> -->

      </header>
      <commonRecordRender :class="'commonRecordEditRender' + tabType" :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery"></commonRecordRender>
    </div>
  </template>
  <template v-else-if="isEdit && formData">
    <div class="medical-body">
      <header class="header advice-header">
        <div class="typeTitle">{{tabType === 1 ? '长期医嘱' : '临时医嘱'}}</div>
        <div class="title-line">
          <el-radio-group v-model="tabType">
            <el-radio-button :value="1">长期医嘱</el-radio-button>
            <el-radio-button :value="2">临时医嘱</el-radio-button>
          </el-radio-group>
        </div>
      </header>
      <commonRecordEditRender :class="'commonRecordEditRender' + tabType" :curMedicalInfo="curMedicalInfo" :fieldInfo="fieldInfo" :formData="formData"></commonRecordEditRender>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="(props.agencyName || '-') + '-病案首页'"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'DoctorAdvice',
  inheritAttrs: false
})
// 基本信息
import { ref } from 'vue'
// import WordHighlighter from 'vue-word-highlighter'
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonRecordEditRender from '@/components/medicalRecord/standardizedMedical/commonRecordEditRender.vue'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
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
const tabType = ref(1)
const loading = ref(false)
const formData = ref('')
// const rowCount = ref(5)
const fieldInfo = [
  {
    label: '',
    key: 'long_term',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行长期医嘱',
    maxCount: 2000,
    border: false,
    header: [
      {
        label: '开始时间',
        key: 'time',
        component: 'el-date-picker',
        // sortable: true,
        width: props.mode === 'proofread' ? 80 : 80
      },
      {
        label: '医嘱内容',
        key: 'advice',
        component: 'el-input',
        type: 'text',
        width: props.mode === 'proofread' ? 100 : 100
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 17,
        onlyEdit: true
      }
    ]
  },
  {
    label: '',
    key: 'short_term',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行临时医嘱',
    maxCount: 2000,
    border: false,
    header: [
      {
        label: '开始时间',
        key: 'time',
        component: 'el-date-picker',
        // sortable: true,
        width: props.mode === 'proofread' ? 80 : 80
      },
      {
        label: '医嘱内容',
        key: 'advice',
        component: 'el-input',
        type: 'text',
        width: props.mode === 'proofread' ? 100 : 100
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 17,
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
    // 判断data.content是否为空对象
    if (data && data.content && Object.keys(data.content).length !== 0) {
      const content = data.content
      const long_term_page_ids = content.long_term.page_ids || []
      const short_term_page_ids = content.short_term.page_ids || []
      const page_ids = long_term_page_ids.concat(short_term_page_ids)
      // 对page_ids进行去重
      medicalStore.setMedicalPageList(Array.from(new Set(page_ids)))
      const advices1 = content.long_term.advices || []
      const advices2 = content.short_term.advices || []
      // content.forEach(item => {
      //   item.uuid = uuidv4()
      // })
      if (advices1.length > 0 || advices2.length > 0) {
        advices1.forEach(item => {
          item.uuid = uuidv4()
        })
        advices2.forEach(item => {
          item.uuid = uuidv4()
        })
      }
      formData.value = {
        long_term: advices1,
        short_term: advices2,
        long_term_page_ids,
        short_term_page_ids
      }
    } else {
      medicalStore.setMedicalPageList(Array.from(new Set([])))
      formData.value = {
        long_term: [],
        short_term: [],
        long_term_page_ids: [],
        short_term_page_ids: []
      }
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
  console.log('medicalStore.editingMedical', medicalStore.editingMedical)
  const newLongTerm = medicalStore.editingMedical.long_term
    .map(({ uuid, ...rest }) => rest)
    .sort((a, b) => new Date(a.time) - new Date(b.time))
  const newShortTerm = medicalStore.editingMedical.short_term
    .map(({ uuid, ...rest }) => rest)
    .sort((a, b) => new Date(a.time) - new Date(b.time))
  const params = {
    long_term: {
      advices: newLongTerm,
      page_ids: medicalStore.editingMedical.long_term_page_ids
    },
    short_term: {
      advices: newShortTerm,
      page_ids: medicalStore.editingMedical.short_term_page_ids
    }
  }
  return params
}
defineExpose({
  saveOldData,
  recoverOldData,
  getEditingMedicalContent,
  getData
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.medical-body {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 71px;
    :deep(.title-line) {
      width: 300px;
      height: 32px;
      margin-top: 0;
      .el-radio-group {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        height: 100%;
        .el-radio-button__original-radio:checked+.el-radio-button__inner {
          background-color: inherit;
          font-weight: 500;
          color: var(--theme-primary);
        }
        .el-radio-button__inner {
          font-weight: 400;
          color: var(--theme-text-2);
        }
      }
    }
  }
  :deep(.el-table) {
    margin-top: 0 !important;
  }
  :deep(.commonRecordEditRender1) {
    .section:nth-child(2) {
      display: none;
    }
  }
  :deep(.commonRecordEditRender2) {
    .section:nth-child(1) {
      display: none;
    }
  }
}
</style>
