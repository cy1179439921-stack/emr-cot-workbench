
<template>
  <div :class="{variableSelection:true,noBorder:loadingStatus}">
    <template v-if="!loadingStatus">
      <div class="searchContainer">
        <commonInput v-model="searchText" placeholder="输入关键词，如姓名或工号" class="searchInput" clearable></commonInput>
      </div>
      <el-scrollbar>
        <div class="dataContainer">
          <template v-if="!isBatch">
            <div v-for="(item,index) in dataList" :key="index" :id="item.colNumber" :class="{dataItem:true,actived:nameValueObj.label===item.label}" @click="handleClick(item)">
              <SvgIcon class="mlr6 svgIcon" :iconName="typeIconMap[item.dataProperty]"></SvgIcon>
              <div class="dataName showTip" v-show-tip v-if="showToolTip">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="item.label"
                  placement="bottom"
                  :open-delay="400"
                  :enterable="false"
                  :hide-after="0">
                  <div :style="{maxWidth: '100%'}" class="dataNameContent">{{ item.label}}</div>
                </el-tooltip>
              </div>
              <div class="dataName" v-if="!showToolTip">{{ item.label}}</div>
              <div class="tag" v-if="!item.nullFlag&&showTag">无空值</div>
              <div class="tag noValue" v-if="item.nullFlag&&showTag">有空值</div>
              <div class="tag warningTag" v-if="filteredList?.includes(item.colId)">当前选中</div>
              <div class="tag warningTag haveBeenScreened" v-if="!filteredList?.includes(item.colId) && uniSaveFilterList?.includes(item.colNumber)">已筛选</div>
              <div class="flex1"></div>
              <div :class="{dataText:true,S:item.dataProperty==1,N:item.dataProperty==0,E:item.dataProperty==2}" >{{ typeName[item.dataProperty] }}</div>
            </div>
          </template>
          <el-checkbox-group v-model="nameValueList" v-if="isBatch" @change="handleChangeCheck">
            <el-checkbox
              v-for="(item) in dataList"
              :disabled="(initType&&item?.dataProperty!==initType)||(sourceType==='空值处理'&&!item.nullFlag)||props.disabledTypeArr?.includes(item?.dataProperty)"
              :key="item.label"
              label=""
              :value="item.label"
              :class="{dataItem:true}"
            >
              <!-- ,actived:nameValueList.includes(item.label) -->
              <SvgIcon class="mlr6" :iconName="typeIconMap[item?.dataProperty]"></SvgIcon>
              <div class="dataName showTip" v-show-tip v-if="showToolTip">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="item.label"
                  placement="bottom"
                  :open-delay="400"
                  :enterable="false"
                  :hide-after="0">
                  <div :style="{maxWidth: '100%'}" class="dataNameContent">{{ item.label}}</div>
                </el-tooltip>
              </div>
              <div class="dataName" v-if="!showToolTip">{{ item.label}}</div>
              <div class="tag" v-if="!item.nullFlag&&showTag">无空值</div>
              <div class="tag noValue" v-if="item.nullFlag&&showTag">有空值</div>
              <div class="flex1"></div>
              <div :class="{dataText:true,S:item?.dataProperty==1,N:item?.dataProperty==0,E:item?.dataProperty==2}">{{ typeName[item?.dataProperty] }}</div>
            </el-checkbox>
          </el-checkbox-group>
          <div v-if="dataList.length===0" class="noData">这里还没有内容</div>
        </div>
      </el-scrollbar>
    </template>
    <template v-if="loadingStatus">
      <echartsEmpty></echartsEmpty>
    </template>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import lodash from 'lodash'
import { emitter } from '@/utils/bus'
import echartsEmpty from './echartsEmpty.vue'
const loadingStatus = ref(true)
emitter.on('closeLoading', () => {
  loadingStatus.value = false
})
const emits = defineEmits(['handleChange', 'clearSelection', 'choiceDataStyle'])
const props = defineProps({
  // 初始数据
  initDataList: {
    type: [Array],
    default: () => {
      return []
    }
  },
  colNumber: {
    type: [String, Number],
    default: ''
  },
  defaultArr: {
    type: Array,
    default: () => ([])
  },
  // 是否显示有无空值tag
  showTag: {
    type: Boolean,
    default: false
  },
  // 是否多选
  isBatch: {
    type: Boolean,
    default: false
  },
  // 不可选类型
  disabledTypeArr: {
    type: Array,
    default: () => {
      []
    }
  },
  // 当前选中项
  filteredList: {
    type: [Array],
    default: () => {
      []
    }
  },
  // 是否需要溢出隐藏...
  showToolTip: {
    type: Boolean,
    default: false
  },
  dataType: {
    type: String,
    default: ''
  },
  sourceType: {
    type: String,
    default: ''
  },
  uniSaveFilterList: {
    type: [Array],
    default: () => {
      []
    }
  },
  filterCodomainType: { // 过滤数据
    type: [Array],
    default: () => ([7]) // 7 复数
  }
})
// 类型图标
const typeIconMap = {
  0: 'icon-zimu',
  1: 'icon-shuzi',
  2: 'icon-qita'
}
const typeName = {
  0: '[定性]',
  1: '[定量]',
  2: '[其他]'

}
const searchText = ref('')
const nameValueObj = ref('')
const nameValueList = ref([])
const disabledTypeArrValue = ref(props.disabledTypeArr) // 禁用类型数组
const initType = ref('')
const handleChangeCheck = (obj) => {
  if (obj.length) {
    const initTypeObj = lodash.find(dataList.value, { label: obj[0] })
    initType.value = initTypeObj.dataProperty
  } else {
    initType.value = ''
  }
  emits('handleChange', obj)
}
const handleClick = (item) => {
  nameValueObj.value = item
  emits('handleChange', item, true)
}
const choiceDataStyle = (colNumber) => {
  const arr = lodash.filter(props.initDataList, { colNumber })
  if (arr?.length) {
    nameValueObj.value = arr[0]
    emits('handleChange', nameValueObj.value)
    filterData(false)
    nextTick(() => {
      const targetElement = document.getElementById(colNumber)
      targetElement?.scrollIntoView({ behavior: 'smooth' })
    })
  } else {
    filterData(true)
  }
}
const dataList = ref([])
onMounted(() => {
  // dataList.value = lodash.cloneDeep(props.initDataList)
})
// 数据筛选
const filterData = (init) => {
  switch (props.dataType) {
    case '1':
      // 异常值处理
      dataList.value = lodash.cloneDeep(props.initDataList.filter(it => Number(it.dataProperty) === 1))
      break
    case '2':
      // 生成变量
      dataList.value = lodash.cloneDeep(props.initDataList.filter(it => Number(it.dataProperty) !== 2))
      break
    default:
      dataList.value = lodash.cloneDeep(props.initDataList)
      break
  }

  dataList.value = dataList.value.filter(it => !props.filterCodomainType.includes(it.codomainType)) // 过滤数据

  if (dataList.value.length && init && !props.colNumber) {
    isInitData.value = false
    nameValueObj.value = dataList.value[0]
    emits('handleChange', nameValueObj.value)
  }
}

const clearSelection = () => {
  nameValueList.value = [] // 清空复选框选中状态
  initType.value = '' // 清空初始类型
  disabledTypeArrValue.value = []
  emits('clearSelection') // 向父组件发送清空事件通知
}
const isInitData = ref(true)
watch(() => props.initDataList, (val) => {
  filterData(isInitData.value)
  // colNumber 存在为0的情况
  if (props.colNumber || props.colNumber === 0) {
    choiceDataStyle(props.colNumber)
  }
  if (props.defaultArr.length) {
    nameValueList.value = props.defaultArr
    handleChangeCheck(nameValueList.value)
  }
  searchChangeFn()
}, {
  deep: true
})
watch(searchText, (val) => {
  filterData()
  searchChangeFn()
})
const searchChangeFn = () => {
  dataList.value = lodash.filter(dataList.value, v => {
    return v?.label.toLowerCase().includes(searchText.value.toLowerCase()) || v.judge_txt?.includes(searchText.value)
  })
}
defineExpose({
  clearSelection,
  choiceDataStyle
})
</script>
<style lang="scss" scoped>
.variableSelection {
  display: flex;
  position: relative;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  background: var(--theme-card);
  &.noBorder {
    border: none;
  }
  .searchContainer {
    // margin-bottom: 3px;
    // padding: 0 12px;
    // padding: 0 6px;
    border-bottom: 1px solid #e8e8e8;
  }
  .searchInput {
    width: 100%;
    height: 38px;
    :deep(.el-input__wrapper) {
      height: 38px;
      padding-left: 22px;
      box-shadow: none;
    }
  }
}
.mlr6 {
  width: 18px;
  height: auto;
  // height: 16px;
}
.dataContainer {
  flex: 1;
  .noData {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 205px;
    color: var(--theme-text-2);
  }
  .dataItem {
    display: flex;
    overflow: hidden;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    margin: 0;
    padding: 0 20px 0 19px;
    // border-radius: 2px;
    cursor: pointer;
    &:hover {
      background: rgba(54, 112, 248, 0.1);
    }
    &.actived {
      background: rgba(54, 112, 248, 0.1);
      .dataName,
      :deep(.dataNameContent) {
        color: var(--theme-primary) !important;
      }
    }
    &:last-child {
      margin-bottom: 16px;
    }
    .svgIcon {
      flex-shrink: 0;
    }
    .dataName {
      // flex: 1;
      margin: 0 8px;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text);
      &.showTip {
        overflow: hidden;
        // max-width: 80px;
        .dataNameContent {
          overflow: hidden;
          width: 100%;
          text-overflow: ellipsis;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text);
          word-break: break-all;
          white-space: nowrap;
        }
      }
    }
    .flex1 {
      flex: 1;
    }
    .tag {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      min-width: 52px;
      height: 22px;
      margin-right: 8px;
      border-radius: 2px 2px 2px 2px;
      // background: rgba(4, 162, 115, 0.05);
      background: var(--theme-success-soft);
      font-size: 12px;
      color: #04a273;
      white-space: nowrap;
      &.noValue {
        border-radius: 2px 2px 2px 2px;
        background: var(--theme-fill);
        font-size: 12px;
        color: #ff4e4e;
      }
      &.warningTag {
        padding: 0 8px;
        border: 1px solid var(--theme-primary);
        background: var(--theme-card);
        color: var(--theme-primary);
        &.haveBeenScreened {
          min-width: 0;
          border: 1px solid #f59f0c;
          color: #f59f0c;
        }
      }
    }
    .dataText {
      font-weight: 400;
      font-size: 12px;
      white-space: nowrap;
      &.S {
        color: var(--theme-primary);
      }
      &.N {
        color: #f59f0c;
      }
      &.E {
        color: #04a273;
      }
    }
    :deep(.el-checkbox__label) {
      display: block;
      display: flex;
      align-items: center;
      flex: 1;
      padding-left: 9px;
    }
  }
}
</style>
