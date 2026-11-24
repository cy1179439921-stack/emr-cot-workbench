<template>
  <div class="variable-selection-area">
    <div class="mainTop">
      <div class="topLeft">
        <header class="header">全部变量</header>
        <div class="searchBox">
          <commonInput v-model="allSearch" placeholder="输入关键词，如姓名或工号" class="searchText" clearable @input="searchAll"/>
        </div>
        <el-scrollbar>
          <div class="ul" :class="rightData2.length === MULTICOUNT && rightData1.length === 1 ? 'disabledUl' : ''">
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledR="rightData2.length === MULTICOUNT"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :needVariableType="1" :isEnough="rightData1.length === 1"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :isEnough="rightData2.length === MULTICOUNT"/>
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>定量变量y(=1)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)"/>
          </div>
        </div>
        <div class="right1">
          <header class="header multiColHeader">
            <div>
              <div>自变量</div>
              <div>(定性或定量)(≥1)</div>
            </div>
            <div>
              <SvgIcon iconName="icon-zimu"></SvgIcon>
              <SvgIcon iconName="icon-shuzi"></SvgIcon>
            </div>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-2">
              <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element =>clickCustomMultiRight(2, element)" @handleEnd="onEndRight2"/>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <div class="main2">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content">
        <el-form ref="formRef" :model="paramsForm" label-position="left" :rules="rules">
          <el-form-item label="自动选择λ值：">
            <el-select v-model="paramsForm.isAutoY" placeholder="请选择一项" @change="changeSelect1">
              <el-option v-for="item in options" :key="'select1_' + item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="λ值：" v-if="paramsForm.isAutoY === '否'" prop="yValue">
            <el-input type="number" v-no-e v-model="paramsForm.yValue" placeholder="数值范围0.01-2"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'lassoRegression',
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
const rightData2 = ref([])
const rightData1 = ref([])
const leftActiveObj = ref([])
const rightActiveObj2 = ref([])
const rightActiveObj1 = ref([])
const formRef = ref(null)
const paramsForm = ref({
  isAutoY: '是',
  yValue: ''
})
const options = ref(['是', '否'])
const validateSplit = (rule, value, callback) => {
  if (value < 0.01 || value > 2) {
    callback(new Error('请填写0.01-2以内的数值'))
  } else {
    callback()
  }
}
const rules = {
  yValue: [{ required: true, message: '数值范围0.01-2', trigger: 'blur' }, { validator: validateSplit, trigger: 'blur' }]
}
// 若回调成功，一定是跳转的
const handleJumpParams = () => {
  if (props.jumpData && props.jumpData.smallGroup === props.currentNode.name) {
    const inputConditions = JSON.parse(JSON.parse(props.jumpData.params).inputConditions)
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
    paramsForm.value = inputConditions.paramsForm
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

const clickCustomLeft = (item, multiType) => {
  if (rightData2.value.length < MULTICOUNT || (item.dataProperty !== 1 && rightData1.value.length < 1)) {
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
// 切换选项
const changeSelect1 = (val) => {
  paramsForm.value.yValue = ''
}
// 开始分析
const beginAnalysis = async (outParams, cb) => {
  if (!outParams) {
    if (rightData1.value.length === 0) {
      ElMessage.warning(`请选择定量变量`)
      return false
    }
    if (rightData2.value.length === 0) {
      ElMessage.warning(`请选择自变量`)
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
  const independentVar_S = []
  const field = []
  if (!outParams) {
    const combinedData = [...rightData1.value, ...rightData2.value]
    combinedData.forEach(item => {
      field.push({
        metric: item.label,
        metric_type: item.dataProperty
      })
    })
    rightData2.value.forEach(item => {
      independentVar_S.push(item.label)
    })
  }
  const params = outParams || {
    dependentVar: rightData1.value[0].label,
    independentVar: independentVar_S,
    lambdaValue: paramsForm.value.isAutoY === '是' ? '' : parseFloat(paramsForm.value.yValue),
    fieldList: field,
    inputConditions: JSON.stringify({
      righData1V: [rightData1.value[0].label],
      righData2V: independentVar_S,
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
