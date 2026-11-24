<template>
  <div class="cot-module cot-n4">
    <COTModuleHeader badge="N4" title="方案抉择" :anchorTime="anchorTime" />
    <!-- 锚定路径（下拉+输入组合，多行） -->
    <div class="cot-section">
      <div class="section-title">锚定路径</div>
      <div class="cot-field-value">
        <template v-if="isEdit">
          <div class="combo-list pd24">
            <div v-for="(item, idx) in anchorPathList" :key="idx" class="combo-row">
              <el-cascader
                v-model="item.key" class="path-select"
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
      <div class="cot-section pd24">
        <!-- 标准方案（单行输入列表） -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">标准方案：</label>
          <div class="cot-field-value">
            <template v-if="isEdit">
              <div class="inline-list">
                <div v-for="(item, idx) in formData.n4_standard_regimen" :key="idx" class="inline-row">
                  <el-input
                    v-model="formData.n4_standard_regimen[idx]"
                    placeholder="请填写内容"
                    show-word-limit
                    maxlength="200"
                    class="inline-input"
                    @input="markDirty"
                  />
                  <i class="iconfont icon-tianjiayihang" @click="addStandardPlan(idx)"></i>
                  <i v-if="formData.n4_standard_regimen.length > 1" class="iconfont icon-shanchu-1" @click="removeStandardPlan(idx)"></i>
                </div>
              </div>
            </template>
            <div v-else class="view-inline-list ">
              <div class="view-inline-row">
                {{ formData.n4_standard_regimen.join('、')|| '-' }}
              </div>
              <span v-if="!formData.n4_standard_regimen?.some(Boolean)" class="view-text">-</span>
            </div>
          </div>
        </div>
        <!-- 实际方案（单行输入列表） -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">实际方案：</label>
          <div class="cot-field-value">
            <template v-if="isEdit">
              <div class="inline-list">
                <div v-for="(item, idx) in formData.n4_actual_regimen" :key="idx" class="inline-row">
                  <el-input
                    show-word-limit
                    maxlength="200"
                    v-model="formData.n4_actual_regimen[idx]"
                    placeholder="请填写内容"
                    class="inline-input"
                    @input="markDirty"
                  />
                  <i class="iconfont icon-tianjiayihang" @click="addActualPlan(idx)"></i>
                  <i v-if="formData.n4_actual_regimen.length > 1" class="iconfont icon-shanchu-1" @click="removeActualPlan(idx)"></i>
                </div>
              </div>
            </template>
            <div v-else class="view-inline-list">
              <div v-for="(item, idx) in formData.n4_actual_regimen" :key="idx" class="view-inline-row">
                {{ item || '-' }}
              </div>
              <span v-if="!formData.n4_actual_regimen?.some(Boolean)" class="view-text">-</span>
            </div>
          </div>
        </div>
        <!-- 偏离性质 -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">偏离性质：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="select"
              :model-value="formData.n4_deviation_nature"
              :options="n4_deviation_natureOptions"
              placeholder="请选择一项"
              @update:model-value="(v) => { formData.n4_deviation_nature = v; onDeviationChange(v) }"
            />
          </div>
        </div>
        <!-- 患者限制因素（条件显示） -->
        <!--v-if="isDeviationNegative" -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }" v-if="isDeviationNegative">
          <label class="cot-field-label">患者限制因素：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="multiselect"
              :model-value="formData.n4_patient_constraints"
              :options="patientConstraintOptions"
              placeholder="请选择一项"
              @update:model-value="(v) => { formData.n4_patient_constraints = v; markDirty() }"
            />
          </div>
        </div>

        <!-- ==================== 新增：禁忌方案列表 ==================== -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label">禁忌方案列表：</label>
          <div class="cot-field-value">
            <template v-if="isEdit">
              <div class="combo-list pd16">
                <div v-for="(item, idx) in formData.n4_forbidden_regimens_list" :key="idx" class="combo-row" >
                  <!-- 1. 项目名 -->
                  <el-input
                    v-model="item.forbidden_item"
                    placeholder="请填写项目名称"
                    show-word-limit
                    maxlength="200"
                    style="flex: 2;"
                    @input="markDirty"
                  />
                  <!-- 2. 禁忌原因类型 -->
                  <el-select
                    v-model="item.forbidden_reason_type"
                    placeholder="请选择禁忌原因"
                    style="flex: 2;"
                    clearable
                    @change="markDirty"
                  >
                    <el-option label="高毒低效" value="HIGH_TOXICITY_LOW_BENEFIT" />
                    <el-option label="交叉反应风险" value="CROSS_REACTION_RISK" />
                    <el-option label="合并症禁忌" value="CONTRAINDICATION_COMORBIDITY" />
                    <el-option label="分子/病理不匹配" value="MOLECULAR_OR_PATHOLOGICAL_MISMATCH" />
                  </el-select>
                  <!-- 3. 严重程度 -->
                  <el-select
                    v-model="item.severity_level"
                    placeholder="请选择严重程度"
                    style="flex: 1.5;"
                    clearable
                    @change="markDirty"
                  >
                    <el-option label="绝对禁忌" value="ABSOLUTE_CONTRAINDICATION" />
                    <el-option label="相对警告" value="RELATIVE_WARNING" />
                  </el-select>
                  <!-- 操作按钮 -->
                  <i class="iconfont icon-tianjiayihang" @click="addForbiddenRegimen(idx)"></i>
                  <i v-if="formData.n4_forbidden_regimens_list.length > 1" class="iconfont icon-shanchu-1" @click="removeForbiddenRegimen(idx)"></i>
                </div>
              </div>
            </template>
            <div v-else class="cot-view-combo-cards">
              <div class="view-inline-row">
                {{
                  formData.n4_forbidden_regimens_list
                    ?.filter(item => item.forbidden_item || item.forbidden_reason_type || item.severity_level)
                    ?.map(item => {
                      return [
                        item.forbidden_item || '-',
                        getReasonLabel(item.forbidden_reason_type),
                        getSeverityLabel(item.severity_level)
                      ].join('-')
                    })
                    ?.join('、') || '-'
                }}
              </div>
              <span v-if="!formData.n4_forbidden_regimens_list?.length" class="view-text">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 思维链 -->
    <div class="cot-section">
      <div class="section-title">思维链</div>
      <div class="cot-section pd24">
        <div class="thinking-step-row">
          <div class="step-title">第一步：标准基线</div>
          <div class="step-content">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :model-value="formData.n4_tradeoff_logic_cot.step_1_standard_baseline"
              :rows="3"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n4_tradeoff_logic_cot.step_1_standard_baseline = v; markDirty() }"
            />
          </div>
        </div>

        <div class="thinking-step-row">
          <div class="step-title">第二步：约束拦截</div>
          <div class="step-content">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :model-value="formData.n4_tradeoff_logic_cot.step_2_constraint_interception"
              :rows="3"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n4_tradeoff_logic_cot.step_2_constraint_interception = v; markDirty() }"
            />
          </div>
        </div>

        <div class="thinking-step-row">
          <div class="step-title">第三步：临床权衡</div>
          <div class="step-content">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :model-value="formData.n4_tradeoff_logic_cot.step_3_clinical_balancing"
              :rows="3"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n4_tradeoff_logic_cot.step_3_clinical_balancing = v; markDirty() }"
            />
          </div>
        </div>

        <div class="thinking-step-row">
          <div class="step-title">第四步：安全保障</div>
          <div class="step-content">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :model-value="formData.n4_tradeoff_logic_cot.step_4_safety_guarantee"
              :rows="3"
              placeholder="请填写内容"
              @update:model-value="(v) => { formData.n4_tradeoff_logic_cot.step_4_safety_guarantee = v; markDirty() }"
            />
          </div>
        </div>
      </div>

    </div>

    <!-- 引用证据 -->
    <EvidenceReference
      ref="evidenceRef"
      :is-edit="isEdit"
      :stepType="4"
      @pathOptions="handlePathOptions"
      v-model="formData.node_evidence_block"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, inject } from 'vue'
import { ElMessage } from 'element-plus'
import EditableField from './EditableField.vue'
import COTModuleHeader from './COTModuleHeader.vue'
import EvidenceReference from './EvidenceReference.vue'
import { useMedicalStore } from '@/store/medicalStore'
import { queryDataByKey } from '@/api/api_cot.js'
import _ from 'lodash'
defineOptions({ name: 'COTN4', inheritAttrs: false })

const emit = defineEmits(['updataLastSavedTime'])

const props = defineProps({
  isEdit: { type: Boolean, default: false },
  cotData: { type: Object, default: null },
  anchorTime: { type: String, default: '' }
})

const medicalStore = useMedicalStore()

// 引用证据
const evidenceRef = ref(null)

const anchorPathList = ref([{ key: '', value: '' }])
const anchorTimestamp = ref(null)
const anchorFormat = ref('list') // 'list' | 'single'

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
//   anchorFormat.value = Array.isArray(anchor?.anchor_path_list)
//     ? 'list'
//     : (anchor?.anchor_path ? 'single' : 'list')
//   anchorPathList.value = normalizeAnchorPathList(anchor)
// }
// 修改后的 syncAnchorFromCotData 函数
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
const deviationNegativeValues = ['QUESTIONABLE_DEVIATION', 'JUSTIFIED_TRADEOFF', 'ACCEPTABLE_ALTERNATIVE']
const isDeviationNegative = computed(() => deviationNegativeValues.includes(formData.value.n4_deviation_nature))

function onDeviationChange(val) {
  if (!isDeviationNegative.value) {
    formData.value.n4_patient_constraints = Array.isArray(formData.value.n4_patient_constraints) ? [] : ''
  }
  markDirty()
}
let skipMarkDirty = false
const formData = ref({})
watch(() => props.cotData, (data) => {
  if (!data) return
  skipMarkDirty = true
  // 深拷贝：断开与 props.cotData 的引用链，避免 EvidenceReference 修改时触发 cotData deep watcher 导致字段重置
  formData.value = _.cloneDeep(data)
  // 确保禁忌方案列表有初始值
  if (!formData.value.n4_forbidden_regimens_list || !formData.value.n4_forbidden_regimens_list.length) {
    formData.value.n4_forbidden_regimens_list = [{ forbidden_item: '', forbidden_reason_type: '', severity_level: '' }]
  }

  syncAnchorFromCotData(data.node_temporal_anchor)
  // 【新增此段逻辑】：初始化时若不显示，则顺便清洗残留数据
  if (!isDeviationNegative.value) {
    formData.value.n4_patient_constraints = Array.isArray(formData.value.n4_patient_constraints) ? [] : ''
  }
  nextTick(() => { skipMarkDirty = false })
}, { immediate: true })

const anchorPathOptions = ref([])
function handlePathOptions(options) {
  anchorPathOptions.value = options
}

const n4_deviation_natureOptions = [
  { label: '符合标准——正例', value: 'ALIGNED_WITH_STANDARD' },
  { label: '合理权衡——弱正例', value: 'JUSTIFIED_TRADEOFF' },
  { label: '可接受替代——中性', value: 'ACCEPTABLE_ALTERNATIVE' },
  { label: '存疑偏离——弱负例', value: 'QUESTIONABLE_DEVIATION' },
  { label: '明确错误/遗漏——强负例', value: 'DOCUMENTED_ERROR_OR_OMISSION' }
]

const patientConstraintOptions = [
  { label: '经济困难', value: 'ECONOMIC_HARDSHIP' },
  { label: '医保拒付', value: 'INSURANCE_REJECTION' },
  { label: '医学禁忌', value: 'MEDICAL_CONTRAINDICATION' },
  { label: '患者拒绝', value: 'PATIENT_REFUSAL' },
  { label: '历史时间差/时代局限', value: 'HISTORICAL_TIME_GAP' },
  { label: '医院缺药/缺耗材', value: 'HOSPITAL_STOCK_OUT' },
  { label: '资源竞争', value: 'RESOURCE_COMPETITION' },
  { label: '医院方案限制', value: 'INSTITUTIONAL_PROTOCOL_LIMIT' },
  { label: '无', value: 'NONE' }
]

function addAnchorPath(idx) {
  if (anchorPathList.value.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  anchorPathList.value.splice(idx + 1, 0, { key: '', value: '' })
  markDirty()
}
const recordId = inject('recordId')
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

function removeAnchorPath(idx) {
  anchorPathList.value.splice(idx, 1)
  markDirty()
}

function addStandardPlan(idx) {
  if (formData.value.n4_standard_regimen.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  formData.value.n4_standard_regimen.splice(idx + 1, 0, ''); markDirty()
}
function removeStandardPlan(idx) { formData.value.n4_standard_regimen.splice(idx, 1); markDirty() }
function addActualPlan(idx) {
  if (formData.value.n4_actual_regimen.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  formData.value.n4_actual_regimen.splice(idx + 1, 0, ''); markDirty()
}
function removeActualPlan(idx) { formData.value.n4_actual_regimen.splice(idx, 1); markDirty() }
function addForbiddenRegimen(idx) {
  if (formData.value.n4_forbidden_regimens_list.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  formData.value.n4_forbidden_regimens_list.splice(idx + 1, 0, {
    forbidden_item: '',
    forbidden_reason_type: '',
    severity_level: ''
  })
  markDirty()
}

function removeForbiddenRegimen(idx) {
  formData.value.n4_forbidden_regimens_list.splice(idx, 1)
  markDirty()
}

// 视图模式下的 Label 转换工具函数
function getReasonLabel(val) {
  const map = {
    HIGH_TOXICITY_LOW_BENEFIT: '高毒低效',
    CROSS_REACTION_RISK: '交叉反应风险',
    CONTRAINDICATION_COMORBIDITY: '合并症禁忌',
    MOLECULAR_OR_PATHOLOGICAL_MISMATCH: '分子/病理不匹配'
  }
  return map[val] || '-'
}

function getSeverityLabel(val) {
  const map = {
    ABSOLUTE_CONTRAINDICATION: '绝对禁忌',
    RELATIVE_WARNING: '相对警告'
  }
  return map[val] || '-'
}
function markDirty() { medicalStore.setDirty() }

watch(() => ({ ...formData.value, anchorPathList: anchorPathList.value }), () => {
  if (props.isEdit && !skipMarkDirty) markDirty()
}, { deep: true })

function getValidateResult() {
  if (evidenceRef.value && !evidenceRef.value.getValidateResult()) {
    ElMessage.warning('N4-方案抉择：请完善引用证据')
    return false
  }

  // 基础必填项
  const required = [
    { key: 'node_temporal_anchor', label: '锚定路径', value: anchorPathList.value.every(a => a.key && a.value) },
    { key: 'n4_standard_regimen', label: '标准方案', value: formData.value.n4_standard_regimen?.every(kv => kv) },
    { key: 'n4_actual_regimen', label: '实际方案', value: formData.value.n4_actual_regimen?.every(kv => kv) },
    { key: 'n4_deviation_nature', label: '偏离性质', value: formData.value.n4_deviation_nature },
    { key: 'n4_tradeoff_logic_cot.step_1_standard_baseline', label: '思维链-第一步', value: formData.value.n4_tradeoff_logic_cot.step_1_standard_baseline },
    { key: 'n4_tradeoff_logic_cot.step_2_constraint_interception', label: '思维链-第二步', value: formData.value.n4_tradeoff_logic_cot.step_2_constraint_interception },
    { key: 'n4_tradeoff_logic_cot.step_3_clinical_balancing', label: '思维链-第三步', value: formData.value.n4_tradeoff_logic_cot.step_3_clinical_balancing },
    { key: 'n4_tradeoff_logic_cot.step_4_safety_guarantee', label: '思维链-第四步', value: formData.value.n4_tradeoff_logic_cot.step_4_safety_guarantee }
  ]
  // 在 getValidateResult 中追加对禁忌方案行数据的校验
  if (formData.value.n4_forbidden_regimens_list?.length) {
    const hasInvalidRow = formData.value.n4_forbidden_regimens_list.some(item => {
      // 如果用户填了其中任意一项，则其余两项也必须填写
      const hasAny = item.forbidden_item || item.forbidden_reason_type || item.severity_level
      const hasAll = item.forbidden_item && item.forbidden_reason_type && item.severity_level
      return hasAny && !hasAll
    })
    if (hasInvalidRow) {
      ElMessage.warning('N4-方案抉择：请完善禁忌方案列表')
      return false
    }
  }
  // 当 isDeviationNegative 为 true 时，患者限制因素才加入必填校验
  if (isDeviationNegative.value) {
    // 确保值存在（如果是数组需要判断长度，如果是字符串判断是否为空）
    const hasValue = Array.isArray(formData.value.n4_patient_constraints)
      ? formData.value.n4_patient_constraints.length > 0
      : !!formData.value.n4_patient_constraints

    required.push({
      key: 'n4_patient_constraints',
      label: '患者限制因素',
      value: hasValue
    })
  }

  const empty = required.filter(f => !f.value)
  if (empty.length) {
    ElMessage.warning(`N4-方案抉择：请填写 ${empty.map(f => f.label).join('、')}`)
    return false
  }
  return true
}

function getEditingMedicalContent() {
  return {
    ...formData.value,
    node_temporal_anchor: denormalizeNodeTemporalAnchor(),
    node_evidence_block: evidenceRef.value?.getData()
  }
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
function getData() {
  Object.assign(formData.value, {
    n4_standard_regimen: [''],
    n4_actual_regimen: [''],
    n4_deviation_nature: '',
    n4_patient_constraints: '',
    n4_tradeoff_logic_cot: '',
    n4_forbidden_regimens_list: [{ forbidden_item: '', forbidden_reason_type: '', severity_level: '' }]
  })
  anchorPathList.value = [{ key: '', value: '' }]
  anchorTimestamp.value = null
  anchorFormat.value = 'list'
}

defineExpose({ getEditingMedicalContent, getData, getValidateResult })
</script>

<style lang="scss" scoped>
@use './cot-common.scss';
.pd24 {
  box-sizing: border-box;
  padding: 24px;
  border-radius: 4px;
  background: rgba(240, 243, 248, 0.3);
}
.combo-list {
  .combo-row {
    display: flex;
    margin-bottom: 16px;
    gap: 16px;
    .iconfont {
      margin: 0;
    }
    .combo-select {
      margin-right: 16px;
    }
  }
}

.cot-view-combo-cards {
  .view-combo-row {
    margin-bottom: 16px;
    padding: 0;
  }
  .view-combo-row {
    .view-combo-path,
    .view-combo-text {
      line-height: 23px;
      font-weight: 400;
      font-size: 16px;
      color: var(--theme-text);
    }
  }
}
.thinking-step-row {
  .step-content {
    padding: 0;
  }
  .step-title {
    margin-bottom: 12px;
    line-height: 28px;
  }
}

// N4 — 方案处理
.cot-n4 {
  // 核心结构化字段：所有 label 左对齐
  .cot-section .cot-field-row {
    min-height: 0;
    margin-bottom: 16px;
    &:nth-last-child(1) {
      margin-bottom: 0;
    }
    .cot-field-label {
      text-align: left;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
  }
}
:deep(.evidence-reference) {
  margin-top: 0;
  padding-top: 0;
}
.cot-n4 {
  .cot-field-row {
    .cot-field-label {
      margin-bottom: 16px;
    }
  }
  .cot-field-value {
    .inline-list {
      .inline-row {
        margin-bottom: 16px;
      }
    }
  }
}

</style>
