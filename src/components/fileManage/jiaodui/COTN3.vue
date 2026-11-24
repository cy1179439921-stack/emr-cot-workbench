<template>
  <div class="cot-module cot-n3" :class="{isEdit}">
    <COTModuleHeader badge="N3" title="病情锚定" :anchorTime="anchorTime" />

    <!-- 锚定路径 -->
    <div class="cot-section">
      <div class="section-title">锚定路径</div>
      <div class="cot-field-value cot-main cot-main-area">
        <span class="cot-field-label">
          <!-- {{!formData.node_temporal_anchor.anchor_path.includes('other_records')?'病程记录-首次病程记录-首次病程时间：':'病程记录-其他病程记录-其他病程时间：'}} -->
          {{anchorPathMap.get(formData.node_temporal_anchor.anchor_path)+'：'}}
          <span class="time-value">{{ formData.node_temporal_anchor?.anchor_timestamp }}</span> </span>
      </div>
    </div>
    <!-- 核心结构化字段 -->
    <div class="cot-section">
      <div class="section-title">核心结构化字段</div>
      <div class="cot-main cot-main-area">
        <!-- 严重度分级（多个key-value） -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label f500">严重度分级</label>
          <div class="cot-field-value">
            <KeyValueEditor
              v-if="isEdit"
              v-model="formData.n3_severity_staging"
              key-placeholder="请填写内容"
              value-placeholder="请填写内容"
              @change="markDirty"
            />
            <KeyValueViewer v-else :data="formData.n3_severity_staging" />
          </div>
        </div>

        <!-- 计划检查 -->
        <div class="cot-field-row" :class="{ 'block-layout': isEdit }">
          <label class="cot-field-label f500">治疗战略</label>
          <div class="cot-field-value">
            <EditableField
              :mode="isEdit ? 'edit' : 'view'"
              input-type="select"
              :model-value="formData.n3_treatment_strategy"
              :options="treatmentStrategyOptions"
              placeholder="请选择一项"
              @update:model-value="(v) => { formData.n3_treatment_strategy = v; markDirty() }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 思维链 -->
    <div class="cot-section">
      <div class="section-title">思维链</div>
      <div class="cot-field-value thinking-chain-area cot-thinking-textarea">
        <EditableField
          :mode="isEdit ? 'edit' : 'view'"
          input-type="textarea"
          :model-value="formData.n3_strategy_logic_cot"
          :rows="6"
          placeholder="请填写内容"
          @update:model-value="(v) => { formData.n3_strategy_logic_cot = v; markDirty() }"
        />
      </div>
    </div>

    <!-- 引用证据 -->
    <EvidenceReference
      ref="evidenceRef"
      :is-edit="isEdit"
      @pathOptions="handlePathOptions"
      :stepType="3"
      v-model="formData.node_evidence_block"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import EditableField from './EditableField.vue'
import KeyValueEditor from './KeyValueEditor.vue'
import KeyValueViewer from './KeyValueViewer.vue'
import COTModuleHeader from './COTModuleHeader.vue'
import EvidenceReference from './EvidenceReference.vue'
import { useMedicalStore } from '@/store/medicalStore'
import _ from 'lodash'

defineOptions({ name: 'COTN3', inheritAttrs: false })

const props = defineProps({
  isEdit: { type: Boolean, default: false },
  cotData: { type: Object, default: null },
  anchorTime: { type: String, default: '' }
})

const medicalStore = useMedicalStore()

const formData = ref({})

// 引用证据
const evidenceRef = ref(null)

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

watch(() => props.cotData, (data) => {
  if (!data) return
  skipMarkDirty = true
  // 深拷贝：断开与 props.cotData 的引用链，避免 EvidenceReference 修改时触发 cotData deep watcher 导致字段重置
  const _data = _.cloneDeep(data)
  formData.value = {
    ..._data,
    n3_severity_staging: _data.n3_severity_staging ? objToArray(_data.n3_severity_staging) : []
  }
  nextTick(() => { skipMarkDirty = false })
}, { deep: true, immediate: true })

const treatmentStrategyOptions = [
  { label: '根治性治疗', value: 'CURATIVE_DEFINITIVE' },
  { label: '手术根治', value: 'SURGICAL_DEFINITIVE' },
  { label: '姑息延长生命', value: 'PALLIATIVE_LIFE_PROLONGING' },
  { label: '常规维持', value: 'ROUTINE_MAINTENANCE' },
  { label: '急危重症抢救', value: 'ACUTE_CRITICAL_RESUSCITATION' },
  { label: '症状控制与支持', value: 'SYMPTOM_CONTROL_SUPPORTIVE' },
  { label: '诊断排查', value: 'DIAGNOSTIC_WORKUP' },
  { label: '围产期管理', value: 'PERIPARTUM_MANAGEMENT' },
  { label: '康复治疗', value: 'REHABILITATION' }
]

function markDirty() {
  medicalStore.setDirty()
}

watch(() => formData.value, () => {
  if (props.isEdit && !skipMarkDirty) markDirty()
}, { deep: true })

function getValidateResult() {
  // 校验证据引用
  if (evidenceRef.value && !evidenceRef.value.getValidateResult()) {
    ElMessage.warning('N3-病情锚定：请完善引用证据')
    return false
  }
  const required = [
    { key: 'n3_severity_staging', label: '严重度分级', value: formData.value.n3_severity_staging?.every(kv => kv.key && kv.value) },
    { key: 'n3_treatment_strategy', label: '治疗战略', value: formData.value.n3_treatment_strategy },
    { key: 'n3_strategy_logic_cot', label: '思维链', value: formData.value.n3_strategy_logic_cot }
  ]
  const empty = required.filter(f => !f.value)
  if (empty.length) {
    ElMessage.warning(`N3-病情锚定：请填写 ${empty.map(f => f.label).join('、')}`)
    return false
  }
  return true
}

function getEditingMedicalContent() {
  return {
    ...formData.value,
    n3_severity_staging: arrToObj(formData.value.n3_severity_staging),
    node_evidence_block: evidenceRef.value?.getData()
  }
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

function getData() {
  formData.value = {}
}

defineExpose({ getEditingMedicalContent, getData, getValidateResult })
</script>

<style lang="scss" scoped>
@use './cot-common.scss';

// N3 — 病情跟踪
.cot-n3 {
  .cot-main {
    :deep(.kv-row):first-child {
      padding-top: 0;
    }
    .cot-field-value {
      margin-top: 2px;
    }
  }

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
  }

  .f500 {
    margin-bottom: 16px !important;
    font-weight: 500;
  }
  &.isEdit {
    .thinking-chain-area {
      padding: 0;
    }
  }

  .time-value {
    font-size: 16px;
    color: var(--theme-text-2);
  }
}
</style>
