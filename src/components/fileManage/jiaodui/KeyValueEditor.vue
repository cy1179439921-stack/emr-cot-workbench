<template>
  <div class="key-value-editor">
    <div v-for="(item, idx) in modelValue" :key="idx" class="kv-row">
      <el-input
        :model-value="item.key"
        class="kv-key"
        size="default"
        :placeholder="keyPlaceholder"
        @update:model-value="(v) => updateItem(idx, 'key', v)"
      />
      <el-input
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 3 }"
        show-word-limit
        maxlength="2000"
        :model-value="item.value"
        class="kv-value"
        size="default"
        :placeholder="valuePlaceholder"
        @update:model-value="(v) => updateItem(idx, 'value', v)"
      />
      <template v-if="!hideBtn">
        <i class="iconfont icon-tianjiayihang" @click="addItem(idx)"></i>
        <i v-if="modelValue.length > 1" class="iconfont icon-shanchu-1" @click="removeItem(idx)"></i>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
defineOptions({ name: 'KeyValueEditor', inheritAttrs: false })

const props = defineProps({
  modelValue: { type: Array, default: () => [{ key: '', value: '' }] },
  keyPlaceholder: { type: String, default: '键' },
  valuePlaceholder: { type: String, default: '值' },
  hideBtn: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

function addItem(idx) {
  if (props.modelValue.length >= 20) {
    ElMessage.warning('最多添加 20 条，已经加满了')
    return
  }
  const arr = [...props.modelValue]
  arr.splice(idx + 1, 0, { key: '', value: '' })
  emit('update:modelValue', arr)
  emit('change')
}

function removeItem(idx) {
  const arr = props.modelValue.filter((_, i) => i !== idx)
  emit('update:modelValue', arr)
  emit('change')
}

function updateItem(idx, field, val) {
  const arr = props.modelValue.map((item, i) => {
    if (i !== idx) return item
    return { ...item, [field]: val }
  })
  emit('update:modelValue', arr)
  emit('change')
}
</script>

<style lang="scss" scoped>
@use './cot-common.scss';

// KeyValueEditor — 编辑态 KV
// 设计稿：白色背景 + 1px #d8d8d8 边框，行内左输入框（key）+ 右输入框（value）
// .key-value-editor {
// overflow: hidden;
// }

.kv-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 2px 0 2px;

  &:last-child {
    border-bottom: none;
  }
}

.kv-key {
  flex: 0 0 120px;
  :deep(.el-input__wrapper) {
    height: 32px;
    border-radius: 2px;
    box-shadow: 0 0 0 1px #d8d8d8 !important;

    &.is-focus {
      box-shadow: 0 0 0 1px var(--theme-primary) !important;
    }
  }

  :deep(.el-input__inner) {
    font-size: 14px;
    color: var(--theme-text);
  }
}

.kv-sep {
  flex-shrink: 0;
  font-size: 13px;
  color: #ccc;
}

.kv-value {
  flex: 1;

  :deep(.el-input__wrapper) {
    height: 32px;
    border-radius: 2px;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
    color: var(--theme-text);
  }
}
</style>
