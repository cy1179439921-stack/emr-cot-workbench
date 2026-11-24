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
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledR="rightData1.length === 1 && rightData2.length === MULTICOUNT"/>
          </div>
        </el-scrollbar>

      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :isEnough="rightData1.length === 1"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :isEnough="rightData2.length === MULTICOUNT"/>
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>定性资料自变量(=1)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element => clickCustomMultiRight(1, element)" @handleEnd="onEndRight1"></variableDraggable>
          </div>
        </div>
        <div class="right1">
          <header class="header">
            <span>定性资料因变量(≥1)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-2">
              <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element => clickCustomMultiRight(2, element)" @handleEnd="onEndRight2" />
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <div class="main2">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content">
        <el-form ref="formRef" :model="paramsForm" label-position="left" :rules="rules">
          <el-form-item label="类型：" prop="type">
            <el-select v-model="paramsForm.type" placeholder="请选择方法">
              <el-option :label="item.label" :value="item.value" v-for="(item, index) in options" :key="index"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'FourGridChiSquareTest',
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
const options = [
  {
    label: 'Pearson卡方检验',
    value: 'Pearson卡方检验'
  },
  {
    label: 'Yates校正卡方检验',
    value: 'Yates校正卡方检验'
  },
  {
    label: 'Fisher精确检验',
    value: 'Fisher精确检验'
  },
  {
    label: '自动卡方检验',
    value: '自动卡方检验'
  }
]
const newDataOperateId = ref(props.dataOperateId)
const emits = defineEmits(['showLoading', 'getResultData', 'saveData'])
const allSearch = ref('')
const leftAllData = ref([])
const leftData = ref([])
const rules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}
const rightData1 = ref([])
const rightData2 = ref([])
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])
const rightActiveObj2 = ref([])
const formRef = ref(null)
const paramsForm = ref({
  type: 'Pearson卡方检验'
})
// 若回调成功，一定是跳转的
const handleJumpParams = () => {
  if (props.jumpData && props.jumpData.smallGroup === props.currentNode.name) {
    const inputConditions = JSON.parse(JSON.parse(props.jumpData.params).inputConditions)
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
const { init, searchAll, clickMultiLeft, toMultiRight, clickMultiRight, toCommonMultiLeft, sendRequestNew } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj1)

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
    return rightData2.value.length < MULTICOUNT
  }
})
watch(() => rightData1.value, (val) => {
  if (val.length === 1 && (rightData2.value.length === MULTICOUNT)) {
    leftActiveObj.value = []
  }
  // 处理拖拽后的rightActiveObj1
  if (rightActiveObj1.value.length > 0) {
    const arr = rightActiveObj1.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj1.value = arr
  }
}, { deep: true })
watch(() => rightData2.value, (val) => {
  if (val.length === MULTICOUNT && rightData1.value.length === 1) {
    leftActiveObj.value = []
  }
  // 处理拖拽后的rightActiveObj2
  if (rightActiveObj2.value.length > 0) {
    const arr = rightActiveObj2.value.filter(item => val.some(d => d.label === item.label))
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
  if ((rightData1.value.length < 1) || (rightData2.value.length < MULTICOUNT)) {
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
      ElMessage.warning('请选择1个定性资料自变量')
      return false
    } else if (value === 2 && (leftActiveObj.value.length + rightData2.value.length) > MULTICOUNT) {
      ElMessage.warning(`至多选择${MULTICOUNT}个定性资料因变量`)
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
      ElMessage.warning(`请选择定性资料自变量`)
      return false
    }
    if (rightData2.value.length < 1) {
      ElMessage.warning(`请选择定性资料因变量`)
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
  const metric_S = []
  rightData2.value.forEach(item => {
    metric_S.push(item.label)
  })
  const params = outParams || {
    dependentVar: rightData1.value[0].label,
    independentVar: metric_S,
    fieldList: field,
    checkType: paramsForm.value.type,
    inputConditions: JSON.stringify({
      righData1V: [rightData1.value[0].label],
      righData2V: metric_S,
      paramsForm: paramsForm.value
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
  :deep(.el-form-item__label) {
    padding-right: 0;
  }
  </style>
