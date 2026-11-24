<template>
  <!-- 枚举：下拉选择 -->
  <el-select
    v-if="kind === 'select'"
    class="fe-control"
    :model-value="modelValue"
    filterable
    clearable
    placeholder="请选择一项"
    @update:model-value="emitValue">
    <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
  </el-select>

  <!-- 布尔：是 / 否 -->
  <el-select
    v-else-if="kind === 'bool'"
    class="fe-control"
    :model-value="modelValue"
    placeholder="请选择一项"
    @update:model-value="emitValue">
    <el-option label="是" :value="true" />
    <el-option label="否" :value="false" />
  </el-select>

  <!-- 字符串数组：标签编辑 -->
  <div v-else-if="kind === 'tags'" class="fe-tags">
    <el-tag
      v-for="(tag, index) in listValue"
      :key="tag + '-' + index"
      class="fe-tag"
      closable
      @close="removeTag(index)">
      {{ labelMap[tag] || tag }}
    </el-tag>
    <el-input
      v-if="tagInputVisible"
      ref="tagInputRef"
      v-model="tagInput"
      class="fe-tag-input"
      size="small"
      placeholder="回车确认"
      @keyup.enter="confirmTag"
      @blur="confirmTag" />
    <el-button v-else class="fe-tag-add" size="small" text type="primary" @click="showTagInput">
      + 添加
    </el-button>
  </div>

  <!-- 键值对象：逐项编辑（如严重程度分期、检查计划、思维链分步） -->
  <div v-else-if="kind === 'map'" class="fe-map">
    <div v-for="entry in mapEntries" :key="entry.key" class="fe-row">
      <span class="fe-row-label">{{ kvLabel(entry.key) }}</span>
      <el-input
        class="fe-control"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 6 }"
        :model-value="entry.value"
        placeholder="请填写内容"
        @update:model-value="(value) => updateMapValue(entry.key, value)" />
    </div>
    <div v-if="!mapEntries.length" class="fe-empty">暂无内容</div>
  </div>

  <!-- 对象数组：逐条编辑（如禁用方案、不良事件） -->
  <div v-else-if="kind === 'records'" class="fe-records">
    <div v-for="(record, index) in recordList" :key="index" class="fe-record">
      <div class="fe-record-head">
        <span>第 {{ index + 1 }} 条</span>
        <el-button text type="danger" size="small" @click="removeRecord(index)">删除</el-button>
      </div>
      <div v-for="key in Object.keys(record)" :key="key" class="fe-row">
        <span class="fe-row-label">{{ kvLabel(key) }}</span>
        <el-input
          class="fe-control"
          :model-value="record[key]"
          placeholder="请填写内容"
          @update:model-value="(value) => updateRecordField(index, key, value)" />
      </div>
    </div>
    <el-button class="fe-add" text type="primary" size="small" @click="addRecord">+ 添加一条</el-button>
  </div>

  <!-- 其余：普通文本 -->
  <el-input
    v-else
    class="fe-control"
    type="textarea"
    :autosize="{ minRows: wordLimit ? 6 : 1, maxRows: wordLimit ? 12 : 8 }"
    :maxlength="wordLimit ? 1000 : undefined"
    :show-word-limit="wordLimit"
    :model-value="textValue"
    placeholder="请填写内容"
    @update:model-value="emitValue" />
</template>

<script>
export default { name: 'DemoFieldEditor' }
</script>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { COT_LABELS, kvLabel } from '@/mock/cotCaseData'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, Array, Object], default: '' },
  // 字段名（用于取枚举字典）
  field: { type: String, default: '' },
  // 字段类型：enum / list / kv / text
  type: { type: String, default: 'text' },
  // 长文本：限制 1000 字并显示字数统计（思维链）
  wordLimit: { type: Boolean, default: false },
  // 值的展示映射（如 ICD 编码 → 诊断名称）
  labelMap: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

// 枚举选项
const options = computed(() => {
  const dict = COT_LABELS[props.field] || {}
  return Object.entries(dict).map(([value, label]) => ({ value, label }))
})

// 控件形态
const kind = computed(() => {
  if (props.type === 'enum') return 'select'
  const value = props.modelValue
  if (Array.isArray(value)) {
    if (!value.length) return 'tags'
    return value.every(item => item === null || typeof item !== 'object') ? 'tags' : 'records'
  }
  if (value && typeof value === 'object') return 'map'
  if (typeof value === 'boolean') return 'bool'
  return 'text'
})

const emitValue = (value) => emit('update:modelValue', value)

const textValue = computed(() => {
  const value = props.modelValue
  if (value === undefined || value === null) return ''
  return String(value)
})

// ============ 标签（字符串数组） ============
const listValue = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const tagInputVisible = ref(false)
const tagInput = ref('')
const tagInputRef = ref(null)

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.focus())
}

const confirmTag = () => {
  const value = tagInput.value.trim()
  if (value && !listValue.value.includes(value)) {
    emitValue([...listValue.value, value])
  }
  tagInput.value = ''
  tagInputVisible.value = false
}

const removeTag = (index) => {
  const next = [...listValue.value]
  next.splice(index, 1)
  emitValue(next)
}

// ============ 键值对象 ============
const mapEntries = computed(() => {
  const value = props.modelValue
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  return Object.entries(value).map(([key, val]) => ({
    key,
    value: val === null || val === undefined ? '' : (typeof val === 'object' ? JSON.stringify(val) : String(val))
  }))
})

const updateMapValue = (key, value) => {
  emitValue({ ...(props.modelValue || {}), [key]: value })
}

// ============ 对象数组 ============
const recordList = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

const updateRecordField = (index, key, value) => {
  const next = recordList.value.map((item, i) => (i === index ? { ...item, [key]: value } : item))
  emitValue(next)
}

const removeRecord = (index) => {
  const next = recordList.value.filter((_, i) => i !== index)
  emitValue(next)
}

// 新增条目：沿用首条的键，值置空
const addRecord = () => {
  const template = recordList.value[0] || {}
  const blank = Object.keys(template).reduce((acc, key) => {
    acc[key] = ''
    return acc
  }, {})
  emitValue([...recordList.value, blank])
}
</script>

<style lang="scss" scoped>
.fe-control {
  width: 100%;
}

.fe-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;

  .fe-tag {
    color: #1f2d3d;
    background: var(--theme-primary-soft);
    border-color: #dfe6f2;
  }

  .fe-tag-input {
    width: 110px;
  }
}

.fe-map,
.fe-records {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.fe-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  .fe-row-label {
    flex-shrink: 0;
    width: 108px;
    padding-top: 5px;
    font-size: 12px;
    line-height: 1.5;
    color: #8793a8;
    word-break: break-all;
  }
}

.fe-record {
  padding: 10px 12px 12px;
  border: 1px solid #eef1f6;
  border-radius: 6px;
  background: var(--theme-fill);

  .fe-record-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 12px;
    color: #8793a8;
  }
}

.fe-add {
  align-self: flex-start;
  padding: 0;
}

.fe-empty {
  font-size: 13px;
  color: #a8b1c2;
}
</style>
