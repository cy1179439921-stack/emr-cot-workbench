<template>
  <div class="editable-field">
    <!-- 显示模式：纯文字展示 -->
    <span
      v-if="mode === 'view'"
      class="field-display"
      :class="{ 'is-empty': isEmpty, 'is-tag': inputType === 'select' || inputType === 'multiselect' }"
      :title="displayText"
    >
      {{ displayText }}
    </span>

    <!-- 编辑模式：根据 inputType 动态渲染 -->
    <template v-else>
      <!-- 单行文本 -->
      <el-input
        v-if="inputType === 'text'"
        :model-value="modelValue"
        :placeholder="placeholder || '请填写'"
        :disabled="disabled"
        :clearable="clearable"
        maxlength="200"
        @update:model-value="handleInput"
        @change="handleChange"
      />

      <!-- 多行文本 -->
      <el-input
        v-else-if="inputType === 'textarea'"
        type="textarea"
        :model-value="modelValue"
        :placeholder="placeholder || '请填写'"
        :disabled="disabled"
        :autosize="{ minRows: rows,maxRows: 3 }"
        show-word-limit
        maxlength="10000"
        @update:model-value="handleInput"
        @change="handleChange"
      />

      <!-- 下拉选项（单选） -->
      <el-select
        v-else-if="inputType === 'select'"
        :model-value="modelValue"
        :placeholder="placeholder || '请选择'"
        :disabled="disabled"
        :clearable="clearable"
        @update:model-value="handleInput"
        @change="handleChange"
      >
        <el-option
          v-for="opt in normalizedOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <!-- 下拉选项（多选） -->
      <el-select
        v-else-if="inputType === 'multiselect'"
        :model-value="modelValue"
        :placeholder="placeholder || '请选择'"
        :disabled="disabled"
        :clearable="clearable"
        multiple
        collapse-tags
        collapse-tags-tooltip
        @update:model-value="handleInput"
        @change="handleChange"
      >
        <el-option
          v-for="opt in normalizedOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <!-- 日期选择 -->
      <el-date-picker
        v-else-if="inputType === 'date'"
        :model-value="modelValue"
        type="date"
        :placeholder="placeholder || '请选择日期'"
        :disabled="disabled"
        :clearable="clearable"
        value-format="YYYY-MM-DD"
        @update:model-value="handleInput"
        @change="handleChange"
      />

      <!-- 日期时间选择 -->
      <el-date-picker
        v-else-if="inputType === 'datetime'"
        :model-value="modelValue"
        type="datetime"
        :placeholder="placeholder || '请选择日期时间'"
        :disabled="disabled"
        :clearable="clearable"
        value-format="YYYY-MM-DD HH:mm:ss"
        @update:model-value="handleInput"
        @change="handleChange"
      />

      <!-- 时间选择 -->
      <el-time-picker
        v-else-if="inputType === 'time'"
        :model-value="modelValue"
        :placeholder="placeholder || '请选择时间'"
        :disabled="disabled"
        :clearable="clearable"
        value-format="HH:mm:ss"
        @update:model-value="handleInput"
        @change="handleChange"
      />

      <!-- 级联选择（不可复选） -->
      <el-cascader
        v-else-if="inputType === 'cascader'"
        :model-value="modelValue"
        :options="options"
        :placeholder="placeholder || '请选择'"
        :disabled="disabled"
        :clearable="clearable"
        :props="cascaderProps"
        :show-all-levels="showAllLevels"
        :separator="separator"
        style="width: 100%;"
        @update:model-value="handleInput"
        @change="handleChange"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'EditableField',
  inheritAttrs: false
})

// ==================== Props ====================
const props = defineProps({
  /** v-model 绑定的值 */
  modelValue: {
    type: [String, Number, Date, Array, Object],
    default: undefined
  },
  /** 显示模式：view=文字展示, edit=编辑态 */
  mode: {
    type: String,
    default: 'view',
    validator: (v) => ['view', 'edit'].includes(v)
  },
  /** 编辑时的输入类型 */
  inputType: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'textarea', 'select', 'multiselect', 'date', 'datetime', 'time', 'cascader'].includes(v)
  },
  /** 下拉选项数据（inputType='select' 时有效） */
  options: {
    type: Array,
    default: () => []
  },
  /** 占位文字 */
  placeholder: {
    type: String,
    default: ''
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 是否可清除（编辑模式） */
  clearable: {
    type: Boolean,
    default: true
  },
  /** 多行文本行数 */
  rows: {
    type: Number,
    default: 1
  },
  /** 级联选择配置（inputType='cascader' 时有效），不可复选 */
  cascaderProps: {
    type: Object,
    default: () => ({
      multiple: false,
      checkStrictly: false,
      emitPath: false,
      label: 'label',
      value: 'value',
      children: 'children'
    })
  },
  /** 是否显示完整路径（级联选择） */
  showAllLevels: {
    type: Boolean,
    default: true
  },
  /** 路径分隔符（级联选择） */
  separator: {
    type: String,
    default: ' / '
  },
  /** 值不存在时显示的占位文字（显示模式） */
  emptyText: {
    type: String,
    default: '-'
  }
})

// ==================== Emits ====================
const emit = defineEmits([
  'update:modelValue',
  'change'
])

// ==================== Computed ====================

/** 将 options 统一为 { label, value } 格式 */
const normalizedOptions = computed(() => {
  return props.options.map((item) => {
    if (typeof item === 'string' || typeof item === 'number') {
      return { label: String(item), value: item }
    }
    return {
      label: item.label ?? item.name ?? item.text ?? String(item.value ?? item.id),
      value: item.value ?? item.id
    }
  })
})

/** 值是否为空 */
const isEmpty = computed(() => {
  if (props.modelValue === undefined || props.modelValue === null || props.modelValue === '') return true
  if (Array.isArray(props.modelValue) && props.modelValue.length === 0) return true
  return false
})

/** 递归查找级联路径：根据叶子 value 返回完整 label 路径 */
function findCascaderPath(opts, targetValue) {
  if (!opts || !opts.length) return null
  for (const opt of opts) {
    if (opt.value === targetValue) {
      return [opt.label]
    }
    if (opt.children && opt.children.length) {
      const childPath = findCascaderPath(opt.children, targetValue)
      if (childPath) {
        return [opt.label, ...childPath]
      }
    }
  }
  return null
}

/** 显示模式下渲染的文本 */
const displayText = computed(() => {
  if (isEmpty.value) return props.emptyText

  // 级联选择：根据叶子值查找完整路径展示
  if (props.inputType === 'cascader') {
    const path = findCascaderPath(props.options, props.modelValue)
    return path ? path.join(props.separator) : String(props.modelValue)
  }
  // 下拉选项类型：根据 value 查找对应的 label 展示
  if (props.inputType === 'select') {
    const found = normalizedOptions.value.find((opt) => String(opt.value) === String(props.modelValue))
    return found ? found.label : String(props.modelValue ?? '')
  }

  // 多选下拉：根据 value 数组查找对应 labels，分隔展示
  if (props.inputType === 'multiselect') {
    const values = Array.isArray(props.modelValue) ? props.modelValue : (props.modelValue != null ? [props.modelValue] : [])
    return values
      .map((v) => {
        const found = normalizedOptions.value.find((opt) => String(opt.value) === String(v))
        return found ? found.label : String(v)
      })
      .join('、')
  }
  // 日期/时间/文本类型直接展示
  return String(props.modelValue)
})

// ==================== Methods ====================

function handleInput(val) {
  emit('update:modelValue', val)
}

function handleChange(val) {
  emit('change', val)
}
</script>

<style lang="scss" scoped>
// EditableField — 可编辑字段组件
// 设计稿：
//   查看态：文字直接显示，字体 16px #666，select 值无背景标签
//   编辑态：白底 + 1px #d8d8d8 边框，高度 30px
.editable-field {
  display: flex;
  align-items: center;
  width: 100%;

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor),
  :deep(.el-cascader) {
    width: 100%;
  }

  // 编辑态：单行输入框
  :deep(.el-input) {
    .el-input__wrapper {
      height: 30px;
      padding: 0 8px;
      border-radius: 2px;
      background: var(--theme-card);
      box-shadow: 0 0 0 1px #d8d8d8 !important;
      transition: box-shadow 0.15s;

      &:hover {
        box-shadow: 0 0 0 1px #b8b8b8 !important;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--theme-primary) !important;
      }
    }
  }

  // 编辑态：多行文本
  :deep(.el-textarea) {
    .el-textarea__wrapper {
      padding: 6px 8px;
      border-radius: 2px;
      background: var(--theme-card);
      box-shadow: 0 0 0 1px #d8d8d8 !important;
      transition: box-shadow 0.15s;

      &:hover {
        box-shadow: 0 0 0 1px #b8b8b8 !important;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--theme-primary) !important;
      }

      .el-textarea__inner {
        padding: 0;
        resize: vertical;
        line-height: 1.65;
        font-size: 16px;
        color: var(--theme-text);
      }
    }
  }

  // 编辑态：下拉选择
  :deep(.el-select) {
    .el-select__wrapper {
      // height: 40px;
      // min-height: 40px;
      border-radius: 2px;
      background: var(--theme-card);
      box-shadow: 0 0 0 1px #d8d8d8 !important;
      transition: box-shadow 0.15s;

      &:hover {
        box-shadow: 0 0 0 1px #b8b8b8 !important;
      }

      &.is-focused {
        box-shadow: 0 0 0 1px var(--theme-primary) !important;
      }
    }
  }

  // 编辑态：级联选择
  :deep(.el-cascader) {
    .el-input__wrapper {
      height: 30px;
      border-radius: 2px;
      background: var(--theme-card);
      box-shadow: 0 0 0 1px #d8d8d8 !important;

      .el-input__inner {
        font-size: 16px;
        color: var(--theme-text);
      }
    }
  }
}

// 查看模式：纯文本显示
.field-display {
  display: block;
  overflow: hidden;
  max-width: 100%;
  line-height: 20px;
  text-overflow: ellipsis;
  font-size: 16px;
  color: var(--theme-text-2);
  word-break: break-all;
  white-space: normal;

  // select 查看态：去掉标签背景，直接显示文字
  &.is-tag {
    display: inline-block;
    padding: 0;
    border-radius: 0;
    background: transparent;
    font-size: 16px;
    color: var(--theme-text-2);
  }
}

</style>
