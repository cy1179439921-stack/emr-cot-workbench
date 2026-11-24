<template>
  <div class="variable-selection-area">
    <div class="mainTop">
      <div class="topLeft">
        <header class="header">全部变量</header>
        <div class="searchBox">
          <commonInput v-model="allSearch" placeholder="输入关键词，如姓名或工号" class="searchText" clearable @input="searchAll"/>
        </div>
        <el-scrollbar>
          <div class="ul" :class="rightData1.length === 1 ? 'disabledUl' : ''">
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" selectType="single" @handleChange="changeLeftData" @handleClick="clickCustomLeft"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1);clearCheakMean()" />
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>定量变量(=1)</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj" selectType="single" @handleClick="clickMultiRight"/>
          </div>
        </div>
      </div>
    </div>
    <div class="main2">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content">
        <el-form ref="formRef" :model="paramsForm" label-position="left" :rules="rules">
          <el-form-item label="样本均值：">
            <el-input type="number" v-no-e v-model="paramsForm.meanValue2" disabled></el-input>
          </el-form-item>
          <el-form-item label="总体均值：" prop="meanValue">
            <el-input type="number" v-no-e v-model="paramsForm.meanValue" placeholder="请填写内容"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'TTestAnalysis',
  inheritAttrs: false
})
import { ref, watch } from 'vue'
import { groupLeft, useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { ElMessage } from 'element-plus'
import { getAverageValue } from '@/api/api_dataAnalysis.js'
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
const paramsForm = ref({
  meanValue: '', // 预测
  meanValue2: '' // 当前
})
const rules = {
  meanValue: [{ required: true, message: '请填写总体均值', trigger: 'blur' }]
}
const rightData1 = ref([])
const leftActiveObj = ref([])
const rightActiveObj = ref([])
// 若回调成功，一定是跳转的
const handleJumpParams = () => {
  if (props.jumpData && props.jumpData.smallGroup === props.currentNode.name) {
    const inputConditions = JSON.parse(JSON.parse(props.jumpData.params).input_conditions)
    console.log('inputConditions', inputConditions)
    inputConditions.righData1V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
    })
    toMultiRight(rightData1)
    paramsForm.value = inputConditions.paramsForm
  }
}
const { init, changeLeftData, searchAll, clickMultiLeft, clickMultiRight, toMultiRight, toCommonMultiLeft, sendRequest } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj)

init('定量', newDataOperateId.value, props.jumpData, handleJumpParams)

const groupRight1 = ref({
  name: 'groupA',
  put: () => {
    return rightData1.value.length < 1
  }
})
watch(() => rightData1.value, (val) => {
  console.log('rightData1变化了')
  if (val.length === 1) {
    leftActiveObj.value = []
    getCheakMean(val[0])
  } else {
    paramsForm.value.meanValue = ''
    paramsForm.value.meanValue2 = ''
  }
  // 处理拖拽后的rightActiveObj
  if (rightActiveObj.value.length > 0) {
    rightActiveObj.value = rightActiveObj.value.filter(item => val.some(d => d.label === item.label))
  }
}, { deep: true })
// 获取当前总体均值
const getCheakMean = async (item) => {
  const params = {
    dataOperateId: newDataOperateId.value,
    fieldName: item.label
  }
  const { code, data } = await getAverageValue(params)
  if (code === 10000) {
    paramsForm.value.meanValue2 = data.averageValue
  }
}
const clickCustomLeft = (item, multiType) => {
  if (rightData1.value.length < 1) {
    clickMultiLeft(item, multiType)
  }
}

const formRef = ref(null)
// 清空当前总体均值
const clearCheakMean = () => {
  if (rightActiveObj.value.length > 0) {
    paramsForm.value.meanValue = ''
    paramsForm.value.meanValue2 = ''
  }
}
const toCustomMultiRight = (value) => {
  toMultiRight(rightData1)
}
const toMultiLeft = (value, type) => {
  toCommonMultiLeft(value, '', rightData1, rightActiveObj)
}
// 开始分析
const beginAnalysis = async (outParams, cb) => {
  if (!outParams) {
    if (rightData1.value.length === 0) {
      ElMessage.warning(`请选择变量`)
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
  const metric = []
  const field = []
  if (!outParams) {
    rightData1.value.forEach(item => {
      metric.push(item.label)
      field.push({
        metric: item.label,
        metric_type: item.dataProperty
      })
    })
  }

  const params = outParams || {
    metric_list: metric,
    param: paramsForm.value.meanValue,
    project_id: props.engineeringInfo.id,
    field,
    input_conditions: JSON.stringify({
      righData1V: metric,
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
