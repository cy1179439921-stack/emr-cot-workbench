<template>
  <div class="yearPicker" :ref="yearPicker" >
    <el-popover
      ref="popover"
      placement="bottom"
      :visible="data.showPanel"
      width="auto"
      :popper-class="popperClass?(`${popperClass} custom_year_range`):'custom_year_range'"
    >
      <div class="_inner floatPanel" v-click-outside="
        () => {
          data.showPanel = false
        }
      ">
        <!-- v-if="data.showPanel" -->
        <div class="fastContaienr">
          <div
            v-for="(item,index) in shortcuts"
            :key="index"
            @click="handleFast(item)"
          >
            {{ item.text }}
          </div>
          <!-- <div  @click="handel">年</div>
          <div>月</div>
          <div>日</div> -->
        </div>
        <div class="_inner leftPanel">
          <div class="_inner panelHead">
            <!-- <i class="_inner" @click="onClickLeft">&lt;&lt;</i> -->
            <el-icon @click="onClickLeft"><DArrowLeft /></el-icon>
            {{ leftYearList[0] + '-' + leftYearList[9] }}
          </div>
          <div class="_inner panelContent">
            <div
              :class="{
                disabled: checkValidYear(item),
                oneSelected: item === (data.startYear-0) && oneSelected,
                startSelected: item === (data.startYear-0),
                endSelected: item === (data.endYear-0),
                _inner: true,
                betweenSelected: item > (data.startYear-0) && item < (data.endYear-0),
              }"
              v-for="item in leftYearList"
              :key="item"
            >
              <a
                :class="{
                  cell: true,
                  _inner: true,
                  selected: item === (data.startYear-0) || item === (data.endYear-0),
                }"
                @click="onClickItem(item)"
                @mouseover="onHoverItem(item)"
              >
                {{ item }}
              </a>
            </div>
          </div>
        </div>
        <div class="_inner rightPanel">
          <div class="_inner panelHead">
            <!-- <i class="_inner" @click="onClickRight">&gt;&gt;</i> -->
            <el-icon @click="onClickRight"><DArrowRight /></el-icon>
            {{ rightYearList[0] + '-' + rightYearList[9] }}
          </div>
          <div class="_inner panelContent">
            <div
              :class="{
                disabled: checkValidYear(item),
                startSelected: item === (data.startYear-0),
                endSelected: item === (data.endYear-0),
                betweenSelected: item > (data.startYear-0) && item < (data.endYear-0),
              }"
              v-for="item in rightYearList"
              :key="item"
            >
              <a
                :class="{
                  cell: true,
                  _inner: true,
                  selected: item === (data.endYear-0) || item === (data.startYear-0),
                }"
                @click="onClickItem(item)"
                @mouseover="onHoverItem(item)"
              >
                {{ item }}
              </a>
            </div>
          </div>
        </div>
      </div>
      <template #reference>
        <div class="yearRangeShow">
          <!-- <el-icon class="calendarIcon"><Calendar /></el-icon> -->
          <i class="iconfont icon-xialakuang-riqi calendarIcon"></i>
          <el-input
            class="_inner yearShow"
            :ref="inputLeft"
            v-model="data.startShowYear"
            @click="clickInput"
            @focus="onFocus"
            type="text"
            name="yearInput"
            @input="checkStartInput()"
            :placeholder="startPlaceholder"
          >
          </el-input>
          <span>{{ props.sp }}</span>
          <el-input
            class="_inner yearShow"
            :ref="inputRight"
            v-model="data.endShowYear"
            @click="clickInput"
            @focus="onFocus"
            type="text"
            name="yearInput"
            @input="checkEndInput()"
            :placeholder="endPlaceholder"
          >
          </el-input>
          <div class="clearDomContainer">
            <el-icon
              @click="handleClear"
              v-if="clearable&&(data.endYear||data.startYear)"
              class="clearDom"><Close /></el-icon>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup >
import {
  computed,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { clickoutside } from '@/utils/utils'
const vClickOutside = clickoutside

const SELECT_STATE = {
  unselect: 0,
  selecting: 1,
  selected: 2
}

const data = reactive({
  itemBg: {},
  startShowYear: null,
  endShowYear: null,
  yearList: [],
  showPanel: false,
  startYear: null,
  endYear: null,
  curYear: 0,
  curSelectedYear: 0,
  curState: SELECT_STATE.unselect
})

const yearPicker = ref()
const inputLeft = ref()
const inputRight = ref()

const oneSelected = computed(() => {
  return (
    data.curState === SELECT_STATE.selecting &&
    (data.startYear === data.endYear || data.endYear == null)
  )
})

const leftYearList = computed(() => {
  return data.yearList.slice(0, 10)
})
const rightYearList = computed(() => {
  return data.yearList.slice(10, 20)
})

const emits = defineEmits(['updateTimeRange', 'update:modelValue', 'visibleChange'])
const handleFast = (item) => {
  item.value()
}
const handleOpen = (value) => {
  data.startYear = value[0] || ''
  data.endYear = value[1] || ''
  data.startShowYear = data.startYear
  data.endShowYear = data.endYear
  if (data.startYear && data.endYear) {
    emits('update:modelValue', [data.startYear + '-01-01', data.endYear + '-12-31'])
  } else {
    emits('update:modelValue', [])
  }
  setTimeout(() => {
    data.showPanel = true
  })
}
const props = defineProps({
  labelWidth: {
    type: Number,
    default: 80
  },
  labelText: {
    type: String,
    default: '时间标签'
  },
  sp: {
    type: String,
    default: '-'
  },
  shortcuts: {
    type: Array,
    default: () => {
      return []
    }
  },
  disabledDate: {
    type: Function,
    default: () => {
      return () => {}
    }
  },
  modelValue: {
    type: Array,
    default: () => {
      return []
    }
  },
  clearable: {
    type: Boolean,
    default: false
  },
  popperClass: {
    type: String,
    default: ''
  },
  isLimitYear: {
    type: Boolean,
    default: false
  },
  startPlaceholder: {
    type: String,
    default: '开始年份'
  },
  endPlaceholder: {
    type: String,
    default: '结束年份'
  }
})

const clickInput = (e) => {
  data.showPanel = true
  e.stopPropagation()
  return false
}

const checkValidYear = (iYear) => {
  if (props.isLimitYear) {
    return iYear > new Date().getFullYear() || iYear < 1900 || 0
  } else {
    if (data.curSelectedYear) {
    // 选择了第一个年份,限制最长选择20年
      const maxYear = data.curSelectedYear + 19
      const minYear = data.curSelectedYear - 19
      return iYear > new Date().getFullYear() || (iYear > maxYear || iYear < minYear) || 0
    } else {
    // 超过当前年的不允许选择
      return iYear > new Date().getFullYear() || iYear < 1900 || 0
    }
  }
}
const checkStartInput = () => {
  if (isNaN(data.startShowYear)) {
    data.startShowYear = data.startYear
  } else {
    data.startYear = data.startShowYear * 1
  }
}

const checkEndInput = () => {
  if (isNaN(data.endShowYear)) {
    data.endShowYear = data.endYear
  } else {
    data.endYear = data.endShowYear * 1
  }
}
const changeYear = () => {
  if (data.startYear > data.endYear) {
    const tmp = data.endYear
    data.endYear = data.startYear
    data.startYear = tmp
  }
  if (props.initYear) {
    data.startYear = Math.max(data.startYear, props.initYear.startYear)
    data.endYear = Math.min(data.endYear, props.initYear.endYear)
  }
  data.startShowYear = data.startYear
  data.endShowYear = data.endYear
  if (data.startYear && data.endYear) {
    emits('update:modelValue', [data.startYear + '-01-01', data.endYear + '-12-31'])
    emits('updateTimeRange', data.startYear, data.endYear)
    setTimeout(() => {
      // 为动画留的时间，可优化
      data.showPanel = false
    }, 300)
  } else {
    console.warn('WARN:年份不合法', data.startYear, data.endYear)
  }
}
const onHoverItem = (iYear) => {
  if (checkValidYear(iYear) !== 0) {
    return
  }
  if (data.curState === SELECT_STATE.selecting) {
    const tmpStart = data.curSelectedYear
    data.endYear = Math.max(tmpStart, iYear)
    data.startYear = Math.min(tmpStart, iYear)
  }
}
const onClickItem = (iYear) => {
  if (checkValidYear(iYear) !== 0) {
    return
  }
  if (
    data.curState === SELECT_STATE.unselect ||
    data.curState === SELECT_STATE.selected
  ) {
    data.startYear = iYear
    data.curSelectedYear = iYear
    data.endYear = null
    data.curState = SELECT_STATE.selecting
  } else if (data.curState === SELECT_STATE.selecting) {
    if (!data.endYear) {
      data.endYear = data.startYear
    }
    data.endShowYear = data.endYear
    data.startShowYear = data.startYear
    data.curState = SELECT_STATE.selected
    if (data.startYear && data.endYear) {
      emits('update:modelValue', [data.startYear + '-01-01', data.endYear + '-12-31'])
    } else {
      emits('update:modelValue', [])
    }

    emits('updateTimeRange')
    setTimeout(() => {
      // 为动画留的时间，可优化
      data.showPanel = false
    }, 300)
  }
}
const onFocus = () => {
  emits('visibleChange')
// nextTick(() => {
//   console.log('focus')
//   data.showPanel = true
// })
}

const updateYearList = () => {
  let iStart = Math.floor(data.curYear / 10) * 10 - 10
  iStart = iStart < 0 ? 0 : iStart
  data.yearList = []
  for (let index = 0; index < 20; index++) {
    data.yearList.push(iStart + index)
  }
}
// eslint-disable-next-line no-unused-vars
const closePanel = (e) => {
  if (!data.showPanel) {
    return
  }
  if (typeof e.target.className !== 'string' || e.target.className === '') {
    nextTick(() => {
      changeYear()
      data.showPanel = false
    })
    return
  }

  if (
    e.target.className.indexOf('_inner') === -1 ||
    (e.target.name === 'yearInput' &&
      e.target !== inputLeft.value &&
      e.target !== inputRight.value)
  ) {
    nextTick(() => {
      changeYear()
      data.showPanel = false
    })
  }

  e.stopPropagation()
  return false
}
const onClickLeft = () => {
  data.curYear = data.curYear * 1 - 10
  updateYearList()
}
const onClickRight = () => {
  data.curYear = data.curYear * 1 + 10
  updateYearList()
}
const handleClear = () => {
  data.startYear = ''
  data.endYear = ''
  data.startShowYear = ''
  data.endShowYear = ''
  emits('update:modelValue', [])
  emits('updateTimeRange')
}
onBeforeMount(() => {
  data.curYear = new Date().getFullYear()
  updateYearList()
})
onBeforeUnmount(() => {
  // document.removeEventListener('click', closePanel.bind(data))
})

onMounted(() => {
  // document.addEventListener('click', closePanel.bind(data))
})
watch(() => props.modelValue,
  (newVal, oldVal) => {
    if (!newVal || newVal.length !== 2) {
      data.startYear = ''
      data.endYear = ''
      data.startShowYear = ''
      data.endShowYear = ''
    } else if (newVal.length === 2) {
      data.startYear = newVal[0].slice(0, 4) || ''
      data.endYear = newVal[1].slice(0, 4) || ''
      data.startShowYear = data.startYear
      data.endShowYear = data.endYear
    }
  },
  {
    deep: true,
    immediate: true
  })
defineExpose({ handleOpen })
</script>
<style lang="scss" scoped>
.yearPicker {
  display: flex;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 24px;
  padding: 0 16px;
  // border: 1px solid #eff1f3;
  border-radius: 2px;
  // background-color: var(--theme-card);
  line-height: 24px;
  font-size: 14px;
  transition: all 0.3s;
  &:hover {
    .clearDom {
      display: block;
    }
  }
  .clearDom {
    display: none;
  }
  .clearDomContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 100%;
  }
  input:first-child {
    text-align: right;
  }

  span {
    height: 22px;
    padding: 0 5px;
    line-height: 22px;
  }
}
input {
  box-sizing: border-box;
  width: 60px;
  height: 32px;
  border: none;
  background-color: transparent;
  line-height: 32px;
  text-align: center;
}

input:focus {
  outline: none;
  background-color: transparent;
}
.yearRangeShow {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  .calendarIcon {
    margin-right: 5px;
    color: #a8abb2;
  }
  // background-color: rgba(0, 0, 0, 0.5);
  :deep(.yearShow) {
    width: calc(50% - 10px);
    text-align: center;
    .el-input__inner {
      padding-left: 0;
      padding-right: 0;
      text-align: center;
    }
    .el-input__wrapper {
      padding: 0 !important;
      background-color: transparent;
      box-shadow: none;
    }
  }
}
.yearPicker {
  height: 100%;
  box-shadow: 0 0 0 1px #d8d8d8;
}

.dateIcon {
  position: absolute;
  right: 16px;
  top: 9px;
  color: #adb2bc;
}
</style>
<style lang="scss">
.custom_year_range {
  &::before,
  &::after {
    position: absolute;
    left: 110px;
    top: 0;
    width: 1px;
    height: 100%;
    border-left: 1px solid #e4e4e4;
    content: '';
  }
  &::after {
    left: 433px;
    top: 0;
  }
  .floatPanel {
    display: flex;
    // position: absolute;
    // left: -50px;
    top: 40px;
    z-index: 2000;
    width: 756px;
    height: 250px;
    border-radius: 4px;
    background-color: var(--theme-card);
    // box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    .fastContaienr {
      display: flex;
      flex-direction: column;
      // position: absolute;
      // left: -110px;
      width: 110px;
      >div {
        height: 30px;
        cursor: pointer;
        font-size: 14px;
      }
    }
    .leftPanel,
    .rightPanel {
      width: 323px;
    }
    .panelContent {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      height: calc(100% - 70px);

      .disabled {
        color: #ccc;
      }

      .oneSelected {
        border-top-right-radius: 24px;
        border-bottom-right-radius: 24px;
      }

      .startSelected {
        border-top-left-radius: 24px;
        border-bottom-left-radius: 24px;
        background-color: rgba(54, 112, 248, 0.1);
      }

      .endSelected {
        border-top-right-radius: 24px;
        border-bottom-right-radius: 24px;
        background-color: rgba(54, 112, 248, 0.1);
      }

      .betweenSelected {
        background-color: rgba(54, 112, 248, 0.1);
      }

      > div {
        width: 75px;
        height: 48px;
        margin: 3px 0;
        line-height: 48px;
        // border-radius: 24px;
        text-align: center;

        a {
          display: inline-block;
          width: 60px;
          height: 36px;
          border-radius: 18px;
          cursor: pointer;
          line-height: 36px;
        }

        .selected {
          background-color: var(--theme-primary);
          color: #fff;
        }
      }
    }

    .panelHead {
      display: flex;
      position: relative;
      justify-content: center;
      align-items: center;
      height: 46px;
      line-height: 46px;
      text-align: center;
      font-weight: 500;
      font-size: 16px;
      i {
        position: absolute;
        cursor: pointer;
        font-size: 12px;
        &:hover {
          color: #3e77fc;
        }
      }
    }

    .rightPanel {
      padding-left: 8px;
    }

    .leftPanel .panelHead i {
      left: 20px;
    }

    .rightPanel .panelHead i {
      right: 20px;
    }
  }
}
.custom_year_range.darkModePopper {
  .floatPanel {
    background: transparent;
    .panelContent > div a,
    .panelHead,
    .fastContaienr div {
      color: #fff;
    }
    .disabled {
      .cell {
        background-color: #2a304a;
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}
</style>
