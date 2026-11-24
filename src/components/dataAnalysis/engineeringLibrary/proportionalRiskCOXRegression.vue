<template>
  <div class="variable-selection-area">
    <div class="mainTop">
      <div class="topLeft">
        <header class="header">全部变量</header>
        <div class="searchBox">
          <commonInput v-model="allSearch" placeholder="输入关键词，如姓名或工号" class="searchText" clearable @input="searchAll"/>
        </div>
        <el-scrollbar>
          <div class="ul" :class="rightData1.length === MULTICOUNT && rightData2.length === 1 && rightData3.length === 1 ? 'disabledUl' : ''">
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledS="rightData1.length === MULTICOUNT && rightData3.length === 1" :disabledR="rightData1.length === MULTICOUNT && rightData2.length === 1"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :isEnough="rightData1.length === MULTICOUNT"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :needVariableType="2" :isEnough="rightData2.length === 1"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj3" @handleToRight="toCustomMultiRight(3)" @handleToLeft="toMultiLeft(3)" :needVariableType="1" :isEnough="rightData3.length === 1"/>
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>自变量(≥1)</span>
            <span>
              <SvgIcon iconName="icon-shuzi"></SvgIcon>
              <SvgIcon iconName="icon-zimu"></SvgIcon>
            </span>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-3">
              <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)" @handleEnd="onEndRight1"/>
            </div>
          </el-scrollbar>
        </div>
        <div class="right1">
          <header class="header">
            <span>二分类生存结局(=1)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element =>clickCustomMultiRight(2, element)"/>
          </div>
        </div>
        <div class="right1">
          <header class="header">
            <span>生存时间(=1)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData3" :group="groupRight3" :activeObj="rightActiveObj3" @handleClick="element =>clickCustomMultiRight(3, element)"/>
          </div>
        </div>
      </div>
    </div>
    <div class="main2" v-if="rightData2.length === 1">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content">
        <el-form ref="formRef" :model="paramsForm" label-position="left">
          <el-form-item label="结局变量结局设置：" prop="happen">
            <el-select v-model="paramsForm.happen" placeholder="请选择一项">
              <el-option v-for="(item, index) in options" :key="'select1_' + index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <template #label>
              <span class="hint-label">不等比例COX回归设置：</span>
              <el-tooltip :content="tooltipContent" raw-content placement="top">
                <img class="hint-img" :src="exclamation">
              </el-tooltip>
            </template>
            <el-select v-model="paramsForm.coxType" placeholder="请选择一项" @change="changeSetting">
              <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择时间依赖协变量：" v-if="paramsForm.coxType === 'time_covariant'">
            <el-checkbox-group v-model="paramsForm.timeCovariant">
              <el-checkbox
                v-for="item in paramsForm.timeCovariantOptions"
                :key="'checkbox_' + item.value"
                :value="item.value">
                <SvgIcon iconName="icon-zimu"></SvgIcon>
                <div class="name">
                  <CommonTooltip :content="item.label">
                    <span>{{ item.label }}</span>
                  </CommonTooltip>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="选择分层变量：" v-if="paramsForm.coxType === 'strata'">
            <el-checkbox-group v-model="paramsForm.strataList">
              <el-checkbox
                v-for="(item, index) in paramsForm.stratificationVariables"
                :key="index"
                :value="item.label">
                <SvgIcon iconName="icon-zimu"></SvgIcon>
                <div class="name">
                  <CommonTooltip :content="item.label">
                    <span>{{ item.label }}</span>
                  </CommonTooltip>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ProportionalRiskCOXRegression',
  inheritAttrs: false
})
import { ref, watch } from 'vue'
import { groupLeft, useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { ElMessage } from 'element-plus'
import { checkBinaryVariable, getTimeCovariantOptions } from '@/api/api_dataAnalysis.js'
import { MULTICOUNT } from '@/components/dataAnalysis/utils/commonData'
import transferButton from '@/components/dataAnalysis/engineeringLibrary/common/transferButton.vue'
import variableDraggable from '@/components/dataAnalysis/engineeringLibrary/common/variableDraggable.vue'
import exclamation from '@/assets/tanhao.png'
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
const paramsForm = ref({
  happen: '',
  coxType: 'normal', // 选择的COX回归类型
  timeCovariant: [], // 时间依赖协变量
  timeCovariantOptions: [], // 时间依赖协变量选项
  strataList: [], // 分层变量
  stratificationVariables: [] // 分层变量选项
})
const rightData1 = ref([])
const rightData2 = ref([])
const rightData3 = ref([])
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])
const rightActiveObj2 = ref([])
const rightActiveObj3 = ref([])
const tooltipContent = ref(`当不能进行COX比例风险假设检验、不满足COX比例风险假设检验或不能用常规COX回归时，可以使用该设置内的方法来解决。<br />
                添加时间依赖协变量：时间依赖协变量是指在观察期间发生变化的协变量，其值随着时间的推移而改变。<br />
                加权COX回归：加权COX回归通过对不同的观测赋予不同的权重来调整其重要性。<br />
                分层COX回归：当研究中存在多个不同的亚组或风险集合时，通常使用分层COX回归。`)
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
    inputConditions.righData3V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
      toMultiRight(rightData3)
    })
    paramsForm.value = inputConditions.paramsForm
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
const groupRight3 = ref({
  name: 'groupA',
  put: () => {
    return rightData3.value.length < 1
  }
})
const options = ref([])
const options2 = ref([
  {
    value: 'normal',
    label: '不选择'
  },
  {
    value: 'time_covariant',
    label: '添加时间依赖协变量'
  },
  {
    value: 'weight',
    label: '加权COX回归'
  },
  {
    value: 'strata',
    label: '分层COX回归'
  }
])
watch(() => rightData1.value, (val, oldVal) => {
  if (val.length === MULTICOUNT && rightData2.value.length === 1 && rightData3.value.length === 1) {
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
const formRef = ref(null)
watch(() => rightData2.value, async (val) => {
  console.log('rightData2变化了')
  if (val.length === 1 && val[0].dataProperty !== 1) {
    const { code, data } = await checkBinaryVariable({
      dataOperateId: newDataOperateId.value,
      fieldName: val[0].label
    })
    if (code === 10000) {
      if (data.checkResult === 0) { // 0表示不符合
        ElMessage.warning('请选择二分变量')
        rightActiveObj2.value = val
        toCommonMultiLeft(2, '', rightData2, rightActiveObj2)
        return false
      }
      formRef.value.resetFields()
      options.value = []
      data.dictList.forEach(item => {
        options.value.push({
          label: item.labelValue,
          value: Number(item.indexValue)
        })
      })
      if (data.dictList.length > 0) {
        paramsForm.value.happen = Number(data.dictList[0].indexValue)
      }
    }
  }
  if (val.length === 1 && rightData1.value.length === MULTICOUNT && rightData3.value.length === 1) {
    leftActiveObj.value = []
  }
  // 处理拖拽后的rightActiveObj2
  if (rightActiveObj2.value.length > 0) {
    const arr = rightActiveObj2.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj2.value = arr
  }
}, { deep: true })
watch(() => rightData3.value, async (val) => {
  console.log('rightData3变化了')
  if (val.length === 1 && rightData1.value.length === MULTICOUNT && rightData2.value.length === 1) {
    leftActiveObj.value = []
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
    if (rightData2.value.length === 1) {
      const obj = rightData2.value.find(item => item.dataProperty === 1)
      if (obj) {
        ElMessage.warning('请选择定性变量')
        rightActiveObj2.value = [obj]
        toCommonMultiLeft(2, '', rightData2, rightActiveObj2)
        return false
      }
    }
    if (rightData3.value.length === 1) {
      const obj = rightData3.value.find(item => item.dataProperty !== 1)
      if (obj) {
        ElMessage.warning('请选择定量变量')
        rightActiveObj3.value = [obj]
        toCommonMultiLeft(3, '', rightData3, rightActiveObj3)
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
  if (rightData3.value.length > 0) {
    const obj = rightData3.value.find(item => item.dataProperty !== 1)
    if (obj) {
      ElMessage.warning('请选择定量变量')
      rightData1.value.push(obj)
      rightData3.value = []
    }
  }
}

const clickCustomLeft = (item, multiType) => {
  if (rightData1.value.length < MULTICOUNT || (item.dataProperty !== 1 && rightData2.value.length < 1) || (item.dataProperty === 1 && rightData2.value.length < 1)) {
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
      if (leftActiveObj.value.length + rightData1.value.length < MULTICOUNT + 1) {
        toMultiRight(rightData1)
      } else {
        ElMessage.warning(`输入变量最多不能超过${MULTICOUNT}`)
      }
      return false
    } else if (value === 2) {
      const SLength = leftActiveObj.value.filter(item => item.dataProperty === 1)
      if (leftActiveObj.value.length > 1) {
        ElMessage.warning('结局变量请选择1个定性变量')
        return false
      } else if (SLength.length > 0) {
        ElMessage.warning('请选择定性变量')
        return false
      }
      if (leftActiveObj.value.length + rightData2.value.length < 2) {
        toMultiRight(rightData2)
      } else {
        ElMessage.warning(`请选择1个结局变量`)
      }
    } else if (value === 3) {
      const SLength = leftActiveObj.value.filter(item => item.dataProperty !== 1)
      if (leftActiveObj.value.length > 1) {
        ElMessage.warning('生存时间请选择1个定量变量')
        return false
      } else if (SLength.length > 0) {
        ElMessage.warning('请选择定量变量')
        return false
      }
      if (leftActiveObj.value.length + rightData3.value.length < 2) {
        toMultiRight(rightData3)
      } else {
        ElMessage.warning(`请选择1个生存时间`)
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
// 修改回归设置
const changeSetting = async (val) => {
  paramsForm.value.strataList = []
  if (val === 'time_covariant') {
    if (rightData1.value.length === 0) {
      ElMessage.warning(`请选择自变量`)
      paramsForm.value.coxType = 'normal'
      return false
    }
    if (rightData2.value.length === 0) {
      ElMessage.warning(`请选择结局变量`)
      paramsForm.value.coxType = 'normal'
      return false
    }
    if (rightData3.value.length === 0) {
      ElMessage.warning(`请选择生存时间`)
      paramsForm.value.coxType = 'normal'
      return false
    }
    const metric_S = []
    rightData1.value.forEach(item => {
      metric_S.push(item.label)
    })
    const field = []
    const combinedData = [...rightData1.value, ...rightData2.value, ...rightData3.value]
    combinedData.forEach(item => {
      field.push({
        metric: item.label,
        metric_type: item.dataProperty
      })
    })
    const params = {
      independent_variables: metric_S,
      durations: rightData3.value[0].label,
      event_observed: rightData2.value[0].label,
      set_event: paramsForm.value.happen,
      project_id: props.engineeringInfo.id,
      field
    }
    console.log('params', params)
    const { code, data } = await getTimeCovariantOptions({
      dataOperateId: newDataOperateId.value,
      params
    })
    if (code === 10000) {
      paramsForm.value.timeCovariantOptions = data.result
    }
  } else if (val === 'strata') {
    paramsForm.value.stratificationVariables = leftAllData.value.filter(item => item.dataProperty === 0 && item.label !== rightData2.value[0].label)
  }
}
// 开始分析
const beginAnalysis = async (outParams) => {
  const field = []
  if (!outParams) {
    if (rightData1.value.length === 0) {
      ElMessage.warning(`请选择自变量`)
      return false
    }
    if (rightData2.value.length === 0) {
      ElMessage.warning(`请选择结局变量`)
      return false
    }
    if (rightData3.value.length === 0) {
      ElMessage.warning(`请选择生存时间`)
      return false
    }
    const combinedData = [...rightData1.value, ...rightData2.value, ...rightData3.value]
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
    independent_variables: metric_S,
    durations: rightData3.value[0].label,
    event_observed: rightData2.value[0].label,
    set_event: paramsForm.value.happen,
    cox_type: paramsForm.value.coxType,
    time_covariant: paramsForm.value.timeCovariant,
    strata_list: paramsForm.value.strataList,
    ph_list: paramsForm.value.timeCovariantOptions,
    project_id: props.engineeringInfo.id,
    field,
    input_conditions: JSON.stringify({
      righData1V: metric_S,
      righData2V: [rightData2.value[0].label],
      righData3V: [rightData3.value[0].label],
      paramsForm: paramsForm.value
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

.main2Content {
  :deep(.el-form) {
    .el-form-item {
      display: flex;
      flex-direction: column;
    }
    .el-form-item__label {
      display: flex;
      align-items: center;
      height: 20px;
      margin-bottom: 12px;
      line-height: 20px;
      font-weight: 600;
      .hint-label {
        display: flex;
        align-items: center;
      }
      .hint-img {
        width: 14px;
        cursor: pointer;
      }
    }
    .el-checkbox-group {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 100%;
      padding: 13px 16px;
      border: 1px solid #d8d8d8;
      .el-checkbox {
        display: flex;
        align-items: center;
        margin-right: 0;
        .el-checkbox__label {
          display: flex;
          align-items: center;
          flex: 1;
          box-sizing: border-box;
          width: 0;
          padding-left: 9px;
          .svg-icon {
            width: 16px;
            margin-right: 9px;
          }
          .name {
            flex: 1;
            width: 0;
            color: var(--theme-text);
          }
        }
      }
    }
  }
}

</style>
