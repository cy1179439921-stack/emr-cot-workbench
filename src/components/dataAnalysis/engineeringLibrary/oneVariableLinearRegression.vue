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
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" selectType="single" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledS="rightData1.length === 1 && rightData2.length === 1"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :isEnough="rightData1.length === 1"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :isEnough="rightData2.length === 1"/>
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>自变量(=1)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)"/>
          </div>
        </div>
        <div class="right1">
          <header class="header">
            <span>因变量(=1)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element =>clickCustomMultiRight(2, element)"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'OneVariableLinearRegression',
  inheritAttrs: false
})
import { ref, watch } from 'vue'
import { groupLeft, useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { ElMessage } from 'element-plus'
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
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])
const rightActiveObj2 = ref([])
// 若回调成功，一定是跳转的
const handleJumpParams = () => {
  if (props.jumpData && props.jumpData.smallGroup === props.currentNode.name) {
    const inputConditions = JSON.parse(JSON.parse(props.jumpData.params).input_conditions)
    console.log('inputConditions', inputConditions)
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
const { init, searchAll, clickMultiLeft, toMultiRight, toCommonMultiLeft, changeLeftData, sendRequest } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj1)

init('定量', newDataOperateId.value, props.jumpData, handleJumpParams)

const groupRight1 = ref({
  name: 'groupA',
  put: () => {
    return rightData1.value.length < 1
  }
})
const groupRight2 = ref({
  name: 'groupA',
  put: () => {
    return rightData2.value.length < 1
  }
})
watch(() => rightData1.value, (val) => {
  console.log('rightData1变化了')
  if (val.length === 1 && rightData2.value.length === 1) {
    leftActiveObj.value = []
  }
  // 处理拖拽后的rightActiveObj1
  if (rightActiveObj1.value.length > 0) {
    const arr = rightActiveObj1.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj1.value = arr
  }
}, { deep: true })
watch(() => rightData2.value, (val) => {
  console.log('rightData2变化了')
  if (val.length === 1 && rightData1.value.length === 1) {
    leftActiveObj.value = []
  }
  // 处理拖拽后的rightActiveObj2
  if (rightActiveObj2.value.length > 0) {
    const arr = rightActiveObj2.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj2.value = arr
  }
}, { deep: true })

const clickCustomLeft = (item, multiType) => {
  if (rightData1.value.length < 1 || rightData2.value.length < 1) {
    clickMultiLeft(item, multiType)
  }
}
const clickCustomMultiRight = (value, item, multiType) => {
  if (value === 1) {
    rightActiveObj1.value = [item]
  } else if (value === 2) {
    rightActiveObj2.value = [item]
  }
}
const toCustomMultiRight = (value) => {
  if (leftActiveObj.value.length > 0) {
    if (value === 1) {
      if (rightData1.value.length < 1) {
        toMultiRight(rightData1)
      } else {
        ElMessage.warning('请选择1个自变量')
      }
    } else if (value === 2) {
      if (rightData2.value.length < 1) {
        toMultiRight(rightData2)
      } else {
        ElMessage.warning('请选择1个因变量')
      }
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
      ElMessage.warning(`请选择自变量`)
      return false
    }
    if (rightData2.value.length !== 1) {
      ElMessage.warning(`请选择因变量`)
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
    independent_variable: [rightData1.value[0].label],
    dependent_variable: rightData2.value[0].label,
    project_id: props.engineeringInfo.id,
    field,
    input_conditions: JSON.stringify({
      righData1V: [rightData1.value[0].label],
      righData2V: [rightData2.value[0].label]
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
