<template>
  <div class="cot-module cot-n5" :class="{isEdit}">
    <COTModuleHeader badge="N5" title="长程应变" :anchorTime="anchorTime" />

    <!-- 锚定路径 -->
    <div class="cot-section">
      <div class="section-title">锚定路径</div>
      <div class="cot-anchor-row">
        <span class="anchor-tag">
          <i class="iconfont icon-jibenxinxi"></i>
          <span>基本信息</span>
        </span>

        <div class="cot-field-row">
          <label class="cot-field-label">出院时间：</label>
          <div class="cot-field-value text">
            <EditableField
              mode="view"
              input-type="text"
              :model-value="formData.node_temporal_anchor?.anchor_timestamp"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 核心结构化字段 -->
    <div class="cot-section">
      <div class="section-title">核心结构化字段</div>

      <div class="core-fields-grid">
        <!-- 结局是否住院内可观测 -->
        <div class="cot-field-row">
          <label class="cot-field-label">结局是否住院内可观测：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="select"
              :model-value="formData.n5_outcome_observable_within_admission"
              :options="observableOptions"
              placeholder="请选择一项"
              @update:model-value="(v) => { formData.n5_outcome_observable_within_admission = v;formData.n5_followup_outcome=''; onObservableChange(v) }"
            />
          </div>
        </div>

        <!-- 结局维度 -->
        <div class="cot-field-row">
          <label class="cot-field-label">结局维度：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="select"
              :model-value="formData.n5_outcome_dimension"
              :options="n5_outcome_dimensionOptions"
              placeholder="请选择一项"
              @update:model-value="(v) => {
                formData.n5_outcome_dimension = v;
                formData.n5_outcome_value = ''; // 维度变了，结局值必须同步清空，绝不残留
                markDirty()
              }"
            />
          </div>
        </div>

        <!-- 结局值 -->
        <div class="cot-field-row">
          <label class="cot-field-label">结局值：</label>
          <div class="cot-field-value">
            <!-- <template v-if="isEdit">
              <el-select
                v-model="formData.n5_outcome_value"
                placeholder="请选择一项"
                class="full-width-select"
                clearable
                @change="markDirty"
              >
                <el-option
                  v-for="opt in currentn5_outcome_valueOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </template>
            <span v-else class="view-text">{{ n5OutcomeValueLabel ||'-'}}</span> -->
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="select"
              :model-value="formData.n5_outcome_value"
              :options="currentn5_outcome_valueOptions"
              placeholder="请选择一项"
              @update:model-value="(v) => { formData.n5_outcome_value = v; markDirty() }"
            />
          </div>
        </div>

        <!-- 远期随访结局 -->
        <div class="cot-field-row" v-if='formData.n5_outcome_observable_within_admission==false'>
          <label class="cot-field-label">远期随访结局：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="text"
              :model-value="formData.n5_followup_outcome"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n5_followup_outcome = v; markDirty() }"
            />
          </div>
        </div>

        <!-- 不良事件列表 -->
        <div class="cot-field-row grid-full-width" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">不良事件列表：</label>
          <div class="cot-field-value">
            <template v-if="isEdit">
              <div class="combo-list pd16">
                <div v-for="(item, idx) in formData.n5_adverse_events_list" :key="idx" class="combo-row">
                  <el-input
                    show-word-limit
                    maxlength="200"
                    v-model="item.ae_name"
                    placeholder="请填写不良事件名称"
                    style="flex: 2;"
                    @input="markDirty"
                  />
                  <el-input
                    show-word-limit
                    maxlength="200"
                    v-model="item.ae_grade"
                    placeholder="请填写严重度分级"
                    style="flex: 2;"
                    @input="markDirty"
                  />
                  <el-select
                    v-model="item.ae_attribution"
                    placeholder="请选择不良事件归因"
                    style="flex: 2;"
                    clearable
                    @change="markDirty"
                  >
                    <el-option label="药物相关" value="DRUG_RELATED" />
                    <el-option label="操作相关" value="PROCEDURE_RELATED" />
                    <el-option label="疾病进展" value="DISEASE_PROGRESSION" />
                    <el-option label="无关" value="UNRELATED" />
                    <el-option label="不确定" value="UNCERTAIN" />
                  </el-select>
                  <i class="iconfont icon-tianjiayihang" @click="addAdverseEvent(idx)"></i>
                  <i v-if="formData.n5_adverse_events_list.length > 1" class="iconfont icon-shanchu-1" @click="removeAdverseEvent(idx)"></i>
                </div>
              </div>
            </template>
            <div v-else class="cot-view-combo-cards">
              <div class="view-inline-row">
                {{
                  formData.n5_adverse_events_list
                    ?.filter(item => item.ae_name || item.ae_grade || item.ae_attribution)
                    ?.map(item => {
                      return [
                        item.ae_name || '-',
                        item.ae_grade || '-',
                        getAttributionLabel(item.ae_attribution)
                      ].join('-')
                    })
                    ?.join('、') || '-'
                }}
              </div>
              <span v-if="!formData.n5_adverse_events_list?.length" class="view-text">-</span>
            </div>
          </div>
        </div>

        <!-- ==================== 改造后：应急处理措施（对象级键值对动态录入） ==================== -->
        <div class="cot-field-row grid-full-width" :class="{ 'block-layout': isEdit }" v-if="hasAdverseEvents">
          <label class="cot-field-label">应急处理措施：</label>
          <div class="cot-field-value">
            <template v-if="isEdit">
              <div class="combo-list pd16">
                <div v-for="(item, idx) in emergencyActionsList" :key="idx" class="combo-row">
                  <!-- 第一个输入框输入 key -->
                  <el-input
                    show-word-limit
                    v-model="item.key"
                    placeholder="请填写措施名称"
                    style="flex: 2;"
                    maxlength="200"
                    @input="markDirty"
                  />
                  <!-- 第二个输入框输入 value -->
                  <el-input
                    show-word-limit
                    v-model="item.value"
                    placeholder="请填写具体措施"
                    style="flex: 4;"
                    maxlength="200"
                    @input="markDirty"
                  />
                  <!-- 操作按钮 -->
                  <i class="iconfont icon-tianjiayihang" @click="addEmergencyAction(idx)"></i>
                  <i v-if="emergencyActionsList.length > 1" class="iconfont icon-shanchu-1" @click="removeEmergencyAction(idx)"></i>
                </div>
              </div>
            </template>
            <!-- 展示态：做 key: value 的拼接展示 -->
            <div v-else class="cot-view-combo-cards">
              <div class="view-inline-row" v-if="emergencyActionsList.length && hasValidEmergencyActions">
                <div v-for="(item, idx) in emergencyActionsList.filter(i => i.key || i.value)" :key="idx" class="view-text-item">
                  <span>{{ item.key || '-' }}-</span><span>{{ item.value || '-' }}</span>
                </div>
              </div>
              <span v-else class="view-text">-</span>
            </div>
          </div>
        </div>

      </div>
    </div>
    <!-- 思维链区块 -->
    <div class="cot-section">
      <div class="section-title">思维链</div>
      <div class="cot-field-value thinking-chain-area " :class="{edit:isEdit}">
        <EditableField
          :mode="isEdit ? 'edit' : 'view'"
          input-type="textarea"
          :model-value="formData.n5_adaptation_logic_cot"
          :rows="4"
          placeholder="请填写内容"
          @update:model-value="(v) => { formData.n5_adaptation_logic_cot = v; markDirty() }"
        />
      </div>
    </div>

    <!-- 引用证据 -->
    <EvidenceReference
      ref="evidenceRef"
      :is-edit="isEdit"
      :stepType="5"
      v-model="formData.node_evidence_block"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import EditableField from './EditableField.vue'
import COTModuleHeader from './COTModuleHeader.vue'
import EvidenceReference from './EvidenceReference.vue'
import { useMedicalStore } from '@/store/medicalStore'
import _ from 'lodash'

defineOptions({ name: 'COTN5', inheritAttrs: false })

const props = defineProps({
  isEdit: { type: Boolean, default: false },
  cotData: { type: Object, default: null },
  anchorTime: { type: String, default: '' }
})

const medicalStore = useMedicalStore()
const evidenceRef = ref(null)

let skipMarkDirty = false
const formData = ref({})

// 内部维护的应急处理措施数组，便于双向绑定
const emergencyActionsList = ref([{ key: '', value: '' }])

// 判断是否有有效填写的应急措施数据
const hasValidEmergencyActions = computed(() => {
  return emergencyActionsList.value.some(item => item.key || item.value)
})

watch(() => props.cotData, (data) => {
  if (!data) return
  skipMarkDirty = true
  formData.value = _.cloneDeep(data)

  // 1. 初始化或补全不良事件列表
  if (!formData.value.n5_adverse_events_list || !formData.value.n5_adverse_events_list.length) {
    formData.value.n5_adverse_events_list = [{ ae_name: '', ae_grade: '', ae_attribution: '' }]
  }

  // 2. 将后端的对象格式 n5_emergency_actions 转换为前端数组 [{key, value}]
  const actionsObj = formData.value.n5_emergency_actions
  if (actionsObj && typeof actionsObj === 'object' && Object.keys(actionsObj).length > 0) {
    emergencyActionsList.value = Object.keys(actionsObj).map(key => ({
      key,
      value: actionsObj[key]
    }))
  } else {
    emergencyActionsList.value = [{ key: '', value: '' }]
  }

  nextTick(() => { skipMarkDirty = false })
}, { deep: true, immediate: true })

const observableOptions = [
  { label: '是', value: true },
  { label: '否', value: false }
]

const n5_outcome_dimensionOptions = [
  { label: '症状维度', value: 'SYMPTOMATIC' },
  { label: '生理/化验维度', value: 'PHYSIOLOGICAL_OR_LAB' },
  { label: '操作/手术维度', value: 'PROCEDURAL_OR_SURGICAL' },
  { label: '产科维度', value: 'OBSTETRIC' },
  { label: '功能/精神维度', value: 'FUNCTIONAL_OR_PSYCHIATRIC' },
  { label: '死亡维度', value: 'MORTALITY' }
]

// eslint-disable-next-line no-unused-vars
const n5OutcomeValueLabel = computed(() => {
  const val = formData.value.n5_outcome_value
  if (!val) return '-'
  const matchedOption = currentn5_outcome_valueOptions.value.find(opt => opt.value === val)
  return matchedOption ? matchedOption.label : val
})

const n5_outcome_valueMap = {
  SYMPTOMATIC: [
    { label: '缓解/消退', value: 'RESOLVED' },
    { label: '改善', value: 'IMPROVED' },
    { label: '稳定', value: 'STABLE' },
    { label: '恶化', value: 'WORSENED' },
    { label: '未变化出院', value: 'UNCHANGED_DISCHARGED' }
  ],
  PHYSIOLOGICAL_OR_LAB: [
    { label: '恢复正常', value: 'NORMALIZED' },
    { label: '改善未正常', value: 'IMPROVED_NOT_NORMALIZED' },
    { label: '稳定', value: 'STABLE' },
    { label: '恶化', value: 'DETERIORATED' }
  ],
  PROCEDURAL_OR_SURGICAL: [
    { label: '成功无并发症', value: 'PROCEDURE_SUCCESS_NO_COMPLICATION' },
    { label: '成功伴轻微并发症', value: 'SUCCESS_WITH_MINOR_COMPLICATION' },
    { label: '成功伴严重并发症', value: 'SUCCESS_WITH_MAJOR_COMPLICATION' },
    { label: '失败或中止', value: 'PROCEDURE_FAILED_OR_ABANDONED' }
  ],
  OBSTETRIC: [
    { label: '活产无并发症', value: 'LIVE_BIRTH_UNCOMPLICATED' },
    { label: '活产伴并发症', value: 'LIVE_BIRTH_WITH_COMPLICATION' },
    { label: '产妇不良结局', value: 'ADVERSE_MATERNAL_OUTCOME' },
    { label: '新生儿不良结局', value: 'ADVERSE_NEONATAL_OUTCOME' }
  ],
  FUNCTIONAL_OR_PSYCHIATRIC: [
    { label: '功能恢复', value: 'FUNCTIONAL_RECOVERY' },
    { label: '部分恢复', value: 'PARTIAL_RECOVERY' },
    { label: '稳定无恢复', value: 'STABLE_NO_RECOVERY' },
    { label: '恶化', value: 'DETERIORATED' }
  ],
  MORTALITY: [
    { label: '院内死亡', value: 'IN_HOSPITAL_DEATH' },
    { label: '临终出院', value: 'HOSPICE_DISCHARGE' },
    { label: '存活', value: 'SURVIVED' }
  ]
}

const currentn5_outcome_valueOptions = computed(() => {
  return n5_outcome_valueMap[formData.value.n5_outcome_dimension] || []
})

function onObservableChange(val) {
  if (val === true) {
    formData.value.n5_followup_outcome = ''
  }
  markDirty()
}

function addAdverseEvent(idx) {
  if (formData.value.n5_adverse_events_list.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  formData.value.n5_adverse_events_list.splice(idx + 1, 0, {
    ae_name: '',
    ae_grade: '',
    ae_attribution: ''
  })
  markDirty()
}

function removeAdverseEvent(idx) {
  formData.value.n5_adverse_events_list.splice(idx, 1)
  markDirty()
}

/* ==================== 新增：应急处理措施 增删方法 ==================== */
function addEmergencyAction(idx) {
  if (emergencyActionsList.value.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  emergencyActionsList.value.splice(idx + 1, 0, { key: '', value: '' })
  markDirty()
}

function removeEmergencyAction(idx) {
  emergencyActionsList.value.splice(idx, 1)
  markDirty()
}

function getAttributionLabel(val) {
  const map = {
    DRUG_RELATED: '药物相关',
    PROCEDURE_RELATED: '操作相关',
    DISEASE_PROGRESSION: '疾病进展',
    UNRELATED: '无关',
    UNCERTAIN: '不确定'
  }
  return map[val] || '-'
}
// 判断不良事件列表是否不为空（即至少有一行填了任意一个字段）
const hasAdverseEvents = computed(() => {
  return formData.value.n5_adverse_events_list?.some(
    item => (item.ae_name || '').trim() || (item.ae_grade || '').trim() || item.ae_attribution
  ) || false
})
// 监听不良事件的存在状态，如果被用户清空了，同步重置应急措施列表，防止隐藏后内部残留脏数据
watch(hasAdverseEvents, (newVal) => {
  if (!newVal) {
    emergencyActionsList.value = [{ key: '', value: '' }]
  }
})
function markDirty() { medicalStore.setDirty() }

watch(() => ({ ...formData.value }), () => {
  if (props.isEdit && !skipMarkDirty) markDirty()
}, { deep: true })

watch(() => formData.value.n5_outcome_dimension, () => {
  if (skipMarkDirty) return
  formData.value.n5_outcome_value = ''
})

function getValidateResult() {
  if (evidenceRef.value && !evidenceRef.value.getValidateResult()) {
    ElMessage.warning('N5-长程应变：请完善引用证据')
    return false
  }
  const required = [
    { key: 'n5_outcome_observable_within_admission', label: '结局是否住院内可观测', value: formData.value.n5_outcome_observable_within_admission },
    { key: 'n5_outcome_dimension', label: '结局维度', value: formData.value.n5_outcome_dimension },
    { key: 'n5_outcome_value', label: '结局值', value: formData.value.n5_outcome_value },
    { key: 'n5_adaptation_logic_cot', label: '思维链', value: formData.value.n5_adaptation_logic_cot }
  ]

  if (formData.value.n5_adverse_events_list?.length) {
    const hasInvalidRow = formData.value.n5_adverse_events_list.some(item => {
      const hasAny = item.ae_name || item.ae_grade || item.ae_attribution
      const hasAll = item.ae_name && item.ae_grade && item.ae_attribution
      return hasAny && !hasAll
    })
    if (hasInvalidRow) {
      ElMessage.warning('N5-长程应变：请完善不良事件列表')
      return false
    }
  }
  // 3. 校验：应急处理措施某一行不为空时，两项（key & value）都必填
  if (hasAdverseEvents.value && emergencyActionsList.value?.length) {
    const hasInvalidActionRow = emergencyActionsList.value.some(item => {
      const trimmedKey = (item.key || '').trim()
      const trimmedVal = (item.value || '').trim()
      const hasAny = trimmedKey || trimmedVal // 只要写了其中任意一个输入框
      const hasAll = trimmedKey && trimmedVal // 是否两个输入框都写了

      // 如果动了其中一个（hasAny为true），但没填完整（hasAll为false），则视为无效行
      return hasAny && !hasAll
    })

    if (hasInvalidActionRow) {
      ElMessage.warning('N5-长程应变：请完善应急处理措施')
      return false
    }
  }
  const empty = required.filter(f => {
    if (typeof f.value === 'boolean') return false
    return !f.value
  })
  if (empty.length) {
    ElMessage.warning(`N5-长程应变：请填写 ${empty.map(f => f.label).join('、')}`)
    return false
  }
  return true
}

/* ==================== 改造：保存时重新转换为对象格式 ==================== */
function getEditingMedicalContent() {
  // 将前端的 emergencyActionsList 数组重新合并为后端需要的对象格式
  const actionsObj = {}
  // 只有在不良事件不为空时，才去收集应急措施的数据
  if (hasAdverseEvents.value) {
    emergencyActionsList.value.forEach(item => {
      const finalKey = (item.key || '').trim()
      const finalVal = (item.value || '').trim()
      if (finalKey && finalVal) {
        actionsObj[finalKey] = finalVal
      }
    })
  }

  return {
    ...formData.value,
    n5_emergency_actions: actionsObj, // 覆盖为对象格式
    node_evidence_block: evidenceRef.value?.getData()
  }
}

function getData() {
  Object.assign(formData.value, {
    anchorPath: '出院时间',
    n5_outcome_observable_within_admission: '',
    n5_outcome_dimension: '',
    n5_outcome_value: '',
    n5_followup_outcome: '',
    thinkingChain: '',
    n5_adverse_events_list: [{ ae_name: '', ae_grade: '', ae_attribution: '' }],
    n5_emergency_actions: {}, // 改为对象初始化
    n5_adaptation_logic_cot: ''
  })
  emergencyActionsList.value = [{ key: '', value: '' }]
}

defineExpose({ getEditingMedicalContent, getData, getValidateResult })
</script>

<style lang="scss" scoped>
@use './cot-common.scss';

.cot-n5 {
  .core-fields-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 24px 24px 16px 24px;
    border-radius: 6px;
    background: rgba(240, 243, 248, 0.3);

    .cot-field-row {
      display: flex;
      align-items: flex-start;
      box-sizing: border-box;
      width: 100%;
      margin-bottom: 24px;
      .cot-field-label {
        padding-right: 0;
        text-align: left;
      }
      .cot-field-value {
        width: 100%;
        margin-top: 2px;
        .view-text {
          line-height: 20px;
        }
      }
    }

    .grid-full-width {
      width: 100% !important;
      margin-bottom: 24px;
      &:nth-last-child(1) {
        margin-bottom: 0;
      }
      .combo-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        &:nth-last-child(1) {
          margin-bottom: 0;
        }
        .iconfont {
          margin: 0;
          cursor: pointer;
          font-size: 16px;
        }
      }
      .cot-field-label {
        text-align: left;
      }
      .cot-field-value {
        flex: 1;
        padding-right: 0 !important;
      }
    }
  }

  .pd16 {
    border-radius: 4px;
  }

  .cot-core-fields {
    .cot-field-label {
      min-width: unset;
    }
  }

  .cot-section {
    .cot-anchor-row {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 0;
      padding-bottom: 18px;
      .anchor-tag {
        margin-bottom: 12px;
        i {
          margin-right: 8px;
          font-size: 18px;
        }
        span {
          font-size: 16px;
        }
      }
      .cot-field-label {
        min-width: unset;
        padding-right: 0;
      }
      .text {
        padding: 0;
      }
    }
  }

  &.isEdit {
    .cot-core-fields {
      .cot-field-label {
        min-width: 100px;
      }
      .cot-field-row {
        margin-bottom: 24px;
      }
    }
    .core-fields-grid {
      .cot-field-row {
        align-items: center;
        .cot-field-value {
          margin-top: 0;
        }
        &.grid-full-width {
          align-items: flex-start;
        }
      }
    }
  }
}
.cot-field-value {
  &.thinking-chain-area {
    &.edit {
      padding: 0;
      :deep(.el-textarea__inner) {
        box-sizing: border-box;
        min-height: 32px !important;
        margin-bottom: 2px;
        border-radius: 4px;
        background: var(--theme-bg)#fafbfc;
      }
      :deep(.el-input__count) {
        background: var(--theme-bg)#fafbfc;
      }
    }
  }
}
.cot-view-combo-cards {
  .view-inline-row {
    line-height: 20px;
    .view-text-item {
      margin-bottom: 4px;
      &:last-child {
        margin-bottom: 0;
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
:deep(.evidence-reference) {
  margin-top: 0;
  padding-top: 0;
}
</style>
