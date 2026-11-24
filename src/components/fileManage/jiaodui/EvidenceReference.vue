<template>
  <div class="evidence-reference">
    <!-- 标题栏：引用证据 | 右侧：N条·质量：XXX -->
    <div class="evidence-title-bar">
      <span class="evidence-title">引用证据</span>
      <div class="evidence-meta">
        <span class="meta-count">{{ evidenceList?.length }}条</span>
        <span class="meta-sep">·</span>
        <span>质量：</span>
        <template v-if="isEdit">
          <el-select
            v-model="evidence_quality"
            class="quality-select"
            size="default"
            placeholder="请选择一项"
            popper-class="evidence-popper"
          >
            <el-option
              v-for="opt in qualityOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>
        <span v-else class="quality-text">{{ qualityMap[evidence_quality] || evidence_quality || '-' }}</span>
      </div>
    </div>

    <!-- 证据列表 -->
    <div class="evidence-list" :class="{isEdit,pd24:isEdit}">
      <div v-for="(item, index) in evidenceList" :key="index" class="evidence-row"
           :class="{ 'is-selected': selectedIndex === index ,'is-view': !isEdit}"
           @click="handleRowClick(item,index)"
      >
        <!-- 编辑模式：下拉 + 输入 + 加减按钮 -->
        <template v-if="isEdit">
          <el-cascader
            :model-value="item.evidence_path"
            class="path-select"
            size="default"
            placeholder="请选择一项"
            :options="evidence_pathOptions"
            :props="{ multiple: false, checkStrictly: false, emitPath: false,value :'key',label :'nameCn' }"
            :show-all-levels="true"
            popper-class="evidence-popper"
            @update:model-value="(v) => updateField(index, 'evidence_path', v)"
          />
          <el-input
            type="textarea"
            :autosize="{ minRows: 1,maxRows: 3}"
            show-word-limit
            maxlength="10000"
            :model-value="item.evidence_text"
            class="text-input"
            size="default"
            placeholder="请填写内容"
            @update:model-value="(v) => updateField(index, 'evidence_text', v)"
          />

          <i class="iconfont icon-tianjiayihang" @click="addEvidence(index)"></i>
          <i v-if="evidenceList.length > 1" class="iconfont icon-shanchu-1" @click.stop="removeEvidence(index)"></i>
        </template>

        <!-- 查看模式：路径标签 + "摘录内容" -->
        <template v-else>
          <span class="view-label">{{ getArrayObjDeepkeyToPpathCn(evidence_pathOptions,item.evidence_path)?.pathCn || item.evidence_path || '-' }}：</span>
          <span class="view-text" :title="item?.evidence_text">"{{ item.evidence_text || '-' }}"</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject } from 'vue'
import { obtainCompleteJson, queryDataByKey } from '@/api/api_cot.js'
import { useMedicalPathStore } from '@/store/activeHighlightPath'
import { ElMessage } from 'element-plus'
import _ from 'lodash'
import { useMedicalStore } from '@/store/medicalStore'
// import { storeToRefs } from 'pinia'
const medicalStore = useMedicalStore()
const { recordId: recordIdStore } = medicalStore
const props = defineProps({
  isEdit: { type: Boolean, default: false },
  modelValue: { type: Array, default: () => [] },
  stepType: {
    type: Number,
    default: 1
  }
})
const emits = defineEmits(['pathOptions', 'change'])
const recordId = inject('recordId')
const activeIndex = inject('activeIndex')
const updateEvidenceCount = inject('updateEvidenceCount', null)

const evidence_pathOptions = ref([])

const qualityOptions = [
  { label: '直接记录', value: 'DIRECT_DOCUMENTED' },
  { label: '合理推断', value: 'INFERRED_REASONABLE' },
  { label: '缺失重建', value: 'ABSENT_RECONSTRUCTED' }
]

const qualityMap = Object.fromEntries(qualityOptions.map(opt => [opt.value, opt.label]))

const evidenceList = ref([])
const evidence_quality = ref('')
const selectedIndex = ref(-1)

// 初始化
watch(() => props.modelValue, (val) => {
  if (val) {
    // 深拷贝：断开与父组件数据的引用链，避免原地修改数组时通过共享引用触发父组件的 deep watcher
    evidenceList.value = val.mapped_emr_evidence
      ? _.cloneDeep(val.mapped_emr_evidence)
      : [{ evidence_path: '', evidence_text: '' }]
    evidence_quality.value = val?.evidence_quality || ''
  } else {
    evidenceList.value = [{ evidence_path: '', evidence_text: '' }]
    evidence_quality.value = ''
  }
  selectedIndex.value = -1
  updateEvidenceCount?.(evidenceList.value.length)
}, { immediate: true })

function addEvidence(idx) {
  if (evidenceList.value.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  evidenceList.value.splice(idx + 1, 0, { evidence_path: '', evidence_text: '' })
  updateEvidenceCount?.(evidenceList.value.length)
  // evidenceList.value.push({ evidence_path: '', evidence_text: '' })
}

function removeEvidence(index) {
  evidenceList.value.splice(index, 1)
  updateEvidenceCount?.(evidenceList.value.length)
}

const updateField = (index, field, value) => {
  if (field === 'evidence_path') {
    queryDataByKey({ recordId: recordId.value, key: value }).then(res => {
      if (res.code === 10000) {
        // 获取到的证据路径数据
        evidenceList.value[index].evidence_text = res.data?.value || ''
        updateEvidenceCount?.(evidenceList.value.length)
      }
    })
  }
  evidenceList.value[index][field] = value
  emits('change')
  updateEvidenceCount?.(evidenceList.value.length)
}

function getData() {
  return {
    evidence_quality: evidence_quality.value, // 质量
    mapped_emr_evidence: evidenceList.value // 证据列表
  }
}

watch(() => [evidence_quality.value, evidenceList.value], () => {
  if (props.isEdit) markDirty()
}, { deep: true })

function getValidateResult() {
  if (!evidence_quality.value) return false
  for (let i = 0; i < evidenceList.value.length; i++) {
    const item = evidenceList.value[i]
    if (!item.evidence_path) return false
    if (!item.evidence_text) return false
  }
  return true
}
const optionsShowList = [
  {
    label: '基本信息',
    value: 'basic_information',
    show: 1
  },
  {
    label: '入院记录',
    value: 'enter_record',
    show: 1
  },
  {
    label: '检验报告',
    value: 'inspections',
    show: 2
  },
  {
    label: '影像报告',
    value: 'image_reports',
    show: 2
  },
  {
    label: '病理报告',
    value: 'pathologies',
    show: 2
  },
  {
    label: '病程记录',
    value: 'course_record',
    show: 3
  },
  {
    label: '会诊记录',
    value: 'consultation_record',
    show: 3
  },
  {
    label: '医嘱',
    value: 'advices',
    show: 4
  },
  {
    label: '手术记录',
    value: 'operations',
    show: 4
  },
  {
    label: '出院记录',
    value: 'exit_record',
    show: 5
  }
]

function markDirty() {
  medicalStore.setDirty()
}

const optionsFilter = (data) => {
  if (activeIndex.value === 0 && !recordIdStore) {
    const showMap = new Map(optionsShowList.map(item => [item.value, item.show]))
    evidence_pathOptions.value = data.filter(item => {
      const show = showMap.get(item.key)
      return show !== undefined && show <= props.stepType
    })
  } else {
    evidence_pathOptions.value = data
  }
  emits('pathOptions', evidence_pathOptions.value)
}
watch(activeIndex, (val) => {
  optionsFilter(initTreeData.value)
})
const initTreeData = ref([])
const getDataList = () => {
  obtainCompleteJson({ recordId: recordId.value }).then(res => {
    if (res.code === 10000) {
      initTreeData.value = _.cloneDeep(res.data || [])
      optionsFilter(res.data || [])
    }
  })
}

const getArrayObjDeepkeyToPpathCn = (arr, key) => {
  let result = {}
  arr.forEach(item => {
    if (item.key === key) {
      result = item
    }
    if (item.children?.length) {
      const childResult = getArrayObjDeepkeyToPpathCn(item.children, key)
      if (Object.keys(childResult).length > 0) {
        result = childResult
      }
    }
  })
  return result
}
// 2. 初始化 store 实例
const medicalPathStore = useMedicalPathStore()
const handleRowClick = (item, index) => {
  // 如果是编辑模式，不执行此高亮逻辑
  if (props.isEdit) return

  // 更新内部选中索引
  selectedIndex.value = index

  // 将当前点击的证据路径（例如 'operations[0].start_time'）存入 pinia store
  if (item && item.evidence_path) {
    medicalPathStore.setActiveHighlightPath(item.evidence_path)
  }
}
getDataList() // 获取证据路径选项

defineExpose({ getData, getValidateResult })
</script>

<style lang="scss" scoped>
@use './cot-common.scss';

// 引用证据组件
// 设计稿样式：
//   - 顶部标题栏：左侧"引用证据"蓝色section标题，右侧"3条·质量：直接记录 ▾"
//   - 证据区块：#fafbfc 背景 + 1px #dbdbdb 边框
//   - 查看态每行：蓝色"入院记录-主诉"链接 + 灰色摘录文字
//   - 编辑态每行：左侧cascader + 右侧input + 字数统计 + 加/减按钮
.evidence-reference {
  // ========== 标题栏 ==========
  .evidence-title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .evidence-title {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-text);

      &::before {
        flex-shrink: 0;
        width: 3px;
        height: 16px;
        margin-right: 8px;
        background: var(--theme-primary);
        content: '';
      }
    }

    .evidence-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: var(--theme-text-2);

      .meta-count {
        font-weight: 500;
        color: var(--theme-primary);
      }

      .meta-sep {
        font-size: 18px;
        color: var(--theme-primary);
      }

      .quality-select {
        width: 90px;

        :deep(.el-select__wrapper) {
          height: 26px;
          min-height: 26px;
          padding: 0 6px;
          border-radius: 2px;
          background: var(--theme-card);
          box-shadow: 0 0 0 1px #d8d8d8 !important;

          .el-select__placeholder,
          .el-select__selected-item {
            font-size: 14px;
            color: var(--theme-text-2);
          }
        }
      }

      .quality-text {
        font-size: 14px;
        color: var(--theme-text-2);
      }
    }
  }

  // ========== 证据区块容器 ==========
  .evidence-list {
    overflow: hidden;
    &.is-edit {
      padding: 24px;
      border-radius: 6px;
      background: rgba(240, 243, 248, 0.3);
    }
  }

  .evidence-row {
    display: flex;
    align-items: center;

    &:not(.is-view) {
      padding-bottom: 16px;
      gap: 16px;
    }
    &:nth-last-child(1) {
      padding-bottom: 0;
    }
    .iconfont {
      margin: 0;
    }
    .path-select {
      flex: 0 0 155px;
      width: 155px !important;

      :deep(.el-input__wrapper) {
        height: 28px;
        border-radius: 2px;
        background: var(--theme-card);
        box-shadow: 0 0 0 1px #d8d8d8 !important;

        .el-input__inner {
          font-size: 12px;
          color: var(--theme-text);
        }
      }
    }

    .text-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        height: 28px;
        border-radius: 2px;
        background: var(--theme-card);
        box-shadow: 0 0 0 1px #d8d8d8 !important;

        .el-input__inner {
          font-size: 12px;
          color: var(--theme-text);
        }
      }
    }

    // ========== 查看模式行 ==========
    &.is-view {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 52px;
      margin-bottom: 16px;
      padding: 0 24px;
      border: 1px solid #dbdbdb;
      border-radius: 4px;
      cursor: pointer;

      &.is-selected {
        border: unset;
        border-left: 3px solid var(--theme-primary);
        background: rgba(234, 240, 255, 1);
      }

      .view-label {
        flex-shrink: 0;
        margin-right: 4px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-primary);
      }

      .view-text {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 16px;
        color: var(--theme-text-2);
        word-break: break-all;
        white-space: nowrap;
      }
    }
  }
}
.pd24 {
  box-sizing: border-box;
  padding: 24px;
  border-radius: 4px;
  background: rgba(240, 243, 248, 0.3);
}
</style>
