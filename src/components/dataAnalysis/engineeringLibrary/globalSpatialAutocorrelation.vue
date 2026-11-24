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
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" selectType="single" @handleClick="clickCustomLeft"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" />
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
        <el-form ref="form" :model="paramsForm" label-position="left">
          <el-form-item label="定义邻接矩阵：">
            <el-radio-group v-model="paramsForm.type">
              <el-radio value="queen">Queen邻接</el-radio>
              <el-radio value="rook">Rook邻接</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'GlobalSpatialAutocorrelation',
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
const paramsForm = ref({
  type: 'queen'
})
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
    console.log('leftActiveObj.value', leftActiveObj.value)
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
  }
  // 处理拖拽后的rightActiveObj
  if (rightActiveObj.value.length > 0) {
    rightActiveObj.value = rightActiveObj.value.filter(item => val.some(d => d.label === item.label))
  }
}, { deep: true })

const clickCustomLeft = (item, multiType) => {
  if (rightData1.value.length < 1) {
    clickMultiLeft(item, multiType)
  }
}

const toCustomMultiRight = (value) => {
  toMultiRight(rightData1)
}

const toMultiLeft = (value) => {
  toCommonMultiLeft(value, '', rightData1, rightActiveObj)
}
// 开始分析
const beginAnalysis = async (outParams) => {
  const field = []
  if (!outParams) {
    if (rightData1.value.length === 0) {
      ElMessage.warning(`请选择变量`)
      return false
    }
    rightData1.value.forEach(item => {
      field.push({
        metric: item.label,
        metric_type: item.dataProperty
      })
    })
  }

  const params = outParams || {
    analysis_metrics: rightData1.value[0].label,
    spatial_weight: paramsForm.value.type,
    project_id: props.engineeringInfo.id,
    field,
    input_conditions: JSON.stringify({
      righData1V: [rightData1.value[0].label],
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
      margin-bottom: 10px;
      line-height: 20px;
      font-weight: 600;
    }
    .el-form-item__content {
      .el-radio-group {
        .el-radio .el-radio__label {
          padding-left: 8px;
          color: #343742;
        }
      }
    }
  }
}
</style>
