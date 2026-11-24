<template>
  <div class="demo-cot-panel" :class="{ 'is-editing': isEdit }">
    <!-- 面板头：当前节点 + 保存时间 -->
    <div class="panel-header">
      <div class="header-left">
        <span class="node-badge">N{{ step }}</span>
        <span class="panel-title">{{ stepName }}</span>
      </div>
      <div class="header-right">
        <span class="save-time">保存时间：<em>{{ saveTime || '-' }}</em></span>
      </div>
    </div>

    <el-scrollbar class="panel-scroll">
      <div class="panel-body">
        <!-- 锚定路径（锚定内容来自病历原文，始终只读） -->
        <div class="cot-section">
          <div class="section-title">锚定路径</div>
          <div class="anchor-row">
            <span class="anchor-path">{{ anchorPathText }}</span>
            <span class="anchor-time">{{ anchorTimeText }}</span>
          </div>
        </div>

        <!-- 各步骤的核心结构化字段 -->
        <div v-for="(group, gIndex) in groups" :key="gIndex" class="cot-section">
          <div class="section-title">{{ group.title }}</div>

          <!-- 编辑态 -->
          <template v-if="isEdit">
            <div v-if="group.type === 'grid'" class="field-grid">
              <div
                v-for="item in group.items"
                :key="item.field"
                :class="{ 'field-cell': true, 'is-edit': true, 'is-full': item.full }">
                <span class="field-label">{{ item.label }}</span>
                <div class="field-editor">
                  <DemoFieldEditor
                    v-model="formData[item.field]"
                    :field="item.field"
                    :type="item.type"
                    :label-map="diagnosisLabelMap" />
                </div>
              </div>
            </div>
            <div v-else class="long-text-editor">
              <DemoFieldEditor
                v-model="formData[group.field]"
                :field="group.field"
                type="text"
                word-limit />
            </div>
          </template>

          <!-- 查看态 -->
          <template v-else>
            <div v-if="group.type === 'grid'" class="field-grid">
              <div
                v-for="item in group.items"
                :key="item.field"
                :class="{ 'field-cell': true, 'is-full': item.full }">
                <span class="field-label">{{ item.label }}</span>
                <span class="field-value">{{ renderField(item, nodeData) }}</span>
              </div>
            </div>
            <div v-else class="long-text">{{ renderField(group, nodeData) }}</div>
          </template>
        </div>

        <!-- 引用证据（只读，编辑态下用于核对） -->
        <div class="cot-section">
          <div class="section-title">
            引用证据
            <span class="evidence-summary">{{ evidenceList.length }}条 · 质量：{{ qualityLabel }}</span>
          </div>
          <div v-if="!evidenceList.length" class="evidence-empty">暂无引用证据</div>
          <div v-else class="evidence-list">
            <div v-for="(item, index) in evidenceList" :key="index" class="evidence-card">
              <div class="evidence-head">
                <span class="evidence-path">{{ item.evidence_path }}</span>
                <span class="evidence-scope">{{ labelOf('evidence_scope', item.evidence_scope) }}</span>
              </div>
              <div class="evidence-text">{{ item.evidence_text }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <!-- 底部操作区 -->
    <div class="panel-footer">
      <template v-if="isEdit">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSaveDraft">暂 存</el-button>
        <el-button type="danger" class="next-btn" @click="handleNext">
          <span>{{ nextBtnText }}</span>
          <span class="next-chevron">»</span>
        </el-button>
      </template>
      <template v-else-if="isAuditMode">
        <el-button type="success" @click="emit('audit-pass')">审核通过</el-button>
        <el-button type="danger" @click="emit('audit-reject')">审核不通过</el-button>
      </template>
      <template v-else-if="isReannotateMode">
        <el-button type="primary" @click="emit('reannotate')">提交重新标注</el-button>
      </template>
      <template v-else-if="readonly">
        <span class="readonly-hint">只读查看，无校对权限</span>
      </template>
      <template v-else>
        <el-button type="primary" @click="emit('start-proofread')">开始校对</el-button>
      </template>
    </div>
  </div>
</template>

<script>
export default { name: 'DemoCotPanel' }
</script>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import _ from 'lodash'
import { COT_NODE_SECTIONS, COT_NODE_KEYS, kvLabel, labelOf } from '@/mock/cotCaseData'
import DemoFieldEditor from './demoFieldEditor.vue'

const props = defineProps({
  // 当前 Loop 的标注节点集合（anno_data.clinical_loop_network[n].nodes_annotation）
  nodesAnnotation: { type: Object, default: () => ({}) },
  // 原始病历（锚定时间缺失时回溯原文）
  oriData: { type: Object, default: () => ({}) },
  // 当前 Loop 标识（切换 Loop 时重置编辑数据）
  loopId: { type: String, default: '' },
  // 当前 COT 步骤
  step: { type: Number, default: 1 },
  // 步骤名称，如「初始呈象」
  stepName: { type: String, default: '' },
  // 最近保存时间
  saveTime: { type: String, default: '' },
  // 编辑态
  isEdit: { type: Boolean, default: false },
  // 是否处于当前 Loop 的最后一个阶段（N5）：底部按钮变为「保存并进入下一loop」
  isLastStep: { type: Boolean, default: false },
  // 当前 Loop 是否是本病历的最后一个 Loop（此时 N5 按钮变为「保存并进入下一份病历」）
  isLastLoop: { type: Boolean, default: false },
  // 只读模式（从标注管理进入，只允许查看）
  readonly: { type: Boolean, default: false },
  // 审核模式（任务详情进入审核）
  isAuditMode: { type: Boolean, default: false },
  // 重新标注模式（审核未通过后重新标注）
  isReannotateMode: { type: Boolean, default: false }
})

const emit = defineEmits(['audit-pass', 'audit-reject', 'reannotate', 'start-proofread', 'cancel', 'save-draft', 'next', 'change'])

// 底部主按钮文案：普通阶段「下一步」；中间 Loop 的 N5「保存并进入下一loop」；
// 最后一个 Loop 的 N5「保存并进入下一份病历」
const nextBtnText = computed(() => {
  if (!props.isLastStep) return '下一步'
  return props.isLastLoop ? '保存并进入下一份病历' : '保存并进入下一loop'
})

// 当前步骤的标注数据（组件内维护副本，保存时再回写父级）
const formData = ref({})
let syncing = false

const nodeFromProps = () => props.nodesAnnotation?.[COT_NODE_KEYS[props.step]] || {}

const syncForm = () => {
  syncing = true
  formData.value = _.cloneDeep(nodeFromProps())
  nextTick(() => {
    syncing = false
  })
}

// 切换步骤 / Loop 时同步
watch(() => [props.step, props.loopId], syncForm, { immediate: true })

// 父级数据变化时同步；编辑中内容一致则跳过，避免自动暂存后光标被重置
watch(
  () => props.nodesAnnotation,
  () => {
    if (props.isEdit && _.isEqual(nodeFromProps(), formData.value)) return
    syncForm()
  },
  { deep: true }
)

// 编辑内容变化时通知父级（用于自动暂存判断）
watch(
  () => formData.value,
  () => {
    if (props.isEdit && !syncing) emit('change')
  },
  { deep: true }
)

// 当前步骤数据（查看态与编辑态共用同一份）
const nodeData = computed(() => formData.value)

// 时间锚定信息
const anchor = computed(() => nodeData.value?.node_temporal_anchor || {})

// 锚定路径：单个路径或多路径列表
const anchorPathList = computed(() => {
  const target = anchor.value
  if (target?.anchor_path) return [target.anchor_path]
  return target?.anchor_path_list || []
})

const anchorPathText = computed(() => {
  const list = anchorPathList.value
  return list.length ? list.join('、') : '-'
})

// 按 a.b[0].c 形式取病历原文中的值
const resolvePath = (source, path) => {
  if (!source || !path) return ''
  const segments = String(path).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
  let current = source
  for (const segment of segments) {
    if (current === null || current === undefined) return ''
    current = current[segment]
  }
  return typeof current === 'string' || typeof current === 'number' ? String(current) : ''
}

// 锚定时间：优先取节点上记录的时间，缺失时回溯病历原文
const anchorTimeText = computed(() => {
  if (anchor.value?.anchor_timestamp) return anchor.value.anchor_timestamp
  for (const path of anchorPathList.value) {
    const value = resolvePath(props.oriData, path)
    if (value) return value
  }
  return '-'
})

// 当前步骤的分区配置
const groups = computed(() => COT_NODE_SECTIONS[props.step] || [])

// 引用证据列表
const evidenceList = computed(() => nodeData.value?.node_evidence_block?.mapped_emr_evidence || [])

// 证据质量标签
const qualityLabel = computed(() => labelOf('evidence_quality', nodeData.value?.node_evidence_block?.evidence_quality))

// 诊断编码 → 诊断名称（部分病例的标注值存的是 ICD 编码）
const diagnosisLabelMap = computed(() => {
  const basic = props.oriData?.basic_information || {}
  const map = {}
  const add = (name, code) => {
    if (name && code && code !== '无') map[code] = name
  }
  add(basic.main_diagnosis_name, basic.main_diagnosis_icd10)
  add(basic.clinic_diagnosis_name, basic.clinic_diagnosis_icd10)
  const names = basic.other_diagnosis_name || []
  const codes = basic.other_diagnosis_icd10 || []
  names.forEach((name, index) => add(name, codes[index]))
  return map
})

// 单个字段的展示值（兼容枚举、数组、对象、长文本）
const renderField = (item, source) => {
  const value = source?.[item.field]
  if (value === undefined || value === null || value === '') return '-'
  if (item.type === 'enum') return labelOf(item.field, value)
  if (item.type === 'list' && Array.isArray(value)) {
    return value.map(one => diagnosisLabelMap.value[one] || renderAny(one)).join('；')
  }
  return renderAny(value)
}

// 通用值渲染：数组拼接、对象展开为「键 值」
const renderAny = (value) => {
  if (value === undefined || value === null || value === '') return '-'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (Array.isArray(value)) {
    if (!value.length) return '-'
    return value.map(item => renderAny(item)).join('；')
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, val]) => `${kvLabel(key)}：${renderAny(val)}`)
      .join('；')
  }
  return String(value)
}

// ============ 底部操作 ============
const handleCancel = () => emit('cancel')

const handleSaveDraft = () => emit('save-draft', _.cloneDeep(formData.value))

// 下一步前做基础必填校验：枚举字段与思维链
const handleNext = () => {
  const missing = []
  ;(COT_NODE_SECTIONS[props.step] || []).forEach((group) => {
    if (group.type === 'grid') {
      group.items.forEach((item) => {
        if (item.type === 'enum' && !formData.value[item.field]) missing.push(item.label)
      })
      return
    }
    const value = formData.value[group.field]
    const isEmpty = value === undefined || value === null || value === '' ||
      (typeof value !== 'object' && !String(value).trim())
    if (isEmpty) missing.push(group.title)
  })
  if (missing.length) {
    ElMessage.warning(`请先填写：${missing.join('、')}`)
    return
  }
  emit('next', _.cloneDeep(formData.value))
}

defineExpose({
  // 取当前编辑内容（自动暂存用）
  getFormData: () => _.cloneDeep(formData.value),
  // 放弃本地修改，回到父级数据
  reset: syncForm
})
</script>

<style lang="scss" scoped>
.demo-cot-panel {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: var(--theme-card);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    height: 52px;
    padding: 0 20px;
    border-bottom: 1px solid #eef1f6;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .node-badge {
      padding: 2px 8px;
      border: 1px solid #b9cdfd;
      border-radius: 4px;
      font-size: 14px;
      color: var(--theme-primary);
    }

    .panel-title {
      font-weight: 500;
      font-size: 17px;
      color: #1f2d3d;
    }

    .save-time {
      font-size: 14px;
      color: #8793a8;

      em {
        font-style: normal;
        color: #4a5670;
      }
    }
  }

  .panel-scroll {
    flex: 1;
    min-height: 0;
  }

  .panel-body {
    padding: 16px 20px 20px;
  }

  .cot-section {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-weight: 500;
      font-size: 16px;
      color: #1f2d3d;

      &::before {
        display: inline-block;
        width: 3px;
        height: 14px;
        border-radius: 2px;
        background: var(--theme-primary);
        content: '';
      }
    }

    .evidence-summary {
      margin-left: auto;
      font-weight: 400;
      font-size: 14px;
      color: #8793a8;
    }
  }

  .anchor-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-radius: 6px;
    background: var(--theme-primary-soft);
    font-size: 16px;
    gap: 4px 12px;

    .anchor-path {
      min-width: 0;
      color: var(--theme-primary);
      word-break: break-all;
    }

    .anchor-time {
      flex-shrink: 0;
      color: #4a5670;
    }
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 16px;
  }

  .field-cell {
    display: flex;
    align-items: baseline;
    padding: 10px 12px;
    border-radius: 6px;
    background: var(--theme-primary-soft);
    line-height: 1.7;
    font-size: 16px;
    gap: 10px;

    &.is-full {
      grid-column: 1 / -1;
    }

    .field-label {
      flex-shrink: 0;
      color: #8793a8;
    }

    .field-value {
      min-width: 0;
      color: #1f2d3d;
      word-break: break-all;
    }

    // 编辑态：控件纵向铺满
    &.is-edit {
      align-items: center;
      padding: 8px 12px;

      .field-label {
        min-width: 64px;
      }

      .field-editor {
        flex: 1;
        min-width: 0;
      }
    }
  }

  .long-text {
    line-height: 1.9;
    text-align: justify;
    font-size: 16px;
    color: #1f2d3d;
  }

  .long-text-editor {
    font-size: 16px;
  }

  .evidence-empty {
    padding: 18px 0;
    text-align: center;
    font-size: 16px;
    color: #a8b1c2;
  }

  .evidence-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .evidence-card {
    padding: 10px 12px;
    border-left: 3px solid #d8e4fd;
    border-radius: 4px;
    background: var(--theme-fill);

    .evidence-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .evidence-path {
      font-family: Menlo, Consolas, monospace;
      font-size: 14px;
      color: var(--theme-primary);
    }

    .evidence-scope {
      padding: 1px 6px;
      border-radius: 3px;
      background: var(--theme-primary-soft);
      font-size: 13px;
      color: #5c7cc9;
    }

    .evidence-text {
      line-height: 1.7;
      font-size: 16px;
      color: #4a5670;
    }
  }

  .panel-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-shrink: 0;
    padding: 12px 20px;
    border-top: 1px solid #eef1f6;
    gap: 12px;

    .next-btn {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-width: 104px;
      gap: 6px;

      .next-chevron {
        letter-spacing: 1px;
        animation: nextArrow 1.4s ease-in-out infinite;
      }
    }

    .readonly-hint {
      font-size: 16px;
      color: #a8b1c2;
    }
  }
}

@keyframes nextArrow {
  0%,
  100% {
    opacity: 0.8;
    transform: translateX(0);
  }

  50% {
    opacity: 1;
    transform: translateX(3px);
  }
}
</style>
