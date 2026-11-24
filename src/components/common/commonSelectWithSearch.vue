<template>
  <el-select
    :model-value="modelValue"
    @update:modelValue="onUpdate"
    clearable
    :placeholder="placeholder"
    class="disease-type-select"
    :popper-class="popperClass"
    @visible-change="onVisibleChange"
    @change="handleChange"
    :placement="placement"
  >
    <template #header>
      <div class="search-input-container">
        <el-input
          ref="searchInput"
          v-model="searchKeyword"
          size="small"
          placeholder="请填写内容"
          clearable
        />
      </div>
    </template>
    <el-option
      v-for="item in filteredOptions"
      :key="item[prop.value]"
      :label="item[prop.label]"
      :value="item[prop.value]"
    />
  </el-select>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: [Number, String],
    default: ''
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
  prop: {
    type: Object,
    default: () => {
      return {
        label: 'name',
        vlaue: 'id'
      }
    }
  }
})
console.log('这啥', props.props)

const emit = defineEmits(['update:modelValue', 'handleChange'])

const searchKeyword = ref('')

const filteredOptions = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return props.options
  return props.options.filter(item =>
    item.name.toLowerCase().includes(keyword)
  )
})

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
