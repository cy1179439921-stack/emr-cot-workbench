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
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1);clearGoodnessPercentage()" />
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>定性变量(=1)</span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj" @handleClick="clickMultiRight"/>
          </div>
        </div>
      </div>
    </div>
    <div class="main2">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content" v-if="paramsForm.curPercentage.length > 0">
        <commonSubTitle text="指标比例（当前）"></commonSubTitle>
        <el-form label-position="left">
          <div class="groupDiv" v-for="(item, index) in paramsForm.curPercentage" :key="'disabledItem' + index">
            <el-form-item :label="item.label + '：'" >
              <template #label>
                <span :title="item.label + '：'" class="label-with-tooltip">{{ item.label + '：' }}</span>
              </template>
              <el-input type="number" v-no-e v-model="item.value" disabled></el-input>
            </el-form-item>
            <div class="unit"></div>
          </div>
        </el-form>
        <commonSubTitle text="期望比例（预测）"></commonSubTitle>
        <el-form ref="formRef" :model="paramsForm" label-position="left">
          <div class="groupDiv" v-for="(item, index) in paramsForm.group" :key="'item' + index">
            <el-form-item :label="item.label + '：'" :prop="'group.' + index + '.value'" :rules="rules">
              <template #label>
                <span :title="item.label + '：'" class="label-with-tooltip">{{ item.label + '：' }}</span>
              </template>
              <el-input type="number" v-no-e v-model="item.value"></el-input>
            </el-form-item>
            <div class="unit">%</div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'GoodnessChisquareTest',
  inheritAttrs: false
})
import { nextTick, ref, watch } from 'vue'
import { groupLeft, useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { ElMessage } from 'element-plus'
import { getGoodnessPercentage } from '@/api/api_dataAnalysis.js'
import transferButton from '@/components/dataAnalysis/engineeringLibrary/common/transferButton.vue'
import variableDraggable from '@/components/dataAnalysis/engineeringLibrary/common/variableDraggable.vue'
import _ from 'lodash'
import * as math from 'mathjs'
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
  curPercentage: [],
  group: []
})
const validatePass = (rule, value, callback) => {
  // const index = rule.field.split('.')[1]
  if (value === '') {
    callback(new Error('值不能为空'))
  } else {
    callback()
  }
}
const rules = {
  validator: validatePass,
  required: true,
  trigger: 'blur'
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

init('定性', newDataOperateId.value, props.jumpData, handleJumpParams)

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
    toGetGoodnessPercentage(val[0])
  } else {
    paramsForm.value.curPercentage = []
    paramsForm.value.group = []
  }
  // 处理拖拽后的rightActiveObj
  if (rightActiveObj.value.length > 0) {
    rightActiveObj.value = rightActiveObj.value.filter(item => val.some(d => d.label === item.label))
  }
}, { deep: true })
const formRef = ref(null)
const transformProportion = (proportion) => {
  return Object.keys(proportion).map(key => ({
    label: key,
    value: proportion[key]
  }))
}
// 获取当前总体均值
const toGetGoodnessPercentage = async (item) => {
  const params = {
    fieldName: item.label,
    dataOperateId: props.dataOperateId
  }
  const { code, data } = await getGoodnessPercentage(params)
  if (code === 10000) {
    paramsForm.value.curPercentage = transformProportion(data.proportion)
    paramsForm.value.group = _.cloneDeep(paramsForm.value.curPercentage)
    paramsForm.value.group.forEach(item2 => {
      item2.value = ''
    })
    nextTick(() => {
      formRef.value.resetFields()
    })
  }
}
const clickCustomLeft = (item, multiType) => {
  if (rightData1.value.length < 1) {
    clickMultiLeft(item, multiType)
  }
}

// 清空当前值
const clearGoodnessPercentage = () => {
  if (rightActiveObj.value.length > 0) {
    paramsForm.value.curPercentage = []
    paramsForm.value.group = []
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
  const predicted = {}
  if (!outParams) {
    let arr = 0
    paramsForm.value.group.forEach(item => {
      predicted[item.label] = item.value
      arr = math.add(arr, math.bignumber(item.value))
    })
    if (parseInt(math.format(arr)) !== 100) {
      ElMessage.warning('期望比例总和需为100，当前为' + arr + '，请调整比例')
      return false
    }
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
    param: predicted,
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
  padding-right: 3px;
}
:deep(.el-form) {
  margin-top: 12px;
  .groupDiv {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    .el-form-item {
      flex: 1;
      width: 0;
      margin-bottom: 0;
      .el-form-item__label {
        display: inline-block;
        overflow: hidden;
        max-width: 300px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .unit {
      display: flex;
      justify-content: flex-end;
      width: 24px;
      color: var(--theme-text);
    }
  }
}
</style>
