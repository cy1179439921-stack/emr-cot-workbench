<template>
  <template v-if="formData">
    <div class="medical-body">
      <div class="auto-next" v-if="isEdit">
        <span class="text">是否自动下一页</span>
        <el-switch v-model="autoNext"/>
      </div>
      <header class="header">
        <div class="select-section">
          <el-checkbox-group v-model="selectedTypes" @change="changeType">
            <el-checkbox
              v-for="type in types"
              :key="type"
              :value="type"
              :label="type"
              :disabled="!isEdit"
            >
              {{ type }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </header>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="props.agencyName + '-' + curMedicalInfo.title"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'OtherRecord',
  inheritAttrs: false
})
// 基本信息
import { computed, ref, watch } from 'vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import _ from 'lodash'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
const emits = defineEmits(['handleSaveImmediate'])
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
const currentPage = computed(() => medicalStore.currentPage)
const pageIds = ref([])
const autoNext = ref(true) // 是否自动下一页
watch(() => currentPage.value, (newVal) => {
  selectedTypes.value = formData.value[newVal - 1] || []
})
const loading = ref(false)
const formData = ref('')
const selectedTypes = ref([])
const rowCount = ref(3)
if (props.mode === 'proofread') {
  rowCount.value = 3
}

loading.value = true
const types = ref(['病案首页', '入院记录', '出院记录', '病程记录', '会诊记录', '实验室检查', '影像检查', '病理检查', '手术记录', '长期医嘱', '临时医嘱', '其他'])
const getData = () => {
  getMedicalDetailsData(props).then(data => {
    // if (data && data.content) {
    if (data) {
      pageIds.value = []
      const content = data.jsonData
      // // 遍历content，content是个json对象，key是page_ids，value是typeName，找到currentPage.value - 1对应的typeName，设置给selectedTypes
      // const typeNames = []
      for (const key in content) {
        if (Object.hasOwnProperty.call(content, key)) {
          const pageId = parseInt(key)
          // const typeName = content[key]
          pageIds.value.push(pageId)
          // typeNames.push(typeName)
        }
      }
      formData.value = _.cloneDeep(content)
      medicalStore.setMedicalPageList(pageIds.value || [])
      medicalStore.setMedicalOrderPageList(pageIds.value || [])
      medicalStore.setEditingMedical(formData.value)
      if (pageIds.value.length > 0) {
        if (currentPage.value === pageIds.value[0] + 1) {
          // 首页
          selectedTypes.value = formData.value[pageIds.value[0]] || []
        }
      }
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
  return formData.value
}
// 保存当前页病历类型
const changeType = (val) => {
  // 限制最多选择一个，取最后一个选中的值
  if (val.length > 1) {
    const lastSelected = val[val.length - 1]
    selectedTypes.value = [lastSelected]
    formData.value[currentPage.value - 1] = [lastSelected]
  } else {
    formData.value[currentPage.value - 1] = val
  }
  medicalStore.setEditingMedical(formData.value)
  if (formData.value[currentPage.value - 1].length === 1 && autoNext.value) {
    emits('handleSaveImmediate', true)
  } else {
    emits('handleSaveImmediate')
  }
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
.auto-next {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  .text {
    margin-right: 8px;
  }
}
.header {
  padding: 16px 20px;
  border-radius: 8px;
  background-color: var(--theme-fill);
  .typeTitle {
    margin-bottom: 16px;
    font-weight: 500;
    font-size: 18px;
    color: var(--theme-text);
  }
  .select-section {
    display: flex;
    align-items: flex-start;
    .select-label {
      margin-right: 12px;
      font-weight: 500;
      font-size: 14px;
      color: var(--theme-text-2);
      white-space: nowrap;
    }
    :deep(.el-checkbox-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 0;
      width: 100%;
      .el-checkbox {
        width: 25%;
        margin-right: 0;
        .el-checkbox__label {
          font-size: 14px;
          color: var(--theme-text);
        }
        .el-checkbox__input.is-checked + .el-checkbox__label {
          color: var(--theme-text);
        }
        .el-checkbox__input.is-checked .el-checkbox__inner {
          border-color: var(--theme-primary);
          background-color: var(--theme-primary);
        }
      }
    }
  }
}
.typeTitle {
  margin-bottom: 24px;
}
:deep(.section) {
  .commonUl-li {
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e4e4;
    .ul-2 {
      li:nth-child(1),
      li:nth-child(2),
      li:nth-child(3) {
        width: 33.3333% !important;
      }
      li:nth-child(3) {
        padding-right: 0;
      }
      li:nth-child(4) {
        width: 100% !important;
        padding-right: 0;
      }
    }
    .ul-3 {
      li:nth-child(1) {
        width: 33.3333% !important;
      }
      li:nth-child(2) {
        width: 33.3333% !important;
      }
      li:nth-child(3) {
        width: 33.3333% !important;
        padding-right: 0;
      }
    }
  }
}
</style>
