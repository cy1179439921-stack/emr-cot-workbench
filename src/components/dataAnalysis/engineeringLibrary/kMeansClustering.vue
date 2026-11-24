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
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledS="rightData1.length === MULTICOUNT" :disabledR="rightData1.length === MULTICOUNT"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" />
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>自变量(≥1)</span>
            <span class="icons">
              <SvgIcon iconName="icon-shuzi"></SvgIcon>
              <SvgIcon iconName="icon-zimu"></SvgIcon>
            </span>
          </header>
          <el-scrollbar>
            <div class="ul ul-row-1">
              <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)"/>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <div class="main2">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content">
        <el-form ref="formRef" :model="paramsForm" :rules="rules" label-position="left">
          <el-form-item label="模型参数设置：">
            <el-radio-group v-model="paramsForm.modelParams" @change="clearVali">
              <el-radio :value="1">默认</el-radio>
              <el-radio :value="2">手动设置</el-radio>
            </el-radio-group>
          </el-form-item>
          <commonSubTitle text="模型参数"></commonSubTitle>
          <el-form-item label="随机种子：" :class="{'disabled': paramsForm.modelParams === 1}" prop="random_state">
            <el-input type="number" v-no-e v-model="paramsForm.random_state" :disabled="paramsForm.modelParams === 1" placeholder="请填写"></el-input>
          </el-form-item>
          <el-form-item label="聚类数量：" :class="{'disabled': paramsForm.modelParams === 1}" prop="n_clusters">
            <el-input type="number" v-no-e v-model="paramsForm.n_clusters" :disabled="paramsForm.modelParams === 1" placeholder="数值范围2-20的整数"></el-input>
          </el-form-item>
          <el-form-item label="迭代次数：" :class="{'disabled': paramsForm.modelParams === 1}" prop="max_iter">
            <el-input type="number" v-no-e v-model="paramsForm.max_iter" :disabled="paramsForm.modelParams === 1" placeholder="数值范围10-500的整数"></el-input>
          </el-form-item>
          <el-form-item label="是否在原数据集保存聚类效果：" :class="{'disabled': paramsForm.modelParams === 1}">
            <el-radio-group v-model="paramsForm.copy_x" :disabled="paramsForm.modelParams === 1">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'kMeansClustering',
  inheritAttrs: false
})
import { ref, watch } from 'vue'
import { groupLeft, useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { ElMessage } from 'element-plus'
import transferButton from '@/components/dataAnalysis/engineeringLibrary/common/transferButton.vue'
import variableDraggable from '@/components/dataAnalysis/engineeringLibrary/common/variableDraggable.vue'
// import { MULTICOUNT } from '@/components/dataAnalysis/utils/commonData'
const MULTICOUNT = 20
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

const formRef = ref(null) // 表单Ref
const newDataOperateId = ref(props.dataOperateId)
const emits = defineEmits(['showLoading', 'getResultData', 'saveData'])
const allSearch = ref('')
const leftAllData = ref([])
const leftData = ref([])
const rightData1 = ref([])
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])

const paramsForm = ref({
  random_state: 123, // 随机种子
  modelParams: 1,
  n_clusters: 2, // 聚类数量
  max_iter: 300, // 迭代次数
  copy_x: true // 是否在原数据集保存聚类效果
})

const validateSplit3 = (rule, value, callback) => {
  const regex = /^[1-9]\d*$/
  if (!regex.test(value)) {
    callback(new Error('必须是2-20的整数'))
  } else if (value < 2 || value > 20) {
    callback(new Error('数值范围2-20'))
  } else {
    callback()
  }
}
const validateSplit4 = (rule, value, callback) => {
  const regex = /^[1-9]\d*$/
  if (!regex.test(value)) {
    callback(new Error('必须是10-500的整数'))
  } else if (value < 10 || value > 500) {
    callback(new Error('数值范围10-500'))
  } else {
    callback()
  }
}

const rules = {
  max_iter: [{ required: true, message: '数值范围10-500的整数', trigger: 'blur' }, { validator: validateSplit4, trigger: 'blur' }],
  n_clusters: [{ required: true, message: '数值范围2-20的整数', trigger: 'blur' }, { validator: validateSplit3, trigger: 'blur' }]
}

// 若回调成功，一定是跳转的
const handleJumpParams = () => {
  if (props.jumpData && props.jumpData.smallGroup === props.currentNode.name) {
    const inputConditions = JSON.parse(JSON.parse(props.jumpData.params).input_conditions)
    inputConditions.righData1V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
      toMultiRight(rightData1)
    })
    paramsForm.value = inputConditions.paramsForm
  }
}
const { init, searchAll, clickMultiLeft, toMultiRight, toCommonMultiLeft, clickMultiRight, sendRequest, selectVariable } = useData(leftAllData, leftData, allSearch, leftActiveObj, rightActiveObj1)

init('', newDataOperateId.value, props.jumpData, handleJumpParams)

const groupRight1 = ref({
  name: 'groupA',
  put: () => {
    return rightData1.value.length < MULTICOUNT
  }
})

watch(() => rightData1.value, (val) => {
  if (val.length === MULTICOUNT) {
    leftActiveObj.value = []
  }

  // 处理拖拽后的rightActiveObj1
  if (rightActiveObj1.value.length > 0) {
    const arr = rightActiveObj1.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj1.value = arr
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

const clickCustomLeft = (item, multiType) => {
  if ((rightData1.value.length < MULTICOUNT)) {
    clickMultiLeft(item, multiType)
  }
}

const clickCustomMultiRight = (value, item, multiType) => {
  clickMultiRight(item, multiType, rightActiveObj1)
}
const toCustomMultiRight = (value) => {
  if (leftActiveObj.value.length > 0) {
    if (leftActiveObj.value.length + rightData1.value.length < MULTICOUNT + 1) {
      toMultiRight(rightData1)
    } else {
      ElMessage.warning(`输入变量最多不能超过${MULTICOUNT}`)
    }
    return false
  }
}
const toMultiLeft = (value) => {
  toCommonMultiLeft(value, '', rightData1, rightActiveObj1)
}

const clearVali = (value) => {
  if (value === 1) {
    formRef.value.clearValidate()
  }
}

// 开始分析
const beginAnalysis = async (outParams, cb) => {
  if (!outParams) {
    if (rightData1.value.length < 1) {
      ElMessage.warning(`请选择自变量`)
      return false
    }
    if (paramsForm.value.modelParams === 1) {
      toBeginAnalysis(outParams)
    } else {
      formRef.value.validate(valid => {
        if (valid) {
          toBeginAnalysis(outParams)
        } else {
          cb && cb()
        }
      })
    }
  } else {
    toBeginAnalysis(outParams)
  }
}

// 发送请求
const toBeginAnalysis = async (outParams) => {
  const field = []
  const combinedData = [...rightData1.value]
  combinedData.forEach(item => {
    field.push({
      metric: item.label,
      metric_type: item.dataProperty
    })
  })
  const metric_S = []
  rightData1.value.forEach(item => {
    metric_S.push(item.label)
  })
  const params = outParams || {
    independent_variable: metric_S,
    data_balance: paramsForm.value.data_balance === 0 ? null : paramsForm.value.data_balance, // 数据平衡
    validation_method: paramsForm.value.validation_method, // 验证方式
    project_id: props.engineeringInfo.id,
    field,
    input_conditions: JSON.stringify({
      righData1V: metric_S,
      paramsForm: paramsForm.value
    })
  }

  if (!outParams) {
    if (paramsForm.value.modelParams !== 1) {
      params.random_state = Number(paramsForm.value.random_state)
      params.max_iter = Number(paramsForm.value.max_iter)
      params.n_clusters = Number(paramsForm.value.n_clusters)
      params.copy_x = paramsForm.value.copy_x
    }
  }
  sendRequest(props.isAntdSix, props.currentNode, newDataOperateId, params, emits)
}

defineExpose({
  beginAnalysis,
  selectVariable
})
</script>
<style scoped lang="scss">
@use '@/style/common/variableSelection.scss';
:deep(.el-form-item__label) {
  padding-right: 0;
}
.icons {
  .svg-icon:last-child { margin-left: 4px; }
}
:deep(.el-scrollbar__view) {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.commonSubTitle {
  margin-bottom: 12px;
}
</style>
