<template>
  <el-select-v2
    class="operation-code-select"
    :multiple="isMultiple"
    collapse-tags
    :item-height="echartsToPx(34)"
    :options="filteredOptions"
    v-model="localValue"
    placeholder="请选择一项"
    no-data-text="这里还没有内容"
    :props="propsOption"
    allow-create
    default-first-option
    filterable
    :collapse-tags-tooltip="true"
    @change="handleChange"
    @visible-change="clearSearch"
    :loading="isLoading"
    loading-text="加载中..."
    :popperClass="['operationSelectPopper',props.popperClass].join(' ')"
  >
    <!-- :max-collapse-tags="50" -->
    <template #header>
      <el-input placeholder="搜索名称" v-model="searchKeyword" clearable @input="filterOptions" />
    </template>
    <template #label="{ value }">
      <span class="ellipsis" :title="value">{{ value }}</span>
    </template>
    <!-- <template #default="{ item }">
      <el-tooltip effect="dark" :content="item[props.labelFileds]" placement="bottom">
        <span class="ellipsis"> {{ item[props.labelFileds] }} </span>
      </el-tooltip>
    </template> -->
    <template #default="{ item }">
      <!-- <div ref="itemContent" class="item-content">
        <span class="ellipsis"> {{ item[props.labelFileds] }} </span>
      </div> -->
      <el-tooltip :key="isDisabledTooltip ? 'tooltip-disabled' : 'tooltip-enabled'" :disabled="isDisabledTooltip" effect="dark" :content="item[props.labelFileds]" placement="bottom">
        <p class="operation-box-p" @mouseover="isDisabledTooltip = true" @click="emit('change', item[props.valueFileds])">
          <span @mouseover.stop="onMouseOver">{{item[props.labelFileds]}}</span>
        </p>
      </el-tooltip>
    </template>
  </el-select-v2>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { getOperationCodeList } from '@/api/jiancanAPI/api_home'
import { ElMessage } from 'element-plus'
import { echartsToPx } from '@/utils/utils'
const props = defineProps({
  modelValue: {
    type: [Array, String],
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  isOperationCodeListLoaded: {
    type: Boolean,
    default: false
  },
  valueFileds: {
    type: String,
    default: 'code'
  },
  labelFileds: {
    type: String,
    default: 'label'
  },
  useCustomSelectionItems: { // 是否使用自定义选择项
    type: Boolean,
    default: false
  },
  options: { // 自定义选择项
    type: Array,
    default: () => ([])
  },
  popperClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const isMultiple = ref(props.multiple)
const isLoading = ref(true)

const searchKeyword = ref('')
const filteredOptions = ref([])
const getOperationCodeArr = ref([])

const localValue = ref(props.modelValue)

const propsOption = {
  value: props.valueFileds,
  label: props.labelFileds
}

const handleChange = (selected) => {
  // 判断selected是字符串还是数组（区分是否是多选），如果是数组，长度不能超过50
  if (selected && Array.isArray(selected) && selected.length > 50) {
    localValue.value = localValue.value.slice(0, 50) // 限制最多选 50 个，已经选满了
    ElMessage.error('最多选 50 个，已经选满了')
  } else {
    emit('update:modelValue', selected)
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const getOperationCodeListData = async () => {
  let arr = []
  if (props.useCustomSelectionItems) {
    arr = props?.options || []
    getOperationCodeArr.value = arr.map(item => ({
      label: item.code + '（' + item.name + '）',
      code: item.code,
      name: item.name
    }))
  } else {
    const params = {
      pageNum: 1,
      pageSize: 50000
    }
    const res = await getOperationCodeList(params)
    arr = res.data?.items || []
    getOperationCodeArr.value = arr.map(item => ({
      label: item.code + '（' + item.name + '）',
      code: item.code,
      name: item.name
    }))
    filterOptions()
  }
}

const filterOptions = () => {
  // isLoading.value = true
  const keyword = searchKeyword.value.toLowerCase()
  filteredOptions.value = getOperationCodeArr.value.filter(item =>
    item[props.labelFileds].toLowerCase().includes(keyword)
  )
  isLoading.value = false
}

watch(searchKeyword, filterOptions)
// 病历库采集用
watch(() => props.isOperationCodeListLoaded, (newVal) => {
  if (newVal) {
    getOperationCodeListData()
  }
}, { immediate: true })
// table表格内用
watch(() => props.options, () => {
  getOperationCodeListData()
  filterOptions()
})
onMounted(() => {
  if (props.options.length) {
    getOperationCodeListData()
    filterOptions()
  }
})

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue)
})
const isDisabledTooltip = ref(true)

const onMouseOver = async (event) => {
  const contentWidth = event.target.offsetWidth
  const parentWidth = document.querySelector('.operation-box-p').offsetWidth
  isDisabledTooltip.value = !(contentWidth > parentWidth)
  // console.log(contentWidth, parentWidth, isDisabledTooltip.value)
}
</script>

<style lang="scss" scoped>
/* Add any specific styles here */
.operation-box-p {
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.operation-code-select {
  :deep(.el-select__suffix) {
    .el-icon {
      font-size: 6px;
      &::before {
        font-family: "iconfont" !important;
        font-style: normal;
        content: "\e673";
        -webkit-font-smoothing: antialiased;
      }
      svg {
        display: none;
      }
    }
  }
  .ellipsis {
    display: block;
  }
  :deep(.el-input__validateIcon) {
    display: none !important;
  }
}
</style>
<style lang="scss">
.operationSelectPopper {
  .el-select-dropdown__item {
    height: 34px !important;
  }
  .el-select-dropdown__header {
    border-bottom: none;
  }
}
</style>
