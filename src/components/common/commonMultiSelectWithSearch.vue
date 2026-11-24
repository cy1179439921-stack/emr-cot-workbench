<template>
  <el-select
    :model-value="modelValue"
    @update:modelValue="onUpdate"
    :multiple="multiple"
    :multiple-limit="multipleLimit"
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="maxCollapseTags"
    clearable
    :placeholder="placeholder"
    class="disease-type-select"
    :popper-class="popperClass +' '+ 'disease-type-select-popper'"
    @visible-change="onVisibleChange"
    @change="handleChange"
    :placement="placement"
  >
    <template #header>
      <div class="select-header">
        <div class="search-input-container">
          <el-input
            ref="searchInput"
            v-model="searchKeyword"
            size="small"
            placeholder="请填写内容"
            clearable
          />
        </div>
        <div class="header-actions" v-if="multiple && !multipleLimit">
          <el-checkbox
            v-model="checkAll"
            :indeterminate="indeterminate"
            @change="handleCheckAll"
          >
            全选
          </el-checkbox>
          <span class="select-count"><span :class="{zero:!modelValue.length}">{{ modelValue.length }}</span>/{{ options.length }}</span>
        </div>
      </div>
    </template>
    <el-option
      v-for="item in filteredOptions"
      :key="getOptionKey(item)"
      :label="getOptionLabel(item)"
      :value="getOptionValue(item)"

    />
  </el-select>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  options: {
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
    default: ''
  },
  placement: {
    type: String,
    default: 'bottom-start'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  maxCollapseTags: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue', 'handleChange'])

const searchKeyword = ref('')
const checkAll = ref(false)
const indeterminate = ref(false)

const filteredOptions = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return props.options
  return props.options.filter(item => {
    if (typeof item === 'object') {
      const aa = item.label || item.name || item.userName
      return aa.toLowerCase().includes(keyword)
    } else {
      return item.toLowerCase().includes(keyword)
    }
  }
  )
})

watch(() => props.modelValue, (val) => {
  if (val.length === 0) {
    checkAll.value = false
    indeterminate.value = false
  } else if (val.length === props.options.length) {
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
    const allValues = props.options.map(item => getOptionKey(item))
    emit('update:modelValue', allValues)
    emit('handleChange', allValues)
  } else {
    emit('update:modelValue', [])
    emit('handleChange', [])
  }
}

const onUpdate = (val) => {
  emit('update:modelValue', val)
}
const searchInput = ref(null)
const onVisibleChange = (visible) => {
  if (!visible) {
    searchKeyword.value = ''
  }
  // 默认聚焦input
  if (visible) {
    setTimeout(() => {
      searchInput.value.focus()
    }, 0)
  }
}
const handleChange = (val) => {
  emit('handleChange', val)
}
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
</script>

<style scoped>
.disease-type-select {
  width: 100%;
}
.no-data-tip {
  padding: 10px;
  text-align: center;
  font-size: 13px;
  color: var(--theme-text-3);
}
</style>
<style lang="scss">
.disease-type-select-popper {
  .el-select-dropdown__header {
    box-sizing: border-box;
    padding: 12px 12px 0;
  }
  .select-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: -6px;
    padding-left: 8px;
  }
  .el-checkbox__label {
    padding-left: 11px;
    color: #3d3d3d;
  }
  .select-count {
    font-size: 14px;
    color: #3d3d3d;
    span {
      color: var(--theme-primary);
    }
  }
  // .el-select-dropdown__list {
  //   padding-top: 0;
  // }
}
.darkModePopper {
  .header-actions {
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
