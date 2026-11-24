<template>
  <div class="allDateSelect">
    <!--  :prefix-icon="customPrefix" -->
    <el-date-picker
      v-if="currentDateType!=='yearrange'"
      size="small"
      ref="dataPickerDom"
      class="customDatePicker"
      :popper-class="popperClass"
      :disabled-date="disabledDate"
      :type="currentDateType"
      :style="{width: pxToRem(226),height: pxToRem(32)}"
      @change="handleChange"
      :shortcuts="shortcuts"
      @calendar-change="handleCalendarChange($event)"
      :clearable="clearable"
      v-model="currentDateVal"
      range-separator="-"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      value-format="YYYY-MM-DD"
    />
    <div v-if="currentDateType==='yearrange'" class="yearRange">
      <YearRange
        :popper-class="popperClass"
        :disabled-date="disabledDate"
        ref="dateYearDom"
        :clearable="clearable"
        :shortcuts="shortcuts"
        style="width: 100%;"
        :labelWidth = "50"
        v-model="currentDateVal"
        @updateTimeRange="handleChange"
      />
    </div>
  </div>
</template>
<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, nextTick, computed, watch, shallowRef, h } from 'vue'
// eslint-disable-next-line no-unused-vars
import lodash from 'lodash'
// eslint-disable-next-line no-unused-vars
import { formatStandardDate } from '@/utils/utils.js'
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  dateType: {
    type: String,
    default: 'monthrange' // yearrange年范围,monthrange月范围,daterange 日期范围
  },
  clearable: {
    type: Boolean,
    default: false
  },
  isDefaultTime: {
    type: Boolean,
    default: false
  },
  popperClass: {
    type: String,
    default: ''
  }
})
// const customPrefix = shallowRef({
//   render() {
//     return h('i', { class: 'iconfont icon-xialakuang-riqi' })
//   }
// })
const currentDateType = ref('yearrange')
const currentDateVal = ref([])
const dataPickerDom = ref(null)
const dateYearDom = ref(null)
const init = () => {
  currentDateVal.value = props.modelValue
  currentDateType.value = props.dateType
}
init()

const getDefaultTime = (type) => {
  if (!props.isDefaultTime) {
    currentDateVal.value = []
    return []
  }
  if (type === 'monthrange') {
    const end = new Date()
    end.setDate(1)
    const start = new Date(end)
    // 默认近12个月
    start.setMonth(end.getMonth() - 11)
    return [formatStandardDate(start), formatStandardDate(end)]
  } else if (type === 'yearrange') {
    const year = new Date().getFullYear()
    return [year - 6 + '', year + '']
  } else {
    const end = new Date()
    const start = new Date().getTime() - 3600 * 1000 * 24 * 6
    return [formatStandardDate(start), formatStandardDate(end)]
  }
}

// eslint-disable-next-line no-unused-vars
const emit = defineEmits([
  'update:modelValue',
  'update:dateType',
  'change'
])
const updateValue = () => {
  emit('update:dateType', currentDateType.value)
  emit('update:modelValue', currentDateVal.value)
  emit('change', currentDateVal.value)
}

const handelOpen = (type) => {
  if (currentDateType.value === type) {
    return
  }
  currentDateType.value = type
  if (props.isDefaultTime) {
    currentDateVal.value = getDefaultTime(type)
  } else {
    currentDateVal.value = []
  }

  nextTick(() => {
    if (type === 'yearrange') {
      dateYearDom.value.handleOpen(getDefaultTime('yearrange'))
    } else {
      dataPickerDom.value.handleOpen()
    }
    updateValue()
  })
}
const shortcuts = ref([
  {
    text: '年',
    value: () => {
      handelOpen('yearrange')
      // currentDateVal.value = getDefaultTime('yearrange')
      // return currentDateVal.value
    }
  },
  {
    text: '月',
    value: () => {
      handelOpen('monthrange')
      // currentDateVal.value = getDefaultTime('monthrange')
      // return currentDateVal.value
    }
  },
  {
    text: '日',
    value: () => {
      handelOpen('daterange')
      // currentDateVal.value = getDefaultTime()
      // return currentDateVal.value
    }
  }
])
// eslint-disable-next-line no-unused-vars
const _modeValue = computed({
  get() {
    return props.modelValue || []
  },
  set(value) {
    emit('update:dateType', currentDateVal.value)
    emit('update:modelValue', currentDateVal.value)
  }
})
const getLastDayOfMonth = (year, month) => {
  const lastDay = new Date(year, month, 0).getDate()
  return lastDay
}
const handleChange = (val) => {
  if (currentDateType.value === 'monthrange' && currentDateVal.value?.length) {
    const arr = currentDateVal.value[1].split('-')
    currentDateVal.value[1] = arr[0] + '-' + arr[1] + '-' + getLastDayOfMonth(arr[0], arr[1])
  }
  if (JSON.stringify(val) !== JSON.stringify(props.modelValue)) {
    updateValue()
  }
}

const chooseDay = ref('')
const handleCalendarChange = ($event) => {
  chooseDay.value = $event[0]
  const minDate = $event[0]
  const maxDate = $event[1]
  // 把选择的第一个日期赋值给一个变量。
  chooseDay.value = minDate.getTime()
  // 如何你选择了两个日期了，就把那个变量置空
  if (maxDate) chooseDay.value = null
}
const disabledDate = (time) => {
  const type = currentDateType.value
  if (type === 'monthrange') {
    // 选择维度为月
    if (chooseDay.value) {
      // 选择了一个月份 ,限制最多选择30个月
      const num = 29 * 30 * 24 * 3600 * 1000
      const minTime = chooseDay.value - num
      const maxTime = chooseDay.value - 0 + num
      return (time.getTime() > Date.now() || (time.getTime() > maxTime || time.getTime() < minTime))
    } else {
      return time.getTime() > Date.now() // 如果没有选择日期，就要限制不能选择还没到的日期
    }
  } else {
    // 选择维度为日
    if (chooseDay.value) { // 如何选择了一个日期
      const one = 0 * 24 * 3600 * 1000 // n天的时间戳
      const minTime = chooseDay.value - one // 当前日期 - one = n天之前
      const maxTime = chooseDay.value - 0 + one // 当前日期 + one = n天之后(必须-0，不然不会变成数字时间戳格式)
      const two = 30 * 24 * 3600 * 1000
      const minTime2 = chooseDay.value - two // 当前日期 - one = n天之前
      const maxTime2 = chooseDay.value - 0 + two // 当前日期 + one = n天之后(必须-0，不然不会变成数字时间戳格式)
      return (
        (time.getTime() > minTime && time.getTime() < maxTime) || (time.getTime() < minTime2 || time.getTime() > maxTime2) || time.getTime() > Date.now()
      )
    } else {
      return time.getTime() > Date.now() // 如果没有选择日期，就要限制不能选择还没到的日期
    }
  }
}
watch(() => props.modelValue,
  (newVal, oldVal) => {
    if (!newVal || !newVal.length) {
      currentDateVal.value = []
    } else {
      currentDateVal.value = newVal
    }
  },
  {
    deep: true,
    immediate: true
  })

watch(() => props.dateType,
  (newVal) => {
    chooseDay.value = ''
    currentDateType.value = newVal
  }
)
</script>
<style lang="scss" scoped>
.allDateSelect {
  width: 100%;
  height: 100%;
  :deep(.customDatePicker) {
    box-sizing: border-box;
    width: calc(100% - 2px);
  }
  .yearRange {
    width: 100%;
    height: 100%;
  }
}
</style>
