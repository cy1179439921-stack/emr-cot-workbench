<template>
  <el-select
    :model-value="modelValue"
    @update:modelValue="onUpdate"
    :multiple="true"
    :multiple-limit="multipleLimit"
    collapse-tags
    collapse-tags-tooltip
    clearable
    :placeholder="placeholder"
    class="common-multiple-select"
    :popper-class="popperClass +' '+ 'common-multiple-select-popper'"
    :placement="placement"
    @change="handleChange"
  >
    <template #header>
      <div class="select-header">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="indeterminate"
          @change="handleCheckAll"
        >
          全选
        </el-checkbox>
        <div class="select-count"><span :class="{zero:!modelValue.length}">{{ modelValue.length }}</span>/{{ allValues.length }}</div>
      </div>
    </template>
    <el-option
      v-for="item in options"
      :key="getOptionKey(item)"
      :label="getOptionLabel(item)"
      :value="getOptionValue(item)"
    />
  </el-select>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  options: { // 兼容label/value组合  兼容name/id组合
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  multipleLimit: {
    type: Number,
    default: 0
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  popperClass: {
    type: String,
    default: 'common-multiple-select-popper'
  },
  placement: {
    type: String,
    default: 'bottom-start'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const checkAll = ref(false)
const indeterminate = ref(false)

// 兼容多种格式：{ label, value }, { name, id }, { label }
const getOptionKey = (item) => {
  if (typeof item === 'object') {
    return item.value || item.id || item.label
  } else {
    return item
  }
}

const getOptionLabel = (item) => {
  if (typeof item === 'object') {
    return item.label || item.name || item.userName
  } else {
    return item
  }
}

const getOptionValue = (item) => {
  if (typeof item === 'object') {
    return item.value !== undefined ? item.value : (item.id !== undefined ? item.id : item.label)
  } else {
    return item
  }
}

// 计算所有选项的值列表（兼容多种格式）
const allValues = computed(() => {
  return props.options.map(item => getOptionValue(item))
})

watch(() => props.modelValue, (val) => {
  if (val.length === 0) {
    checkAll.value = false
    indeterminate.value = false
  } else if (val.length === allValues.value.length) {
    checkAll.value = true
    indeterminate.value = false
  } else {
    indeterminate.value = true
    checkAll.value = false
  }
}, { deep: true, immediate: true })

const handleCheckAll = (val) => {
  indeterminate.value = false
  if (val) {
    emit('update:modelValue', [...allValues.value])
    emit('change', [...allValues.value])
  } else {
    emit('update:modelValue', [])
    emit('change', [])
  }
}

const onUpdate = (val) => {
  emit('update:modelValue', val)
}

const handleChange = (val) => {
  emit('change', val)
}
</script>

<style lang="scss" scoped>
.common-multiple-select {
  width: 100%;
}
</style>
<style lang="scss">
.common-multiple-select-popper {
  .el-select-dropdown__header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 48px;
    padding: 0 20px;
    border-bottom: 1px solid #eee !important;
  }
  .select-header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .el-checkbox__label {
      padding-left: 11px;
      color: #3d3d3d;
    }
  }
  .select-count {
    font-size: 14px;
    color: #3d3d3d;
    span {
      color: #3670f8;
    }
  }
}
.darkModePopper {
  .select-header {
    .el-checkbox__label,
    .select-count {
      color: #fff;
    }
    .el-checkbox__input {
      &.is-checked .el-checkbox__inner {
        background: url(/src/assets/checked.png);
        background-size: contain;
        mask: url(/src/assets/checked.png);
        mask-size: 100% 100%;
        content: "";
      }
      &.is-indeterminate .el-checkbox__inner {
        background: url('@/assets/semiSelected.png');
        background-color: transparent;
        background-size: 100% 100%;
        mask: url('@/assets/semiSelected.png');
        mask-size: 100% 100%;
      }
    }
    .el-checkbox__inner {
      border: none;
      border-radius: 0;
      background: transparent;
      background: url('@/assets/darkUnchecked.png');
      background-color: transparent;
      background-size: 100% 100%;
      mask: url('@/assets/darkUnchecked.png');
      mask-size: 100% 100%;
    }
    .zero {
      color: #fff;
    }
  }
}
</style>
