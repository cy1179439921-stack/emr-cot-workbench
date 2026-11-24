<template>
  <el-select-v2
    :model-value="modelValue"
    @update:modelValue="onUpdate"
    :multiple="multiple"
    :multiple-limit="multipleLimit"
    collapse-tags
    collapse-tags-tooltip
    clearable
    :placeholder="placeholder"
    :options="filteredOptions"
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
          @input="handleChangeKeyword"
          placeholder="请填写内容"
          clearable
        />
      </div>
    </template>
    <template #default="{ item }">
      <div class="selectV2Item" v-show-tip v-if="item.label.toLowerCase().includes(searchKeyword)||!searchKeyword">
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="item.label"
          placement="bottom"
          :open-delay="400"
          :enterable="false"
          :hide-after="0"
        >
          <div class="selectV2Label">{{ item.label}}</div>
        </el-tooltip>
      </div>
    </template>
  </el-select-v2>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, computed } from 'vue'

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
  }
})

const emit = defineEmits(['update:modelValue', 'handleChange'])

const searchKeyword = ref('')

// const filteredOptions = computed(() => {
//   console.log('这里触发吗')
//   const keyword = searchKeyword.value.trim().toLowerCase()
//   if (!keyword) return props.options
//   return props.options.filter(item =>
//     item.label.toLowerCase().includes(keyword)
//   )
// })
const onUpdate = (val) => {
  console.log('啥情况', val)
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
      // searchInput.value.focus()
    }, 0)
  }
}
const filteredOptions = ref(props.options)
const handleChangeKeyword = () => {
  // handleFilter()
}
// const handleFilter = (query) => {
//   // 实现你的过滤逻辑，例如过滤 options 中的数据
//   //   console.log('这里触发吗')
//   const keyword = searchKeyword.value.trim().toLowerCase()
//   if (!keyword) {
//     filteredOptions.value = props.options
//   } else {
//     filteredOptions.value = props.options.filter(item =>
//       item.label.toLowerCase().includes(keyword)
//     )
//   }
// }
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
