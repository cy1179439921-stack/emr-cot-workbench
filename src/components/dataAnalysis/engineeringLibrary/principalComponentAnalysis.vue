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
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledS="rightData1.length === MULTICOUNT" :disabledR="rightData2.length === 1"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :needVariableType="1"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :needVariableType="2"/>
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>定量变量(≥2)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-2">
              <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)" @handleEnd="onEndRight1"/>
            </div>
          </el-scrollbar>
        </div>
        <div class="right1">
          <header class="header">
            <span>定性行索引变量(≤1)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element =>clickCustomMultiRight(2, element)" @handleEnd="onEndRight2"/>
          </div>
        </div>
      </div>
    </div>
    <div class="main2">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content">
        <el-radio-group v-model="paramsForm.radio1" @change="handleRadioChange">
          <el-form ref="formRef" :model="paramsForm" label-position="left" hide-required-asterisk :rules="paramsForm.radio1 === 1 ? rules : rules2">
            <el-form-item prop="count">
              <template #label>
                <el-radio :value="1" size="large">主成分个数为：</el-radio>
              </template>
              <el-input-number
                v-no-e v-model="paramsForm.count" :min="1"></el-input-number>
            </el-form-item>
            <el-form-item prop="thresholds">
              <template #label>
                <el-radio :value="2" size="large">特征根阙值为：</el-radio>
              </template>
              <el-input type="number" v-no-e v-model="paramsForm.thresholds" min="0" step="0.01" placeholder="请填写内容" @input="handleInput" @blur="handleBlur"></el-input>
            </el-form-item>
          </el-form>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'PrincipalComponentAnalysis',
  inheritAttrs: false
})
import { ref, watch } from 'vue'
// import draggable from 'vuedraggable'
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
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])
const rightActiveObj2 = ref([])
const formRef = ref(null)
const paramsForm = ref({
  radio1: 1,
  count: 1,
  thresholds: ''
})
// 当paramsForm.radio1为1时，paramsForm.count为必填项，当paramsForm.radio1为2时，paramsForm.thresholds为必填项
const rules = {
  count: [
    { required: true, message: '请填写', trigger: 'blur' }
  ]
}
const rules2 = {
  thresholds: [
    { required: true, message: '请填写', trigger: 'blur' }
  ]
}
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
const { init, searchAll, clickMultiLeft, toMultiRight, toCommonMultiLeft, clickMultiRight, sendRequest } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj1)

init('', newDataOperateId.value, props.jumpData, handleJumpParams)

const groupRight1 = ref({
  name: 'groupA',
  put: () => {
    return rightData1.value.length < MULTICOUNT
  }
})
const groupRight2 = ref({
  name: 'groupA',
  put: () => {
    return rightData2.value.length < 1
  }
})
watch(() => rightData1.value, (val, oldVal) => {
  if (val.some(d => d.dataProperty !== 1)) {
    return false
  }
  if (val.length === MULTICOUNT && rightData2.value.length === 1) {
    leftActiveObj.value = []
  } else if (val.length === MULTICOUNT) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty !== 1)
  } else if (rightData2.value.length === 1) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty === 1)
  }
  // 处理拖拽后的rightActiveObj1
  if (rightActiveObj1.value.length > 0) {
    const arr = rightActiveObj1.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj1.value = arr
  }
}, { deep: true })

watch(() => rightData2.value, async (val) => {
  console.log('rightData2变化了')
  if (val.length === 1 && rightData1.value.length === MULTICOUNT) {
    leftActiveObj.value = []
  } else if (val.length === 1) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty === 1)
  } else if (rightData1.value.length === MULTICOUNT) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty !== 1)
  }
  // 处理拖拽后的rightActiveObj2
  if (rightActiveObj2.value.length > 0) {
    const arr = rightActiveObj2.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj2.value = arr
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
    if (rightData1.value.length > 0) {
      const obj = rightData1.value.find(item => item.dataProperty !== 1)
      if (obj) {
        ElMessage.warning('请选择定量变量')
        rightActiveObj1.value = [obj]
        toCommonMultiLeft(1, '', rightData1, rightActiveObj1)
        return false
      }
    }
    if (rightData2.value.length === 1) {
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
      ElMessage.warning('请选择定性变量')
      rightData1.value.push(obj)
      rightData2.value = []
    }
  }
}
const onEndRight2 = () => {
  if (rightData1.value.length > 0) {
    const objIndex = rightData1.value.findIndex(item => item.dataProperty !== 1)
    if (objIndex !== -1) {
      ElMessage.warning('请选择定量变量')
      rightData2.value.push(rightData1.value[objIndex])
      rightData1.value.splice(objIndex, 1)
    }
  }
}

const clickCustomLeft = (item, multiType) => {
  if ((item.dataProperty === 1 && rightData1.value.length < MULTICOUNT) || (item.dataProperty !== 1 && rightData2.value.length < 1)) {
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
    if (value === 1) {
      const noSLength = leftActiveObj.value.filter(item => item.dataProperty !== 1)
      if (noSLength.length > 0) {
        ElMessage.warning('请选择定量变量')
        return false
      } else if (leftActiveObj.value.length + rightData1.value.length < MULTICOUNT + 1) {
        toMultiRight(rightData1)
      } else {
        ElMessage.warning(`输入变量最多不能超过${MULTICOUNT}`)
      }
      return false
    } else if (value === 2) {
      const SLength = leftActiveObj.value.filter(item => item.dataProperty === 1)
      if (leftActiveObj.value.length > 1) {
        ElMessage.warning('至多选择1个定性变量')
        return false
      } else if (SLength.length > 0) {
        ElMessage.warning('请选择定性变量')
        return false
      }
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
const handleInput = (value) => {
  // 移除非数字和小数点，并处理多个小数点
  let newVal = value.replace(/[^0-9.]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/(\..*)\./g, '$1')

  // 处理以0开头的情况（如012 -> 12）
  if (newVal.startsWith('0') && newVal.length > 1 && !newVal.includes('.')) {
    newVal = newVal.substr(1)
  }

  // 分割小数部分并截取两位
  const parts = newVal.split('.')
  if (parts.length > 1) {
    newVal = parts[0] + '.' + parts[1].slice(0, 2)
  }

  // 更新模型值（此时允许中间状态如"0."）
  paramsForm.value.thresholds = newVal
}
const handleBlur = () => {
  let value = paramsForm.value.thresholds
  if (value === '') return

  // 补全前导0（如".5" -> "0.5"）
  if (value.startsWith('.')) {
    value = '0' + value
  }

  const num = parseFloat(value)
  if (isNaN(num) || num <= 0) {
    paramsForm.value.thresholds = ''
  } else {
    // 四舍五入并保留两位小数
    paramsForm.value.thresholds = num.toFixed(2)
  }
}
const handleRadioChange = (value) => {
  // 清除formRef的验证状态
  formRef.value.clearValidate()
}
// 开始分析
const beginAnalysis = async (outParams, cb) => {
  if (!outParams) {
    if (rightData1.value.length < 2) {
      ElMessage.warning(`请选择2至${MULTICOUNT}个定量变量`)
      return false
    }
    formRef.value.validate(async (valid) => {
      if (valid) {
        toBeginAnalysis()
      } else {
        cb && cb()
      }
    })
  } else {
    toBeginAnalysis(outParams)
  }
}
const toBeginAnalysis = async (outParams) => {
  const field = []
  if (!outParams) {
    const combinedData = [...rightData1.value, ...rightData2.value]
    combinedData.forEach(item => {
      field.push({
        metric: item.label,
        metric_type: item.dataProperty
      })
    })
  }
  const metric_S = []
  rightData1.value.forEach(item => {
    metric_S.push(item.label)
  })
  const params = outParams || {
    metric_S,
    metric_N: rightData2.value[0]?.label,
    project_id: props.engineeringInfo.id,
    field,
    input_conditions: JSON.stringify({
      righData1V: metric_S,
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
:deep(.el-radio-group) {
  width: 100%;
  .el-form {
    width: 100%;
    .el-radio.el-radio--large {
      height: 100%;
      .el-radio__inner {
        width: 16px;
        height: 16px;
      }
    }
    .el-radio {
      color: var(--theme-text);
      .el-radio__label {
        padding-left: 8px;
        color: var(--theme-text);
      }
    }
    .el-input-number {
      width: 100%;
    }
    .el-input-number__decrease,
    .el-input-number__increase {
      background: var(--theme-fill);
      color: var(--theme-text-3);
    }
  }
}
:deep(.el-form-item__label) {
  padding-right: 0;
}
</style>
