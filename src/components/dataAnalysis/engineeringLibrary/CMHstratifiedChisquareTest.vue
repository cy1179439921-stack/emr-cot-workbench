<template>
  <div class="variable-selection-area">
    <div class="mainTop">
      <div class="topLeft">
        <header class="header">全部变量</header>
        <div class="searchBox">
          <commonInput v-model="allSearch" placeholder="输入关键词，如姓名或工号" class="searchText" clearable @input="searchAll"/>
        </div>
        <el-scrollbar>
          <div class="ul">
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledR="rightData1.length === 1 && rightData2.length === 2"/>
          </div>
        </el-scrollbar>

      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :isEnough="rightData1.length === 1" />
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :isEnough="rightData2.length === 2"/>
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>分层变量(=1)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element => clickCustomMultiRight(1, element)" @handleEnd="onEndRight1"></variableDraggable>
          </div>
        </div>
        <div class="right1">
          <header class="header">
            <span>二分类变量(=2)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element => clickCustomMultiRight(2, element)" @handleEnd="onEndRight2" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'CMHstratifiedChisquareTest',
  inheritAttrs: false
})
import { ref, watch } from 'vue'
import { groupLeft, useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { ElMessage } from 'element-plus'
import { batchCheckBinaryVariable } from '@/api/api_dataAnalysis.js'
import transferButton from '@/components/dataAnalysis/engineeringLibrary/common/transferButton.vue'
import variableDraggable from '@/components/dataAnalysis/engineeringLibrary/common/variableDraggable.vue'
const props = defineProps({
  engineeringInfo: {
    type: Object
  },
  currentNode: {
    type: Object
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
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])
const rightActiveObj2 = ref([])
// 若回调成功，一定是跳转的
const handleJumpParams = () => {
  if (props.jumpData && props.jumpData.smallGroup === props.currentNode.name) {
    const inputConditions = JSON.parse(JSON.parse(props.jumpData.params).input_conditions)
    inputConditions.righData1V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
      toMultiRight(rightData1)
    })
    inputConditions.righData2V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
      toMultiRight(rightData2)
    })
  }
}
const { init, searchAll, clickMultiLeft, toMultiRight, clickMultiRight, toCommonMultiLeft, sendRequest } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj1)

init('定性', newDataOperateId.value, props.jumpData, handleJumpParams)

const groupRight1 = ref({
  name: 'groupA',
  put: () => { // 限制数量
    return rightData1.value.length < 1
  }
})
const groupRight2 = ref({
  name: 'groupA',
  put: () => {
    return rightData2.value.length < 2
  }
})
watch(() => rightData1.value, (val) => {
  if (val.length === 1 && (rightData2.value.length === 2)) {
    leftActiveObj.value = []
  }
  // 处理拖拽后的rightActiveObj1
  if (rightActiveObj1.value.length > 0) {
    const arr = rightActiveObj1.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj1.value = arr
  }
}, { deep: true })
watch(() => JSON.parse(JSON.stringify(rightData2.value)), async (nVal, oVal) => {
  console.log('nVal', nVal)
  console.log('oVal', oVal)
  // 找到新增的项
  if (nVal.length > oVal.length) {
    const addedItems = nVal.filter(newItem => !oVal.some(oldItem => oldItem.label === newItem.label))
    console.log('新增:', addedItems)
    const labelsArray = addedItems.map(item => item.label)
    console.log('labelsArray:', labelsArray)
    const { code, data } = await batchCheckBinaryVariable({
      dataOperateId: newDataOperateId.value,
      fieldNameList: labelsArray
    })
    if (code === 10000) {
      if (data.fieldNameList.length > 0) {
        const fieldNameList = data.fieldNameList.join('、')
        ElMessage.warning(fieldNameList + '不符合二分类变量')
        data.fieldNameList.forEach(name => {
          const findObj = nVal.find(i => i.label === name)
          if (findObj) {
            rightActiveObj2.value.push(findObj)
          }
        })
        toCommonMultiLeft(2, '', rightData2, rightActiveObj2)
        return false
      }
    }
  }
  if (nVal.length === 2 && rightData1.value.length === 1) {
    leftActiveObj.value = []
  }
  // 处理拖拽后的rightActiveObj2
  if (rightActiveObj2.value.length > 0) {
    const arr = rightActiveObj2.value.filter(item => nVal.some(d => d.label === item.label))
    rightActiveObj2.value = arr
  }
}, { deep: true })
// 左侧变量有变化
const changeLeftData = (event) => {
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
      const obj = rightData1.value.find(item => item.dataProperty === 1)
      if (obj) {
        ElMessage.warning('请选择定性变量')
        rightActiveObj1.value = [obj]
        toCommonMultiLeft(1, '', rightData1, rightActiveObj1)
        return false
      }
    }
    if (rightData2.value.length <= 2) {
      const obj = rightData2.value.find(item => item.dataProperty === 1)
      if (obj) {
        ElMessage.warning('请选择定性变量')
        rightActiveObj2.value = [obj]
        toCommonMultiLeft(2, '', rightData2, rightActiveObj2)
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
const onEndRight1 = () => {
  if (rightData2.value.length > 0) {
    const obj = rightData2.value.find(item => item.dataProperty === 1)
    if (obj) {
      ElMessage.warning('请选择定量变量')
      rightData1.value.push(obj)
      rightData2.value = []
    }
  }
}
const onEndRight2 = () => {
  if (rightData1.value.length > 0) {
    const obj = rightData1.value.find(item => item.dataProperty === 1)
    if (obj) {
      ElMessage.warning('请选择定量变量')
      rightData2.value.push(obj)
      rightData1.value = []
    }
  }
}

const clickCustomLeft = (item, multiType) => {
  if ((rightData1.value.length < 1) || (rightData2.value.length < 2)) {
    clickMultiLeft(item, multiType)
  }
}
const clickCustomMultiRight = (value, item, multiType) => {
  if (value === 1) {
    clickMultiRight(item, multiType, rightActiveObj1)
  } else if (value === 2) {
    clickMultiRight(item, multiType, rightActiveObj2)
  }
}
const toCustomMultiRight = (value) => {
  if (leftActiveObj.value.length > 0) {
    if (value === 1 && (leftActiveObj.value.length + rightData1.value.length) !== 1) {
      ElMessage.warning('请选择1个分层变量')
      return false
    } else if (value === 2 && (leftActiveObj.value.length + rightData2.value.length) > 2) {
      ElMessage.warning('至多选择2个二分类变量')
      return false
    }
    if (value === 1) {
      toMultiRight(rightData1)
    } else if (value === 2) {
      toMultiRight(rightData2)
    }
  }
}
const toMultiLeft = (value) => {
  if (value === 1) {
    toCommonMultiLeft(value, '', rightData1, rightActiveObj1)
  } else if (value === 2) {
    toCommonMultiLeft(value, '', rightData2, rightActiveObj2)
  }
}
// 开始分析
const beginAnalysis = async (outParams) => {
  const field = []
  if (!outParams) {
    if (rightData1.value.length !== 1) {
      ElMessage.warning(`请选择分层变量`)
      return false
    }
    if (rightData2.value.length !== 2) {
      ElMessage.warning(`请选择二分类变量`)
      return false
    }
    const combinedData = [...rightData1.value, ...rightData2.value]
    combinedData.forEach(item => {
      field.push({
        metric: item.label,
        metric_type: item.dataProperty
      })
    })
  }

  const params = outParams || {
    field,
    metric_n_list: rightData2.value.map(item => item.label),
    metric_strata: rightData1.value[0].label,
    project_id: props.engineeringInfo.id,
    input_conditions: JSON.stringify({
      righData1V: [rightData1.value[0].label],
      righData2V: rightData2.value.map(item => item.label)
    })
  }
  sendRequest(props.isAntdSix, props.currentNode, newDataOperateId, params, emits)
}
defineExpose({
  beginAnalysis
})
</script>
  <style scoped lang="scss">
  @use '@/style/common/variableSelection.scss';
  :deep(.el-form-item__label) {
    padding-right: 0;
  }
  </style>
