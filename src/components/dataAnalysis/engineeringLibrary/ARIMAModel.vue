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
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" selectType="single" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledS="rightData1.length === 1" :disabledR="rightData2.length === 1"/>
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
            <span>定量变量(=1)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)" @handleEnd="onEndRight1"/>
          </div>
        </div>
        <div class="right1">
          <header class="header multiColHeader">
            <div>
              <span>定类变量-时间项</span>
              <span>(=1)</span>
            </div>
            <div>
              <SvgIcon iconName="icon-zimu"></SvgIcon>
            </div>
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
        <el-form ref="formRef" :model="paramsForm" label-position="left" :rules="rules">
          <el-form-item label="向后预测单位：" prop="forecast_unit">
            <el-input-number
              v-no-e :min="1" :max="100" type="number" controls-position="right" v-model="paramsForm.forecast_unit"></el-input-number>
            <span class="unit">个单位</span>
          </el-form-item>
          <el-form-item label="是否自动寻优：" prop="meanValue">
            <el-radio-group v-model="paramsForm.auto_flag">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="差分阶数d：" v-if="!paramsForm.auto_flag" prop="differential_order">
            <el-input
              type="number"
              placeholder="请填写整数，最小值为0"
              v-model="paramsForm.differential_order"
            ></el-input>
          </el-form-item>
          <el-form-item label="自回归项数p：" v-if="!paramsForm.auto_flag" prop="autoregressive_order">
            <el-input
              type="number"
              placeholder="请填写整数，最小值为0"
              v-model="paramsForm.autoregressive_order"
            ></el-input>
          </el-form-item>
          <el-form-item label="滑动项平均数q：" v-if="!paramsForm.auto_flag" prop="moving_average_order">
            <el-input
              type="number"
              placeholder="请填写整数，最小值为0"
              v-model="paramsForm.moving_average_order"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ARIMAModel',
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
const validateV = (rule, value, callback) => {
  const regex = /^[1-9]\d*$/
  if (Number(value) !== 0 && !regex.test(value)) {
    callback(new Error('请填写整数，最小值为0'))
  } else if (value < 0) {
    callback(new Error('请填写整数，最小值为0'))
  } else {
    callback()
  }
}
const validateUnit = (rule, value, callback) => {
  if (value < 1 || value > 100) {
    callback(new Error('数值范围1-100'))
  } else {
    callback()
  }
}
const newDataOperateId = ref(props.dataOperateId)
const emits = defineEmits(['showLoading', 'getResultData', 'saveData'])
const allSearch = ref('')
const leftAllData = ref([])
const leftData = ref([])
const paramsForm = ref({
  forecast_unit: 7,
  auto_flag: true,
  differential_order: 1,
  autoregressive_order: 1,
  moving_average_order: 1
})
const rules = {
  differential_order: [{ required: true, message: '请填写整数，最小值为0', trigger: 'blur' }, { validator: validateV, trigger: 'blur' }],
  autoregressive_order: [{ required: true, message: '请填写整数，最小值为0', trigger: 'blur' }, { validator: validateV, trigger: 'blur' }],
  moving_average_order: [{ required: true, message: '请填写整数，最小值为0', trigger: 'blur' }, { validator: validateV, trigger: 'blur' }],
  forecast_unit: [{ required: true, message: '数值范围1-100', trigger: 'blur' }, { validator: validateUnit, trigger: 'blur' }]
}
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
    paramsForm.value = inputConditions.paramsForm
  }
}
const { init, searchAll, clickMultiLeft, toMultiRight, toCommonMultiLeft, sendRequest } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj1)

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
    return rightData2.value.length < 1
  }
})
watch(() => rightData1.value, (val) => {
  console.log('rightData1变化了')
  if (val.some(d => d.dataProperty !== 1)) {
    return false
  }
  if (val.length === 1 && rightData2.value.length === 1) {
    leftActiveObj.value = []
  } else if (val.length === 1) {
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
watch(() => rightData2.value, (val) => {
  console.log('rightData2变化了')
  if (val.length === 1 && rightData1.value.length === 1) {
    leftActiveObj.value = []
  } else if (val.length === 1) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty === 1)
  } else if (rightData1.value.length === 1) {
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
    if (rightData1.value.length === 1) {
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
    const obj = rightData1.value.find(item => item.dataProperty !== 1)
    if (obj) {
      ElMessage.warning('请选择定量变量')
      rightData2.value.push(obj)
      rightData1.value = []
    }
  }
}

const clickCustomLeft = (item, multiType) => {
  if ((item.dataProperty === 1 && rightData1.value.length < 1) || (item.dataProperty !== 1 && rightData2.value.length < 1)) {
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
    if (value === 1 && leftActiveObj.value[0].dataProperty !== 1) {
      ElMessage.warning('请选择定量变量')
      return false
    } else if (value === 2 && leftActiveObj.value[0].dataProperty === 1) {
      ElMessage.warning('请选择定性变量')
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
const formRef = ref(null)
// 开始分析
const beginAnalysis = async (outParams, cb) => {
  if (!outParams) {
    if (rightData1.value.length === 0) {
      ElMessage.warning(`请选择定量变量`)
      return false
    }
    if (rightData2.value.length === 0) {
      ElMessage.warning(`请选择定类变量-时间项`)
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
  const combinedData = [...rightData1.value, ...rightData2.value]
  combinedData.forEach(item => {
    field.push({
      metric: item.label,
      metric_type: item.dataProperty
    })
  })
  const params = outParams || {
    time_series: rightData1.value[0].label,
    time_variable: rightData2.value[0].label,
    forecast_unit: paramsForm.value.forecast_unit,
    auto_flag: paramsForm.value.auto_flag,
    project_id: props.engineeringInfo.id,
    field,
    input_conditions: JSON.stringify({
      righData1V: [rightData1.value[0].label],
      righData2V: [rightData2.value[0].label],
      paramsForm: paramsForm.value
    })
  }
  if (!outParams && !paramsForm.value.auto_flag) {
    params.differential_order = paramsForm.value.differential_order
    params.autoregressive_order = paramsForm.value.autoregressive_order
    params.moving_average_order = paramsForm.value.moving_average_order
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
.main2 {
  :deep(.el-form) {
    .el-input-number {
      flex: 1;
      .el-input-number__decrease,
      .el-input-number__increase {
        width: 17px;
        color: var(--theme-text-3);
      }
    }
    .unit {
      margin-left: 8px;
    }
  }
}
</style>
