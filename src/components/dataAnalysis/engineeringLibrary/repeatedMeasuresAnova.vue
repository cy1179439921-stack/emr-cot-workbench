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
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledS="rightData2.length === MULTICOUNT" :disabledR="rightData1.length === 2 && rightData3.length === 1"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :needVariableType="2"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :needVariableType="1"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj3" @handleToRight="toCustomMultiRight(3)" @handleToLeft="toMultiLeft(3)" :needVariableType="2"/>
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>定性组间变量(≤2)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-3">
              <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)" @handleEnd="onEndRight1"/>
            </div>
          </el-scrollbar>
        </div>
        <div class="right1">
          <header class="header">
            <span>定量组内变量(≥2)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-3">
              <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element =>clickCustomMultiRight(2, element)" @handleEnd="onEndRight2"/>
            </div>
          </el-scrollbar>
        </div>
        <div class="right1">
          <header class="header">
            <span>定性个体变量(=1)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData3" :group="groupRight3" :activeObj="rightActiveObj3" @handleClick="element =>clickCustomMultiRight(3, element)" @handleEnd="onEndRight3"/>
          </div>
        </div>
      </div>
    </div>
    <div class="main2">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content">
        <el-form ref="formRef" :model="paramsForm" label-position="left" :rules="rules">
          <el-form-item label="组内变量名：" prop="groupIn_variable_name">
            <el-input v-model="paramsForm.groupIn_variable_name" maxlength="100" placeholder="请填写内容"></el-input>
          </el-form-item>
          <el-form-item label="是否进行事后多重比较：">
            <el-select v-model="paramsForm.open_multiple_comparisons" placeholder="请选择一项" @change="changeSelect1">
              <el-option v-for="item in options" :key="'select1_' + item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" v-if="paramsForm.open_multiple_comparisons === '是'">
            <el-select v-model="paramsForm.methods" placeholder="请选择一项">
              <el-option v-for="item in options2" :key="'select2_' + item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'RepeatedMeasuresAnova',
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
const rules = {
  groupIn_variable_name: [{ required: true, message: '请填写组内变量名', trigger: 'blur' }]
}
const rightData1 = ref([])
const rightData2 = ref([])
const rightData3 = ref([])
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])
const rightActiveObj2 = ref([])
const rightActiveObj3 = ref([])
const formRef = ref(null)
const paramsForm = ref({
  groupIn_variable_name: '',
  open_multiple_comparisons: '否',
  methods: 'LSD'
})
const options = ref(['是', '否'])
const options2 = ref(['LSD', 'bonf', 'sidak'])
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
const { init, searchAll, clickMultiLeft, toMultiRight, toCommonMultiLeft, clickMultiRight, sendRequest } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj1)

init('', newDataOperateId.value, props.jumpData, handleJumpParams)

const groupRight1 = ref({
  name: 'groupA',
  put: () => {
    return rightData1.value.length < 2
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
    return rightData3.value.length < 1
  }
})

watch(() => rightData1.value, async (val) => {
  if (val.some(d => d.dataProperty === 1)) {
    return false
  }
  if (val.length === 2 && rightData2.value.length === MULTICOUNT && rightData3.value.length === 1) {
    leftActiveObj.value = []
  } else if (val.length === 2 && rightData3.value.length === 1) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty === 1)
  } else if (rightData2.value.length === MULTICOUNT) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty !== 1)
  }
  // 处理拖拽后的rightActiveObj2
  if (rightActiveObj1.value.length > 0) {
    const arr = rightActiveObj1.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj1.value = arr
  }
}, { deep: true })

watch(() => rightData2.value, (val) => {
  if (val.some(d => d.dataProperty !== 1)) {
    return false
  }
  if (val.length === MULTICOUNT && rightData1.value.length === 2 && rightData3.value.length === 1) {
    leftActiveObj.value = []
  } else if (val.length === MULTICOUNT) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty !== 1)
  } else if (rightData1.value.length === 2 && rightData3.value.length === 1) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty === 1)
  }
  // 处理拖拽后的rightActiveObj1
  if (rightActiveObj2.value.length > 0) {
    const arr = rightActiveObj2.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj2.value = arr
  }
}, { deep: true })

watch(() => rightData3.value, async (val) => {
  if (val.some(d => d.dataProperty === 1)) {
    return false
  }
  if (val.length === 1 && rightData2.value.length === MULTICOUNT && rightData1.value.length === 2) {
    leftActiveObj.value = []
  } else if (val.length === 1 && rightData1.value.length === 2) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty === 1)
  } else if (rightData2.value.length === MULTICOUNT) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty !== 1)
  }
  // 处理拖拽后的rightActiveObj2
  if (rightActiveObj3.value.length > 0) {
    const arr = rightActiveObj3.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj3.value = arr
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
    if (rightData1.value.length > 0) {
      const obj = rightData1.value.find(item => item.dataProperty === 1)
      if (obj) {
        ElMessage.warning('请选择定性变量')
        rightActiveObj1.value = [obj]
        toCommonMultiLeft(1, '', rightData1, rightActiveObj1)
        return false
      }
    }
    if (rightData2.value.length > 0) {
      const obj = rightData2.value.find(item => item.dataProperty !== 1)
      if (obj) {
        ElMessage.warning('请选择定量变量')
        rightActiveObj2.value = [obj]
        toCommonMultiLeft(2, '', rightData2, rightActiveObj2)
        return false
      }
    }
    if (rightData3.value.length === 1) {
      const obj = rightData3.value.find(item => item.dataProperty === 1)
      if (obj) {
        ElMessage.warning('请选择定性变量')
        rightActiveObj1.value = [obj]
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
    const objIndex = rightData2.value.findIndex(item => item.dataProperty !== 1)
    if (objIndex !== -1) {
      ElMessage.warning('请选择定量变量')
      rightData1.value.push(rightData2.value[objIndex])
      rightData2.value.splice(objIndex, 1)
    }
  }
}
const onEndRight2 = () => {
  if (rightData1.value.length > 0) {
    const objIndex = rightData1.value.findIndex(item => item.dataProperty === 1)
    if (objIndex !== -1) {
      ElMessage.warning('请选择定性变量')
      rightData2.value.push(rightData1.value[objIndex])
      rightData1.value.splice(objIndex, 1)
    }
  }
  if (rightData3.value.length > 0) {
    const objIndex = rightData3.value.findIndex(item => item.dataProperty === 1)
    if (objIndex !== -1) {
      ElMessage.warning('请选择定性变量')
      rightData2.value.push(rightData3.value[objIndex])
      rightData3.value.splice(objIndex, 1)
    }
  }
}
const onEndRight3 = () => {
  if (rightData2.value.length > 0) {
    const objIndex = rightData2.value.findIndex(item => item.dataProperty !== 1)
    if (objIndex !== -1) {
      ElMessage.warning('请选择定量变量')
      rightData3.value.push(rightData2.value[objIndex])
      rightData2.value.splice(objIndex, 1)
    }
  }
}

const clickCustomLeft = (item, multiType) => {
  if ((item.dataProperty === 1 && rightData2.value.length < MULTICOUNT) || (item.dataProperty !== 1 && rightData1.value.length < 2) || (item.dataProperty !== 1 && rightData3.value.length < 1)) {
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
      const SLength = leftActiveObj.value.filter(item => item.dataProperty === 1)
      if (SLength.length > 0) {
        ElMessage.warning('请选择1至2个定性变量')
        return false
      } else if (leftActiveObj.value.length + rightData1.value.length < 3) {
        toMultiRight(rightData1)
      } else {
        ElMessage.warning(`请选择1至2个定性变量`)
      }
      return false
    } else if (value === 2) {
      const noSLength = leftActiveObj.value.filter(item => item.dataProperty !== 1)
      if (noSLength.length > 0) {
        ElMessage.warning('请选择定量变量')
        return false
      } else if (leftActiveObj.value.length + rightData2.value.length < MULTICOUNT + 1) {
        toMultiRight(rightData2)
      } else {
        ElMessage.warning(`输入变量最多不能超过${MULTICOUNT}`)
      }
    } else if (value === 3) {
      const SLength = leftActiveObj.value.filter(item => item.dataProperty === 1)
      if (SLength.length > 0) {
        ElMessage.warning('请选择1个定性变量')
        return false
      } else if (leftActiveObj.value.length + rightData3.value.length < 2) {
        toMultiRight(rightData3)
      } else {
        ElMessage.warning(`请选择1个定性变量`)
      }
      return false
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
// 是否进行事后多重比较
const changeSelect1 = (val) => {
  if (val === '是') {
    paramsForm.value.methods = 'LSD'
  } else {
    paramsForm.value.methods = ''
  }
}
// 开始分析
const beginAnalysis = async (outParams, cb) => {
  if (!outParams) {
    if (rightData1.value.length === 0) {
      ElMessage.warning(`请选择1至2个定性组间变量`)
      return false
    }
    if (rightData2.value.length < 2) {
      ElMessage.warning(`请选择2至${MULTICOUNT}个定量组内变量`)
      return false
    }
    if (rightData3.value.length === 0) {
      ElMessage.warning(`请选择1个定性个体变量`)
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

// 开始分析
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
  rightData2.value.forEach(item => {
    metric_S.push(item.label)
  })
  const params = outParams || {
    metric_S,
    metric_N: rightData1.value[0].label,
    project_id: props.engineeringInfo.id,
    method_name: paramsForm.value.type,
    field,
    input_conditions: JSON.stringify({
      righData1V: [rightData1.value[0].label],
      righData2V: metric_S,
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
:deep(.el-form-item__label) {
  padding-right: 0;
}
</style>
