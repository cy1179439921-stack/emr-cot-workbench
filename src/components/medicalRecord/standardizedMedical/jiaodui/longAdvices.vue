<template>
  <template v-if="!isEdit && formData">
    <div class="medical-body">
      <header class="header advice-header">
        <div class="typeTitle">长期医嘱</div>
      </header>
      <commonRecordRender :class="'commonRecordEditRender' + tabType" :fieldInfo="fieldInfo" :formData="formData" :lightQuery="lightQuery" :pathPrefix="'advices.long_advices'"></commonRecordRender>
    </div>
  </template>
  <template v-else-if="isEdit && formData">
    <div class="medical-body">
      <header class="header tools">
        <div class="btns">
          <div class="left">
            <div class="toolItem">
              <el-button type="primary" link @click="toMove">移动</el-button>
              <div class="move-div">
                将第
                <el-input
                  style="width: 60px;"
                  v-model="moveRowNumber"
                  placeholder="请填写内容"
                />
                行移动到第
                <el-input
                  style="width: 60px;"
                  v-model="targetRowNumber"
                  placeholder="请填写内容"
                />行
              </div>
            </div>
            <div class="toolItem">
              <el-button type="primary" link @click="toPaste">粘贴</el-button>
              <div class="move-div">
                将第
                <el-input
                  style="width: 60px;"
                  v-model="copyRowNumber"
                  placeholder="请填写内容"
                />
                行内容粘贴到第
                <el-input
                  style="width: 60px;"
                  v-model="pasteRowNumber"
                  placeholder="请填写内容"
                />行
              </div>
            </div>
          </div>
          <div class="right">
            <div class="tool-textarea">
              <el-input
                v-model="toolTextarea"
                style="flex: 1;"
                :rows="2"
                type="textarea"
                placeholder="请填写内容"
              />
            </div>
            <div class="tool-btns">
              <el-button type="primary" link @click="assignMultiValue">多行赋值</el-button>
              <div class="text">起始行：</div>
              <el-input
                style="width: 60px;"
                v-model="startLineNumber"
                placeholder="请填写内容"
              />
              <div class="text">结束行：</div>
              <el-input
                style="width: 60px;"
                v-model="endLineNumber"
                placeholder="请填写内容"
              />
            </div>
          </div>
        </div>
      </header>
      <div class="advice-div">
        <div class="allPages">
          <div class="title">页码：</div>
          <el-input v-model="longAllPages" placeholder="请填写页码，如 12" @change="markDirty"></el-input>
        </div>
        <commonAdviceEditRender ref="commonRecordEditRenderRef" :class="'commonRecordEditRender' + tabType" :curMedicalInfo="curMedicalInfo" :fieldInfo="fieldInfo" :formData="formData" @updateFormData="addLine"></commonAdviceEditRender>
      </div>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="(props.agencyName || '-') + '-病案首页'"></emptyMedicalRecord>
  </template>
</template>
<script setup>
defineOptions({
  name: 'LongAdvices',
  inheritAttrs: false
})
// 基本信息
import { ref, onMounted } from 'vue'
// import WordHighlighter from 'vue-word-highlighter'
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonAdviceEditRender from '@/components/medicalRecord/standardizedMedical/jiaodui/commonAdviceEditRender.vue'
// import DiffViewer from '@/components/common/DiffViewer.vue'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { useMedicalStore } from '@/store/medicalStore'
import { ElMessage } from 'element-plus'
const medicalStore = useMedicalStore()
const toolTextarea = ref('')
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
const moveRowNumber = ref(0)
const targetRowNumber = ref(0)
const copyRowNumber = ref(0)
const pasteRowNumber = ref(0)
const startLineNumber = ref(0)
const endLineNumber = ref(0)
const formData = ref('')
// const rowCount = ref(5)
const fieldInfo = [
  {
    label: '',
    key: 'long_term',
    component: 'el-table',
    // fixed: true,
    className: 'proofreadTable',
    addText: '添加1行长期医嘱',
    maxCount: 2000,
    border: false,
    header: [
      {
        label: '',
        key: '',
        component: '',
        type: '',
        // fixed: 'left',
        width: 17
      },
      {
        label: '开始时间',
        key: 'start_time',
        component: 'el-date-picker',
        customFormat: true,
        format: 'YYYY-MM-DD HH:mm',
        width: 70
      },
      {
        label: '医嘱内容',
        key: 'name',
        component: 'el-input',
        type: 'text',
        width: 130,
        hiddenLimit: true
      },
      {
        label: '医嘱类型',
        key: 'type',
        component: 'el-select',
        allowCreate: true,
        enums: [
          {
            label: '药品',
            value: '药品'
          },
          {
            label: '护理',
            value: '护理'
          },
          {
            label: '饮食',
            value: '饮食'
          },
          {
            label: '检查',
            value: '检查'
          },
          {
            label: '治疗',
            value: '治疗'
          },
          {
            label: '嘱托',
            value: '嘱托'
          },
          {
            label: '手术',
            value: '手术'
          },
          {
            label: '其他',
            value: '其他'
          }
        ],
        width: 50
      },
      {
        label: '是否药品医嘱',
        key: 'is_drug',
        component: 'el-select',
        enums: [
          {
            label: '是',
            value: '是'
          },
          {
            label: '否',
            value: '否'
          }
        ],
        width: 30
      },
      {
        label: '给药途径',
        key: 'administration',
        component: 'el-select',
        allowCreate: true,
        width: 53,
        enums: [
          {
            label: '静脉滴注',
            value: '静脉滴注'
          },
          {
            label: '肌肉注射',
            value: '肌肉注射'
          },
          {
            label: '静脉注射',
            value: '静脉注射'
          },
          {
            label: '皮下注射',
            value: '皮下注射'
          },
          {
            label: '口服',
            value: '口服'
          },
          {
            label: '含服',
            value: '含服'
          },
          {
            label: '舌下含服',
            value: '舌下含服'
          },
          {
            label: '吸入',
            value: '吸入'
          },
          {
            label: '外用',
            value: '外用'
          },
          {
            label: '鼻饲',
            value: '鼻饲'
          },
          {
            label: '雾化吸入',
            value: '雾化吸入'
          },
          {
            label: '膀胱灌注',
            value: '膀胱灌注'
          },
          {
            label: '膀胱冲洗',
            value: '膀胱冲洗'
          },
          {
            label: '直肠给药',
            value: '直肠给药'
          },
          {
            label: '皮试',
            value: '皮试'
          },
          {
            label: '静脉泵入',
            value: '静脉泵入'
          },
          {
            label: '术中冲洗',
            value: '术中冲洗'
          },
          {
            label: '术中局部注射',
            value: '术中局部注射'
          }
        ]
      },
      {
        label: '给药频次',
        key: 'frequency',
        component: 'el-input',
        type: 'text',
        width: 40,
        hiddenLimit: true
      },
      {
        label: '单次剂量及单位',
        key: 'dose_unit',
        component: 'el-input',
        type: 'text',
        width: 40,
        hiddenLimit: true
      },
      {
        label: '结束时间',
        key: 'end_time',
        component: 'el-date-picker',
        customFormat: true,
        format: 'YYYY-MM-DD HH:mm',
        width: 70
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 40,
        onlyEdit: true,
        // buttonText: '同步后面时间',
        // buttonText3: '同步后面结束时间',
        buttonText2: '添加一行',
        buttonText3: '生成副本'
        // fixed: 'right'
      }
    ]
  }
]
loading.value = true
const longAllPages = ref('')
const oldLongAllPages = ref('')
const totalMedicalContent = ref()
const oldTotalMedicalContent = ref()
const toMinuteTime = (time) => {
  if (!time) return ''
  return String(time).slice(0, 16)
}
const toSecondTime = (time) => {
  if (!time) return ''
  const minuteTime = toMinuteTime(time)
  return minuteTime ? `${minuteTime}:00` : ''
}
const normalizeAdviceTimeToMinute = (item) => {
  return {
    ...item,
    start_time: toMinuteTime(item.start_time),
    end_time: toMinuteTime(item.end_time)
  }
}
const normalizeAdviceTimeToSecond = (item) => {
  return {
    ...item,
    start_time: toSecondTime(item.start_time),
    end_time: toSecondTime(item.end_time)
  }
}
const getData = () => {
  getMedicalDetailsData(props).then(data => {
    // 判断data.jsonData是否为空对象
    if (data && data.jsonData && Object.keys(data.jsonData).length !== 0) {
      totalMedicalContent.value = data.jsonData
      longAllPages.value = totalMedicalContent.value.long_advices.page_ids || []
      medicalStore.setMedicalPageList(longAllPages.value)
      medicalStore.setMedicalOrderPageList(longAllPages.value)
      longAllPages.value = longAllPages.value.map(id => parseInt(id) + 1).join(',')
      const advices1 = totalMedicalContent.value.long_advices?.items || []
      if (advices1.length > 0) {
        advices1.forEach(item => {
          item.uuid = uuidv4()
          item.start_time = toMinuteTime(item.start_time)
          item.end_time = toMinuteTime(item.end_time)
        })
      }
      const pageIds = totalMedicalContent.value.long_advices.page_ids || []
      formData.value = {
        long_term: advices1,
        page_ids: totalMedicalContent.value.long_advices ? pageIds.map(id => parseInt(id) + 1).join(',') : ''
      }
      if (medicalStore.showOperationView) {
        oldTotalMedicalContent.value = data.rawData
        oldLongAllPages.value = oldTotalMedicalContent.value.long_advices.page_ids.map(id => parseInt(id) + 1).join(',')
        const advices1 = oldTotalMedicalContent.value.long_advices?.items || []
        Object.assign(formData.value, {
          oldlong_term: advices1.map(item => normalizeAdviceTimeToMinute(item)),
          oldpage_ids: oldTotalMedicalContent.value.long_advices ? oldTotalMedicalContent.value.long_advices.page_ids.map(id => parseInt(id) + 1).join(',') : ''
        })
      }
    } else {
      medicalStore.setMedicalPageList(Array.from(new Set([])))
      formData.value = {
        long_term: [],
        page_ids: ''
      }
    }
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
// 覆盖当前值
const assignMultiValue = () => {
  if (!toolTextarea.value) {
    ElMessage.warning('请粘贴要填入的内容')
    return
  }
  const startRow = Number(startLineNumber.value) || 0
  const endRow = Number(endLineNumber.value) || 0
  const currentData = medicalStore.editingMedical.long_term || []

  // 验证行号
  if (startRow <= 0 || endRow <= 0) {
    ElMessage.warning('请填写起始行和结束行（从 1 开始）')
    return
  }
  if (startRow > currentData.length || endRow > currentData.length) {
    ElMessage.warning(`行号超出范围（当前表格共${currentData.length}行）`)
    return
  }
  if (startRow > endRow) {
    ElMessage.warning('起始行不能大于结束行')
    return
  }

  const lines = toolTextarea.value.split(/\r?\n/).filter(line => line.trim() !== '')
  const rowCount = endRow - startRow + 1
  if (lines.length !== rowCount) {
    ElMessage.warning(`输入行数必须等于起始行到结束行的行数（需要${rowCount}行），您输入了${lines.length}行`)
    return
  }

  lines.forEach((line, index) => {
    const targetIndex = startRow + index - 1
    currentData[targetIndex] = {
      ...currentData[targetIndex],
      name: line.trim()
    }
  })
  markDirty()
  ElMessage.success(`已成功赋值第${startRow}行至第${endRow}行`)
}
// 移动行功能
const toMove = () => {
  const fromRow = Number(moveRowNumber.value) || 0
  const toRow = Number(targetRowNumber.value) || 0
  const currentData = medicalStore.editingMedical.long_term || []

  // 验证行号
  if (fromRow <= 0 || toRow <= 0) {
    ElMessage.warning('请填写行号（从 1 开始）')
    return
  }
  if (fromRow > currentData.length || toRow > currentData.length) {
    ElMessage.warning(`行号超出范围（当前表格共${currentData.length}行）`)
    return
  }
  if (fromRow === toRow) {
    ElMessage.warning('起始行和目标行不能是同一行')
    return
  }

  // 转换为0-based索引
  const fromIndex = fromRow - 1
  const toIndex = toRow - 1

  // 移动元素
  const item = currentData.splice(fromIndex, 1)[0]
  currentData.splice(toIndex, 0, item)
  markDirty()

  ElMessage.success(`已将第${fromRow}行移动到第${toRow}行`)
}
// 粘贴行功能
const toPaste = () => {
  const fromRow = Number(copyRowNumber.value) || 0
  const toRow = Number(pasteRowNumber.value) || 0
  const currentData = medicalStore.editingMedical.long_term || []

  // 验证行号
  if (fromRow <= 0 || toRow <= 0) {
    ElMessage.warning('请填写行号（从 1 开始）')
    return
  }
  if (fromRow > currentData.length || toRow > currentData.length) {
    ElMessage.warning(`行号超出范围（当前表格共${currentData.length}行）`)
    return
  }
  if (fromRow === toRow) {
    ElMessage.warning('源行和目标行不能是同一行')
    return
  }

  // 转换为0-based索引
  const fromIndex = fromRow - 1
  const toIndex = toRow - 1

  // 复制内容，排除uuid
  const sourceData = { ...currentData[fromIndex] }
  delete sourceData.uuid

  // 粘贴到目标行（保留目标行的uuid）
  currentData[toIndex] = {
    ...currentData[toIndex],
    ...sourceData
  }

  markDirty()
  ElMessage.success(`已将第${fromRow}行内容粘贴到第${toRow}行`)
}
// 添加一行时，自动将行号赋值给copyRowNumber和pasteRowNumber
const addLine = (index) => {
  copyRowNumber.value = index + 1
  pasteRowNumber.value = index + 2
}
const commonRecordEditRenderRef = ref(null)
// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  let longPageIds = longAllPages.value
  if (longPageIds) {
    longPageIds = longPageIds.replace(/，/g, ',').split(',').map(id => parseInt(id) - 1)
  }
  const newLongTerm = medicalStore.editingMedical.long_term
    .map(({ uuid, ...rest }) => normalizeAdviceTimeToSecond(rest))
  const params = {
    long_advices: {
      items: newLongTerm,
      page_ids: longPageIds
    },
    short_advices: totalMedicalContent.value.short_advices
  }
  return params
}
const markDirty = () => {
  medicalStore.setDirty(true)
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
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  .common-record-render {
    padding-top: 24px !important;
  }
  .tools {
    box-sizing: border-box;
    padding: 8px;
    border-radius: 8px;
    background-color: #dce6ff;
  }
  .header {
    display: flex;
    flex-direction: column;
    .typeTitle {
      margin: 24px 0;
    }
    .btns {
      display: flex;
      .left {
        display: flex;
        flex-direction: column;
        margin-right: 16px;
      }
      .toolItem {
        display: flex;
        align-items: center;
        margin-top: 8px;
        .move-div {
          display: flex;
          align-items: center;
          margin-left: 16px;
          .el-input {
            margin-left: 8px;
            margin-right: 8px;
          }
        }
      }
      .right {
        display: flex;
        flex-direction: column;
        flex: 1;
        box-sizing: border-box;
        padding-left: 16px;
        border-left: 1px solid #999;
        .tool-textarea {
          width: 100%;
        }
        .text {
          margin-left: 16px;
        }
        .tool-btns {
          display: flex;
          align-items: center;
        }
      }
    }
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
    .el-input__wrapper,
    .el-select__wrapper {
      padding: 0 4px;
      // border: 1px solid #d8d8d8;
      // box-shadow: none;
    }
    .el-select__wrapper {
      font-size: 12px !important;
    }
    .el-input__inner {
      font-size: 12px !important;
    }
    .el-input__prefix {
      display: none;
    }
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
.allPages {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 50%;
  margin-top: 16px;
  margin-bottom: 16px;
  .title {
    display: flex;
    align-items: center;
    color: var(--theme-text);
  }
  :deep(.el-input) {
    flex: 1;
  }
}
</style>
<style lang="scss">
.advice-div {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 0;
  .commonRecordEditRender1 {
    display: flex;
    flex: 1;
    height: 0;
    .el-form {
      height: 100%;
      .section {
        display: flex;
        flex-direction: column;
        height: 100%;
        .proofreadTable {
          flex: 1;
          height: 0;
        }
      }
    }
  }
}
</style>
