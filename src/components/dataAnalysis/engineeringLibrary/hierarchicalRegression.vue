<template>
  <div class="variable-selection-area">
    <div class="mainTop">
      <div class="topLeft">
        <header class="header">全部变量</header>
        <div class="searchBox">
          <commonInput v-model="allSearch" placeholder="输入关键词，如姓名或工号" class="searchText" clearable @input="searchAll"/>
        </div>
        <el-scrollbar>
          <div class="ul" :class="rightData2.length === MULTICOUNT && rightData3.length === MULTICOUNT && rightData1.length === 1 ? 'disabledUl' : ''">
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledR="rightData2.length === MULTICOUNT && rightData3.length === MULTICOUNT"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :needVariableType="1" :isEnough="rightData1.length === 1"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :isEnough="rightData2.length === MULTICOUNT"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj3" @handleToRight="toCustomMultiRight(3)" @handleToLeft="toMultiLeft(3)" :isEnough="rightData3.length === MULTICOUNT"/>
      </div>
      <div class="topRight">
        <div class="right1 right-row-3">
          <header class="header">
            <span>定量变量y(=1)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)"/>
          </div>
        </div>
        <div class="right1 right-row-3">
          <header class="header multiColHeader">
            <div>
              <div>控制变量</div>
              <div>(定量or定性)(≥1)</div>
            </div>
            <div>
              <SvgIcon iconName="icon-zimu"></SvgIcon>
              <SvgIcon iconName="icon-shuzi"></SvgIcon>
            </div>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-3">
              <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element =>clickCustomMultiRight(2, element)" @handleEnd="onEndRight2"/>
            </div>
          </el-scrollbar>
        </div>
        <div class="right1 right-row-3">
          <header class="header multiColHeader">
            <div>
              <div>核心变量</div>
              <div>(定量or定性)(≥1)</div>
            </div>
            <div>
              <SvgIcon iconName="icon-zimu"></SvgIcon>
              <SvgIcon iconName="icon-shuzi"></SvgIcon>
            </div>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-3">
              <variableDraggable :list="rightData3" :group="groupRight3" :activeObj="rightActiveObj3" @handleClick="element =>clickCustomMultiRight(3, element)" @handleEnd="onEndRight3"/>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'hierarchicalRegression',
  inheritAttrs: false
})
import { ref, watch } from 'vue'
import { groupLeft, useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { ElMessage } from 'element-plus'
import { MULTICOUNT } from '@/components/dataAnalysis/utils/commonData'
import transferButton from '@/components/dataAnalysis/engineeringLibrary/common/transferButton.vue'
import variableDraggable from '@/components/dataAnalysis/engineeringLibrary/common/variableDraggable.vue'
const props = defineProps({
  engineeringInfo: {
    type: Object,
    required: true
  },
  currentNode: {
    type: Object,
    required: true
  },
  isAntdSix: {
    // 是否为流程管理
    type: Boolean,
    default: false
  },
  dataOperateId: {
    type: String,
    default: ''
  },
  jumpData: {
    type: Object
  }
})
const newDataOperateId = ref(props.dataOperateId)
const emits = defineEmits(['showLoading', 'getResultData', 'saveData'])
const allSearch = ref('')
const leftAllData = ref([])
const leftData = ref([])
const rightData1 = ref([])
const rightData2 = ref([])
const rightData3 = ref([])
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])
const rightActiveObj2 = ref([])
const rightActiveObj3 = ref([])
// 若回调成功，一定是跳转的
const handleJumpParams = () => {
  if (props.jumpData && props.jumpData.smallGroup === props.currentNode.name) {
    const inputConditions = JSON.parse(JSON.parse(props.jumpData.params).inputConditions)
    console.log('inputConditions', inputConditions)
    inputConditions.righData1V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
      toMultiRight(rightData2)
    })
    inputConditions.righData2V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
      toMultiRight(rightData2)
    })
    inputConditions.righData3V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
      toMultiRight(rightData3)
    })
  }
}
const { init, searchAll, clickMultiLeft, toMultiRight, toCommonMultiLeft, clickMultiRight, sendRequestNew } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj1)

init('', newDataOperateId.value, props.jumpData, handleJumpParams)

const groupRight1 = ref({
  name: 'groupA',
  put: () => {
    return rightData1.value.length < 1
  }
})
const groupRight2 = ref({
  name: 'groupA',
  put: () => {
    return rightData2.value.length < MULTICOUNT
  }
})
const groupRight3 = ref({
  name: 'groupA',
  put: () => {
    return rightData3.value.length < MULTICOUNT
  }
})
watch(() => rightData1.value, async (val) => {
  console.log('rightData1变化了')
  if (val.length === 1 && rightData2.value.length === MULTICOUNT) {
    leftActiveObj.value = []
  }
  // 处理拖拽后的rightActiveObj1
  if (rightActiveObj1.value.length > 0) {
    const arr = rightActiveObj1.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj1.value = arr
  }
}, { deep: true })

watch(() => rightData2.value, (val, oldVal) => {
  if (val.length === MULTICOUNT && rightData1.value.length === 1) {
    leftActiveObj.value = []
  } else if (val.length === MULTICOUNT) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty === 1)
  }
  // 处理拖拽后的rightActiveObj2
  if (rightActiveObj2.value.length > 0) {
    const arr = rightActiveObj2.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj2.value = arr
  }
}, { deep: true })

watch(() => rightData3.value, (val, oldVal) => {
  if (val.length === MULTICOUNT && rightData1.value.length === 1) {
    leftActiveObj.value = []
  } else if (val.length === MULTICOUNT) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty === 1)
  }
  // 处理拖拽后的rightActiveObj3
  if (rightActiveObj3.value.length > 0) {
    const arr = rightActiveObj3.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj3.value = arr
  }
}, { deep: true })

// 左侧变量有变化
const changeLeftData = (event) => {
  console.log('左侧变化了', event)
  if (event.added) {
    const changeItem = event.added.element
    // 判断leftAllData中是否存在changeItem，不存在则将changeItem加入leftAllData
    const index = leftAllData.value.findIndex(item => item.label === changeItem.label)
    if (index === -1) {
      const waitIndex = changeItem.index
      // 按顺序插入到左侧leftData
      if (leftAllData.value.length === 0) {
        leftAllData.value.push(changeItem)
      } else if (waitIndex < leftAllData.value[0].index) {
        leftAllData.value.splice(0, 0, changeItem)
      } else if (waitIndex > leftAllData.value[leftAllData.value.length - 1].index) {
        leftAllData.value.push(changeItem)
      } else {
        for (let i = 0; i < leftAllData.value.length - 1; i++) {
          if (leftAllData.value[i].index < waitIndex && leftAllData.value[i + 1].index > waitIndex) {
            leftAllData.value.splice(i + 1, 0, changeItem)
          }
        }
      }
    }
  } else if (event.removed) {
    if (rightData1.value.length === 1) {
      const obj = rightData1.value.find(item => item.dataProperty !== 1)
      if (obj) {
        ElMessage.warning('请选择定量变量')
        rightActiveObj1.value = [obj]
        toCommonMultiLeft(2, '', rightData1, rightActiveObj1)
        return false
      }
    }
    const changeItem = event.removed.element
    // 判断leftAllData中是否存在changeItem，存在则将changeItem从leftAllData中移除
    const index = leftAllData.value.findIndex(item => item.label === changeItem.label)
    if (index !== -1) {
      leftAllData.value.splice(index, 1)
    }
    // 如果leftActiveObj中存在changeItem，则将changeItem从leftActiveObj中移除
    if (leftActiveObj.value) {
      const objIndex = leftActiveObj.value.findIndex(d => d === changeItem)
      if (objIndex !== -1) {
        leftActiveObj.value.splice(objIndex, 1)
      }
    }
  }
  searchAll()
}
const onEndRight2 = () => {
  if (rightData1.value.length > 0) {
    const obj = rightData1.value.find(item => item.dataProperty !== 1)
    if (obj) {
      ElMessage.warning('请选择定量变量')
      rightData2.value.push(obj)
      rightData1.value = []
    }
  }
}
const onEndRight3 = () => {
  if (rightData1.value.length > 0) {
    const obj = rightData1.value.find(item => item.dataProperty !== 1)
    if (obj) {
      ElMessage.warning('请选择定量变量')
      rightData3.value.push(obj)
      rightData1.value = []
    }
  }
}
const clickCustomLeft = (item, multiType) => {
  if (rightData2.value.length < MULTICOUNT || rightData3.value.length < MULTICOUNT || (item.dataProperty !== 1 && rightData1.value.length < 1)) {
    clickMultiLeft(item, multiType)
  }
}
const clickCustomMultiRight = (value, item, multiType) => {
  if (value === 1) {
    clickMultiRight(item, multiType, rightActiveObj1)
  } else if (value === 2) {
    clickMultiRight(item, multiType, rightActiveObj2)
  } else if (value === 3) {
    clickMultiRight(item, multiType, rightActiveObj3)
  }
}
const toCustomMultiRight = (value) => {
  if (leftActiveObj.value.length > 0) {
    if (value === 1) {
      const SLength = leftActiveObj.value.filter(item => item.dataProperty !== 1)
      if (leftActiveObj.value.length > 1) {
        ElMessage.warning('请选择1个定量变量')
        return false
      } else if (SLength.length > 0) {
        ElMessage.warning('请选择定量变量')
        return false
      }
      if (leftActiveObj.value.length + rightData1.value.length < 2) {
        toMultiRight(rightData1)
      } else {
        ElMessage.warning(`请选择1个定量变量`)
      }
    } else if (value === 2) {
      if (leftActiveObj.value.length + rightData2.value.length < MULTICOUNT + 1) {
        toMultiRight(rightData2)
      } else {
        ElMessage.warning(`输入变量最多不能超过${MULTICOUNT}`)
      }
    } else if (value === 3) {
      if (leftActiveObj.value.length + rightData3.value.length < MULTICOUNT + 1) {
        toMultiRight(rightData3)
      } else {
        ElMessage.warning(`输入变量最多不能超过${MULTICOUNT}`)
      }
    }
  }
}
const toMultiLeft = (value) => {
  if (value === 1) {
    toCommonMultiLeft(value, '', rightData1, rightActiveObj1)
  } else if (value === 2) {
    toCommonMultiLeft(value, '', rightData2, rightActiveObj2)
  } else if (value === 3) {
    toCommonMultiLeft(value, '', rightData3, rightActiveObj3)
  }
}
// 开始分析
const beginAnalysis = async (outParams) => {
  if (!outParams) {
    if (rightData1.value.length === 0) {
      ElMessage.warning(`请选择定量变量`)
      return false
    }
    if (rightData2.value.length === 0) {
      ElMessage.warning(`请选择控制变量`)
      return false
    }
  }
  const controlVariable_S = []
  const stratifiedVariable_S = []
  const field = []
  if (!outParams) {
    const combinedData = [...rightData1.value, ...rightData2.value, ...rightData3.value]
    combinedData.forEach(item => {
      field.push({
        metric: item.label,
        metric_type: item.dataProperty
      })
    })
    rightData2.value.forEach(item => {
      controlVariable_S.push(item.label)
    })
    rightData3.value.forEach(item => {
      stratifiedVariable_S.push(item.label)
    })
  }
  const params = outParams || {
    dependentVar: rightData1.value[0].label,
    controlVariable: controlVariable_S,
    stratifiedVariable: stratifiedVariable_S,
    fieldList: field,
    inputConditions: JSON.stringify({
      righData1V: [rightData1.value[0].label],
      righData2V: controlVariable_S,
      righData3V: stratifiedVariable_S
    })
  }
  sendRequestNew(props.isAntdSix, props.currentNode, newDataOperateId, params, emits)
}
defineExpose({
  beginAnalysis
})
</script>
<style scoped lang="scss">
@use '@/style/common/variableSelection.scss';
.mainTop {
  height: 437px !important;
}
.ul-row-3 {
  min-height: 72px !important;
}
</style>
