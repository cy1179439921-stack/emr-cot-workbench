<template>
  <div class="cot-module cot-n1" :class="{ isEdit }">
    <COTModuleHeader badge="N1" title="初始呈象" :anchorTime="anchorTime" />

    <!-- 锚定路径 -->
    <div class="cot-section">
      <div class="section-title">锚定路径</div>
      <div class="cot-anchor-row">
        <span class="anchor-tag">
          <i class="iconfont icon-jibenxinxi"></i>
          <span>基本信息</span>
        </span>

        <div class="cot-field-row">
          <label class="cot-field-label">{{anchorPathMap.get(formData.node_temporal_anchor.anchor_path)+'：'}}</label>
          <div class="cot-field-value text">
            <EditableField
              mode="view"
              input-type="text"
              :model-value="formData.node_temporal_anchor.anchor_timestamp"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 核心结构化字段 -->
    <div class="cot-section cot-core-fields">
      <div class="section-title">核心结构化字段</div>

      <!-- 双列网格：模板类型 + 紧急度 / 初步印象 + 鉴别诊断 -->
      <div class="core-fields-grid">
        <div class="cot-field-row">
          <label class="cot-field-label">模板类型：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="select"
              :model-value="formData.template_type"
              :options="templateTypeOptions"
              placeholder="请选择一项"
              @update:model-value="
                (v) => {
                  formData.template_type = v;
                }
              "
              @change="onTemplateTypeChange"
            />
          </div>
        </div>

        <div class="cot-field-row">
          <label class="cot-field-label">紧急度：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="select"
              :model-value="formData.n1_urgency_level"
              :options="urgencyOptions"
              placeholder="请选择一项"
              @update:model-value="
                (v) => {
                  formData.n1_urgency_level = v;
                }
              "
            />
          </div>
        </div>

        <!-- 核心修改 1：控制“初步印象”显隐 -->
        <div class="cot-field-row" v-if="formData.template_type === 'ACUTE_OR_FIRST_DIAGNOSIS'">
          <label class="cot-field-label">初步印象：</label>
          <div class="cot-field-value">
            <EditableField
              v-if="!isEdit"
              mode="view"
              input-type="select"
              :model-value="tramsfromName(formData.n1_primary_impressions)"
            />
            <operationCodeSelect
              v-else
              multiple
              useCustomSelectionItems
              valueFileds="name"
              :options="diagnoOptions"
              v-model="formData.n1_primary_impressions"
              popperClass="setWidthPopper"
            >
            </operationCodeSelect>
          </div>
        </div>

        <!-- 核心修改 2：控制“鉴别诊断”显隐 -->
        <div class="cot-field-row" v-if="formData.template_type === 'ACUTE_OR_FIRST_DIAGNOSIS'">
          <label class="cot-field-label">鉴别诊断：</label>
          <div class="cot-field-value">
            <EditableField
              v-if="!isEdit"
              mode="view"
              input-type="select"
              :model-value="tramsfromName(formData.n1_differential_list)"
            />
            <operationCodeSelect
              v-else
              multiple
              useCustomSelectionItems
              valueFileds="name"
              :options="diagnoOptions"
              v-model="formData.n1_differential_list"
              popperClass="setWidthPopper"
            >
            </operationCodeSelect>
          </div>
        </div>

        <div
          class="cot-field-row"
          v-if="formData.template_type === 'CHRONIC_MAINTENANCE_ASSESSMENT'"
        >
          <label class="cot-field-label">基线状态评估：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :rows="1"
              :model-value="formData.n1_baseline_status_assessment"
              placeholder="请填写基线状态评估"
              @update:model-value="
                (v) => {
                  formData.n1_baseline_status_assessment = v;
                }
              "
            />
          </div>
        </div>

        <div
          class="cot-field-row"
          v-if="formData.template_type === 'CHRONIC_MAINTENANCE_ASSESSMENT'"
        >
          <label class="cot-field-label">慢性并发症筛查：</label>
          <div class="cot-field-value">
            <EditableField
              v-if="!isEdit"
              mode="view"
              input-type="select"
              :model-value="
                tramsfromName(formData.n1_chronic_complications_screening)
              "
            />
            <operationCodeSelect
              v-else
              useCustomSelectionItems
              valueFileds="name"
              :options="diagnoOptions"
              v-model="formData.n1_chronic_complications_screening"
              popperClass="setWidthPopper"
            >
            </operationCodeSelect>
          </div>
        </div>

        <div
          class="cot-field-row full-width-row"
          v-if="formData.template_type === 'PROCEDURAL_INDICATION_REVIEW'"
        >
          <label class="cot-field-label">操作指征陈述：</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="textarea"
              :rows="1"
              :model-value="formData.n1_procedural_indication"
              placeholder="请填写内容"
              @update:model-value="
                (v) => {
                  formData.n1_procedural_indication = v;
                }
              "
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 思维链 -->
    <div class="cot-section chainOfThought">
      <div class="section-title">思维链</div>
      <div class="cot-field-value thinking-chain-area cot-thinking-textarea">
        <EditableField
          :mode="isEdit ? 'edit' : 'view'"
          input-type="textarea"
          :model-value="formData.n1_diagnostic_logic_cot"
          :rows="6"
          placeholder="请填写内容"
          @update:model-value="
            (v) => {
              formData.n1_diagnostic_logic_cot = v;
            }
          "
        />
      </div>
    </div>
    <!-- 引用证据 -->
    <EvidenceReference
      @pathOptions="handlePathOptions"
      ref="evidenceRef"
      :is-edit="isEdit"
      :stepType="1"
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
import operationCodeSelect from '@/components/common/operationCodeSelect.vue'
import { getDiagnosisCodeList } from '@/api/jiancanAPI/api_home.js'
import _ from 'lodash'
const diagnoOptions = ref([]) // 诊断字典

const getCode = async () => {
  const params = {
    pageNum: 1,
    pageSize: 50000
  }
  getDiagnosisCodeList(params).then((res) => {
    diagnoOptions.value = res.data?.items || []
  })
}

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  /** 父组件下发的 COT 数据（回显用） */
  cotData: {
    type: Object,
    default: null
  },
  /** 锚定时间 */
  anchorTime: {
    type: String,
    default: ''
  }
})

const medicalStore = useMedicalStore()
const formData = ref({})

// 引用证据
const evidenceRef = ref(null)

let skipMarkDirty = false

watch(
  () => props.cotData,
  (data) => {
    if (!data) return
    skipMarkDirty = true
    formData.value = _.cloneDeep(data)
    nextTick(() => {
      skipMarkDirty = false
    })
  },
  { deep: true, immediate: true }
)

const templateTypeOptions = [
  { label: '首次诊断', value: 'ACUTE_OR_FIRST_DIAGNOSIS' },
  { label: '慢病维持评估', value: 'CHRONIC_MAINTENANCE_ASSESSMENT' },
  { label: '操作指征复核', value: 'PROCEDURAL_INDICATION_REVIEW' }
]

const urgencyOptions = [
  { label: '危重抢救', value: 'CRITICAL_RESUSCITATION' },
  { label: '紧急治疗', value: 'URGENT_TREATMENT' },
  { label: '常规诊断', value: 'ROUTINE_DIAGNOSIS' },
  { label: '常规监测', value: 'ROUTINE_MONITORING' },
  { label: '择期', value: 'ELECTIVE' }
]

function onTemplateTypeChange(val) {
  // 核心修改 3：当切换到非 ACUTE_OR_FIRST_DIAGNOSIS 模板时，清空初步印象和鉴别诊断
  if (val !== 'ACUTE_OR_FIRST_DIAGNOSIS') {
    formData.value.n1_primary_impressions = []
    formData.value.n1_differential_list = []
  }

  if (val !== 'CHRONIC_MAINTENANCE_ASSESSMENT') { formData.value.n1_baseline_status_assessment = '' }
  if (val !== 'CHRONIC_MAINTENANCE_ASSESSMENT') { formData.value.n1_chronic_complications_screening = '' }
  if (val !== 'PROCEDURAL_INDICATION_REVIEW') { formData.value.n1_procedural_indication = '' }
  markDirty()
}

function markDirty() {
  medicalStore.setDirty()
}

// 监听所有字段变化
watch(
  () => formData.value,
  () => {
    if (props.isEdit && !skipMarkDirty) markDirty()
  },
  { deep: true }
)

function getRequiredFields() {
  // 1. 基础必填项（无论选择什么模板，这些都是必填的）
  const fields = [
    {
      key: 'template_type',
      label: '模板类型',
      value: formData.value.template_type
    },
    {
      key: 'n1_urgency_level',
      label: '紧急度',
      value: formData.value.n1_urgency_level
    },
    {
      key: 'n1_diagnostic_logic_cot',
      label: '思维链',
      value: formData.value.n1_diagnostic_logic_cot
    }
  ]

  // 2. 只有当模板类型为 ACUTE_OR_FIRST_DIAGNOSIS 时，初步印象和鉴别诊断才为必填
  if (formData.value.template_type === 'ACUTE_OR_FIRST_DIAGNOSIS') {
    fields.push(
      {
        key: 'n1_primary_impressions',
        label: '初步印象',
        value: Array.isArray(formData.value.n1_primary_impressions)
          ? formData.value.n1_primary_impressions?.length
          : formData.value?.n1_primary_impressions
      },
      {
        key: 'n1_differential_list',
        label: '鉴别诊断',
        value: Array.isArray(formData.value.n1_differential_list)
          ? formData.value.n1_differential_list.length
          : formData.value?.n1_differential_list
      }
    )
  }

  // 3. 其他特定模板类型的必填校验
  if (formData.value.template_type === 'CHRONIC_MAINTENANCE_ASSESSMENT') {
    fields.push({
      key: 'n1_baseline_status_assessment',
      label: '基线状态评估',
      value: formData.value.n1_baseline_status_assessment
    })
  }
  if (formData.value.template_type === 'PROCEDURAL_INDICATION_REVIEW') {
    fields.push({
      key: 'n1_procedural_indication',
      label: '操作指征陈述',
      value: formData.value.n1_procedural_indication
    })
  }

  return fields
}

function getEditingMedicalContent() {
  return {
    ...formData.value,
    node_evidence_block: evidenceRef.value?.getData()
  }
}

function getData() {
  Object.assign(formData, {})
}
const anchorPathOptions = ref([])
function handlePathOptions(options) {
  anchorPathOptions.value = options
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
function getValidateResult() {
  const requiredFields = getRequiredFields()
  const emptyFields = requiredFields.filter((f) => !f.value)
  console.log('requiredFields', requiredFields)
  if (emptyFields.length > 0) {
    const names = emptyFields.map((f) => f.label).join('、')
    ElMessage.warning(`N1-初始呈象：请填写 ${names}`)
    return false
  }

  // 校验证据引用
  if (evidenceRef.value && !evidenceRef.value.getValidateResult()) {
    ElMessage.warning('N1-初始呈象：请完善引用证据')
    return false
  }
  return true
}

const tramsfromName = (name) => {
  return (Array.isArray(name) ? name : [name])
    .map(
      (item) =>
        diagnoOptions.value.find((option) => option.code === item)?.name ||
        item
    )
    .join(',')
}

getCode()

defineExpose({
  getEditingMedicalContent,
  getData,
  getValidateResult
})
</script>

<style lang="scss" scoped>
@use "./cot-common.scss";

.cot-n1 {
  .core-fields-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 24px 24px 0 24px;
    border-radius: 6px;
    background: rgba(240, 243, 248, 0.3);

    .cot-field-row {
      display: flex;
      align-items: flex-start;
      box-sizing: border-box;
      width: 50%;
      margin-bottom: 16px;

      &:has(textarea) {
        align-items: flex-start !important;
        .cot-field-label {
          padding-top: 6px;
        }
      }

      .cot-field-label {
        padding-right: 0;
        text-align: left;
      }
      .cot-field-value {
        margin-top: 2px;
        padding-right: 36px;
      }
      &:nth-of-type(2n) {
        width: calc(50% - 36px);
        .cot-field-value {
          padding-right: 0;
        }
      }

      &.full-width-row {
        width: 100%;
        .cot-field-value {
          padding-right: 0;
        }
      }
    }
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
    .thinking-chain-area {
      padding: 0;
    }
    .core-fields-grid {
      .cot-field-row {
        align-items: center;

        &:has(textarea) {
          align-items: flex-start !important;
        }

        .cot-field-value {
          margin-top: 0;
        }
      }
    }
  }
}
</style>
