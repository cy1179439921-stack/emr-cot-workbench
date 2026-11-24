<template>
  <div class="cot-module cot-n2" :class="{isEdit}">
    <COTModuleHeader badge="N2" title="检查策略" :anchorTime="anchorTime" />

    <!-- 锚定路径（下拉+输入组合，多行） -->
    <div class="cot-section">
      <div class="section-title">锚定路径</div>
      <div class="cot-field-value anchoring">
        <template v-if="isEdit">
          <div class="combo-list pd24">
            <div v-for="(item, idx) in anchorPathList" :key="idx" class="combo-row">
              <el-cascader
                v-model="item.key"
                class="path-select"
                size="default"
                placeholder="请选择一项"
                :options="anchorPathOptions"
                :props="{ multiple: false, checkStrictly: false, emitPath: false, value: 'key', label: 'nameCn' }"
                :show-all-levels="true"
                popper-class="evidence-popper"
                @change="v => cascaderChange(idx, v)" />
              <el-input
                type="textarea"
                show-word-limit
                maxlength="10000"
                :autosize="{ minRows: 1,maxRows: 3}"
                v-model="item.value"
                placeholder="请填写内容"
                class="combo-input"
                @input="markDirty"
              />
              <i class="iconfont icon-tianjiayihang" @click="addAnchorPath(idx)"></i>
              <i v-if="anchorPathList.length > 1" class="iconfont icon-shanchu-1" @click="removeAnchorPath(idx)"></i>
            </div>
          </div>
        </template>
        <div v-else class="cot-view-combo-cards pd24">
          <div v-for="(item, idx) in anchorPathList" :key="idx" class="view-combo-row">
            <span class="view-combo-path">{{ anchorPathMap.get(item.key) || item.key || '-' }}：</span>
            <span class="view-combo-text">{{ item.value || '-' }}</span>
          </div>
          <span v-if="!anchorPathList.some(a => a.key || a.value)" class="view-text">-</span>
        </div>
      </div>
    </div>

    <!-- 核心结构化字段 -->
    <div class="cot-section">
      <div class="section-title">核心结构化字段</div>
      <div class="cot-main cot-main-area">
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">临床问题</label>
          <div class="cot-field-value">
            <template v-if="isEdit">
              <div class="inline-list">
                <div v-for="(item, idx) in formData.n2_clinical_questions" :key="idx" class="inline-row">
                  <el-input
                    v-model="formData.n2_clinical_questions[idx]"
                    class="inline-input"
                    :maxlength="200"
                    show-word-limit
                    placeholder="请填写临床问题"
                    @input="markDirty"
                  />
                  <div class="btns">
                    <i class="iconfont icon-tianjiayihang" @click="addClinicalQuestion(idx)"></i>
                    <i v-if="formData.n2_clinical_questions.length > 1" class="iconfont icon-shanchu-1" @click="removeClinicalQuestion(idx)"></i>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="view-inline-list">
              <div v-for="(item, idx) in (formData.n2_clinical_questions || [])" :key="idx" class="view-inline-row">
                {{ item }}
              </div>
              <span v-if="!formData.n2_clinical_questions?.length" class="view-text">-</span>
            </div>
          </div>
        </div>
        <!-- 计划检查（key-value） -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">计划检查</label>
          <div class="cot-field-value">
            <KeyValueEditor
              v-if="isEdit"
              v-model="formData.n2_intended_test_orders"
              key-placeholder="请填写内容"
              value-placeholder="请填写内容"
              @change="markDirty"
            />
            <KeyValueViewer v-else :data="formData.n2_intended_test_orders" />
          </div>
        </div>

        <!-- 实际检查（key-value） -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">实际检查</label>
          <div class="cot-field-value">
            <KeyValueEditor
              v-if="isEdit"
              v-model="formData.n2_actual_test_orders"
              key-placeholder="请填写内容"
              value-placeholder="请填写内容"
              @change="markDirty"
            />
            <KeyValueViewer v-else :data="formData.n2_actual_test_orders" />
          </div>
        </div>

        <!-- 关键值（key-value） -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">关键值</label>
          <div class="cot-field-value">
            <KeyValueEditor
              v-if="isEdit"
              v-model="formData.n2_critical_values"
              key-placeholder="请填写内容"
              value-placeholder="请填写内容"
              @change="markDirty"
              minLeval
            />
            <KeyValueViewer v-else :data="formData.n2_critical_values" />
          </div>
        </div>
      </div>
    </div>

    <!-- 思维链 -->
    <div class="cot-section">
      <div class="section-title">思维链</div>
      <div class="cot-main cot-main-area">
        <div class="thinking-step-row">
          <div class="step-title">第一步：临床问题</div>
          <div class="step-content thinking-chain-area">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :model-value="formData.n2_decision_cot.step_1_clinical_question"
              :rows="1"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n2_decision_cot.step_1_clinical_question = v; markDirty() }"
            />
          </div>
        </div>

        <div class="thinking-step-row">
          <div class="step-title">第二步：检查选择逻辑</div>
          <div class="step-content thinking-chain-area">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :model-value="formData.n2_decision_cot.step_2_test_choice_logic"
              :rows="1"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n2_decision_cot.step_2_test_choice_logic = v; markDirty() }"
            />
          </div>
        </div>

        <div class="thinking-step-row">
          <div class="step-title">第三步：实际与计划的差距</div>
          <div class="step-content thinking-chain-area">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :model-value="formData.n2_decision_cot.step_3_actual_vs_planned_gap"
              :rows="1"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n2_decision_cot.step_3_actual_vs_planned_gap = v; markDirty() }"
            />
          </div>
        </div>

        <div class="thinking-step-row">
          <div class="step-title">第四步：结果对后续决策的影响</div>
          <div class="step-content thinking-chain-area">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :model-value="formData.n2_decision_cot.step_4_result_reshapes_downstream"
              :rows="1"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n2_decision_cot.step_4_result_reshapes_downstream = v; markDirty() }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 引用证据 -->
    <EvidenceReference
      ref="evidenceRef"
      :is-edit="isEdit"
      :stepType="2"
      @pathOptions="handlePathOptions"
      v-model="formData.node_evidence_block"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, inject } from 'vue'
import { queryDataByKey } from '@/api/api_cot.js'
import { ElMessage } from 'element-plus'
import EditableField from './EditableField.vue'
import KeyValueEditor from './KeyValueEditor.vue'
import KeyValueViewer from './KeyValueViewer.vue'
import COTModuleHeader from './COTModuleHeader.vue'
import EvidenceReference from './EvidenceReference.vue'
import { useMedicalStore } from '@/store/medicalStore'
import _ from 'lodash'

defineOptions({
  name: 'COTN2',
  inheritAttrs: false
})
const emit = defineEmits(['updataLastSavedTime'])
const recordId = inject('recordId')
const formData = ref({})
const anchorFormat = ref('list') // 'list' | 'single'

const props = defineProps({
  isEdit: { type: Boolean, default: false },
  cotData: { type: Object, default: null },
  anchorTime: { type: String, default: '' }
})

// 引用证据
const evidenceRef = ref(null)
const node_evidence_block = ref([{ evidencePath: '', evidenceText: '', quality: '' }])
const anchorPathList = ref([{ key: '', value: '' }])
const anchorTimestamp = ref(null)

let skipMarkDirty = false

const objToArray = (obj) => {
  return Object.keys(obj).map(key => ({ key, value: obj[key] }))
}

const arrToObj = (arr) => {
  return arr.reduce((obj, item) => {
    obj[item.key] = item.value
    return obj
  }, {})
}

const medicalStore = useMedicalStore()

const anchorPathOptions = ref([])
function handlePathOptions(options) {
  anchorPathOptions.value = options
}

function addAnchorPath(idx) {
  if (anchorPathList.value.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  anchorPathList.value.splice(idx + 1, 0, { key: '', value: '' })
  markDirty()
}

function removeAnchorPath(idx) {
  anchorPathList.value.splice(idx, 1)
  markDirty()
}

function addClinicalQuestion(idx) {
  if (formData.value.n2_clinical_questions.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  formData.value.n2_clinical_questions.splice(idx + 1, 0, '')
  markDirty()
}

function removeClinicalQuestion(idx) {
  formData.value.n2_clinical_questions.splice(idx, 1)
  markDirty()
}

function markDirty() {
  medicalStore.setDirty()
}

const anchorPathMap = computed(() => {
  const map = new Map()

  const traverse = (options) => {
    if (!Array.isArray(options)) return
    options.forEach(item => {
      if (item.key) {
        map.set(item.key, item.pathCn)
      }
      if (item.children?.length) {
        traverse(item.children)
      }
    })
  }

  traverse(anchorPathOptions.value)
  return map
})

watch(() => formData.value, () => {
  if (props.isEdit && !skipMarkDirty) markDirty()
}, { deep: true })

function getValidateResult() {
  // 校验证据引用
  if (evidenceRef.value && !evidenceRef.value.getValidateResult()) {
    ElMessage.warning('N2-检查策略：请完善引用证据')
    return false
  }
  const required = [
    { key: 'n2_clinical_questions', label: '临床问题', value: formData.value.n2_clinical_questions?.length > 0 && formData.value.n2_clinical_questions.every(q => q) },
    { key: 'n2_intended_test_orders', label: '计划检查', value: formData.value.n2_intended_test_orders?.every(kv => kv.key && kv.value) },
    { key: 'n2_actual_test_orders', label: '实际检查', value: formData.value.n2_actual_test_orders?.every(kv => kv.key && kv.value) },
    { key: 'n2_critical_values', label: '关键值', value: formData.value.n2_critical_values?.every(kv => kv.key && kv.value) },
    { key: 'step_1_clinical_question', label: '思维链-第一步', value: formData.value.n2_decision_cot?.step_1_clinical_question },
    { key: 'step_2_test_choice_logic', label: '思维链-第二步', value: formData.value.n2_decision_cot?.step_2_test_choice_logic },
    { key: 'step_3_actual_vs_planned_gap', label: '思维链-第三步', value: formData.value.n2_decision_cot?.step_3_actual_vs_planned_gap },
    { key: 'step_4_result_reshapes_downstream', label: '思维链-第四步', value: formData.value.n2_decision_cot?.step_4_result_reshapes_downstream },
    { key: 'anchorPathList', label: '锚定路径', value: anchorPathList.value.length > 0 && anchorPathList.value.every(a => a.key && a.value) }
  ]
  const empty = required.filter(f => !f.value)
  if (empty.length) {
    ElMessage.warning(`N2-检查策略：请填写 ${empty.map(f => f.label).join('、')}`)
    return false
  }
  return true
}

// function normalizeAnchorPathList(anchor) {
//   if (!anchor) return [{ key: '', value: '' }]
//   if (Array.isArray(anchor.anchor_path_list) && anchor.anchor_path_list.length) {
//     const texts = anchor.anchor_path_list_text || []
//     return anchor.anchor_path_list.map((key, i) => ({
//       key: key || '',
//       value: texts[i] ?? ''
//     }))
//   }
//   if (anchor.anchor_path) {
//     return [{ key: anchor.anchor_path, value: '' }]
//   }
//   return [{ key: '', value: '' }]
// }

function denormalizeNodeTemporalAnchor() {
  const list = anchorPathList.value
  if (anchorFormat.value === 'single' && list.length === 1) {
    return {
      anchor_path: list[0].key || '',
      anchor_timestamp: anchorTimestamp.value
    }
  }
  return {
    anchor_path_list: list.map(item => item.key || ''),
    anchor_path_list_text: list.map(item => item.value ?? ''),
    anchor_timestamp: anchorTimestamp.value
  }
}

// function syncAnchorFromCotData(anchor) {
//   anchorTimestamp.value = anchor?.anchor_timestamp ?? null
//   anchorFormat.value = Array.isArray(anchor?.anchor_path_list) ? 'list' : (anchor?.anchor_path ? 'single' : 'list')
//   anchorPathList.value = normalizeAnchorPathList(anchor)
// }

function syncAnchorFromCotData(anchor) {
  anchorTimestamp.value = anchor?.anchor_timestamp ?? null

  // 核心逻辑：强制标准化为数组格式
  if (Array.isArray(anchor?.anchor_path_list)) {
    anchorFormat.value = 'list'
    anchorPathList.value = normalizeAnchorPathList(anchor)
  } else if (anchor?.anchor_path) {
    // 当检测到旧格式(字符串)时，自动转换为新格式(数组)
    anchorFormat.value = 'list'
    anchorPathList.value = [{
      key: anchor.anchor_path,
      value: '' // 对应的文本视情况处理
    }]
  } else {
    anchorFormat.value = 'list'
    anchorPathList.value = [{ key: '', value: '' }]
  }
}

// 确保 normalizeAnchorPathList 也具备鲁棒性
function normalizeAnchorPathList(anchor) {
  if (!anchor) return [{ key: '', value: '' }]

  // 如果已经是新格式
  if (Array.isArray(anchor.anchor_path_list) && anchor.anchor_path_list.length) {
    const texts = anchor.anchor_path_list_text || []
    return anchor.anchor_path_list.map((key, i) => ({
      key: key || '',
      value: texts[i] ?? ''
    }))
  }

  // 兼容单一字符串格式
  if (typeof anchor.anchor_path === 'string') {
    return [{ key: anchor.anchor_path, value: '' }]
  }

  return [{ key: '', value: '' }]
}

function getEditingMedicalContent() {
  return {
    ...formData.value,
    n2_intended_test_orders: arrToObj(formData.value.n2_intended_test_orders),
    n2_actual_test_orders: arrToObj(formData.value.n2_actual_test_orders),
    n2_critical_values: arrToObj(formData.value.n2_critical_values),
    node_temporal_anchor: denormalizeNodeTemporalAnchor(),
    node_evidence_block: evidenceRef.value?.getData()
  }
}

function getData() {
  Object.assign(formData, {})
  node_evidence_block.value = [{ evidencePath: '', evidenceText: '', quality: '' }]
  anchorFormat.value = 'list'
  anchorTimestamp.value = null
}

const cascaderChange = (index, value) => {
  markDirty()
  anchorPathList.value[index].key = value

  queryDataByKey({ recordId: recordId.value, key: value }).then(res => {
    if (res.code === 10000) {
      // 获取到的证据路径数据
      const { value, time } = res.data
      if (value === time) {
        anchorPathList.value[index].value = value
      } else {
        anchorPathList.value[index].value = value + ':' + time
      }
    }
  })
}

/**
 * 从数组中过滤出每个字符串中的时间，返回日期最早的那个时间
 * @param {string[]} strArr - 字符串数组
 * @param {string} [fallback] - 无匹配时兜底值，默认 null
 * @returns {string|null} 返回最早时间，格式 YYYY-MM-DD HH:mm:ss
 */
function getEarliestDateFromStrings(strArr, fallback = null) {
  const reg = /\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}(?:[\s日T]\d{1,2}:\d{1,2}(?::\d{1,2})?)?/g
  let earliest = null

  strArr.forEach(str => {
    const matches = str.match(reg)
    if (!matches) return
    matches.forEach(timeStr => {
      const date = new Date(timeStr.replace(/[年月]/g, '-').replace(/日/, ''))
      if (!isNaN(date.getTime()) && (!earliest || date < earliest)) {
        earliest = date
      }
    })
  })

  if (!earliest) return fallback // 无匹配时返回兜底值

  const pad = (n) => String(n).padStart(2, '0')
  return `${earliest.getFullYear()}-${pad(earliest.getMonth() + 1)}-${pad(earliest.getDate())} ${pad(earliest.getHours())}:${pad(earliest.getMinutes())}:${pad(earliest.getSeconds())}`
}

watch(() => anchorPathList.value, (val) => {
  if (Array.isArray(val) && val.length !== 0) {
    anchorTimestamp.value = getEarliestDateFromStrings(val.map(item => item.value))
    emit('updataLastSavedTime', anchorTimestamp.value) // 更新最后保存时间
  }
}, { deep: true, immediate: true })

watch(() => props.cotData, (data) => {
  if (!data) return
  skipMarkDirty = true
  // 深拷贝：断开与 props.cotData 的引用链，避免 EvidenceReference 修改时触发 cotData deep watcher 导致字段重置
  const _data = _.cloneDeep(data)
  formData.value = {
    ..._data,
    n2_clinical_questions: Array.isArray(_data.n2_clinical_questions) && _data.n2_clinical_questions.length
      ? _data.n2_clinical_questions
      : [''],
    n2_intended_test_orders: _data.n2_intended_test_orders ? objToArray(_data.n2_intended_test_orders) : [],
    n2_actual_test_orders: _data.n2_actual_test_orders ? objToArray(_data.n2_actual_test_orders) : [],
    n2_critical_values: _data.n2_critical_values ? objToArray(_data.n2_critical_values) : []
  }
  syncAnchorFromCotData(data.node_temporal_anchor)
  nextTick(() => { skipMarkDirty = false })
}, { deep: true, immediate: true })

defineExpose({
  getEditingMedicalContent,
  getData,
  getValidateResult
})
</script>

<style lang="scss" scoped>
@use './cot-common.scss';

// N2 — 检查策略
.cot-n2 {
  // 临床问题固定文字
  .fixed-text {
    font-size: 16px;
    color: var(--theme-text-2);
  }
  .cot-main {
    border-radius: 4px;
    .cot-field-row {
      margin-bottom: 16px;
      :deep(.kv-row):first-child {
        padding-top: 10px;
      }
      .cot-field-label {
        min-width: 68px;
        height: 20px;
        margin-top: 2px;
        line-height: unset;
        text-align: left;
        font-weight: 500;
      }
      .cot-field-value {
        margin-top: 2px;
        .inline-list {
          margin-top: 16px;
        }
        .inline-row {
          .icon-tianjiayihang {
            margin-left: 28px;
          }
          &:has(.icon-shanchu-1) .icon-tianjiayihang {
            margin-right: 28px;
          }
        }
      }
    }
    .step-title {
      margin-bottom: 12px;
    }
    .step-content {
      padding: 0 12px 4px 0;
    }
  }
  &.isEdit {
    .thinking-chain-area {
      padding: 0;
      :deep(.el-textarea__inner) {
        box-sizing: border-box;
        min-height: 32px !important;
        margin-bottom: 2px;
        border-radius: 4px;
      }
    }
    .anchoring {
      box-sizing: border-box;
      padding: 24px;
      background: rgba(240, 243, 248, 0.3);
      .combo-row:not(:last-child) {
        margin-bottom: 16px;
      }
    }
  }
  .anchoring {
    :deep(.el-cascader) {
      padding-right: 10px;
    }
  }
  :deep(.el-input__count-inner) {
    font-size: 14px;
  }
}
</style>
