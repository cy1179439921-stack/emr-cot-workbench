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
            <variableDraggable :list="leftData" :group="groupLeft" :activeObj="leftActiveObj" @handleChange="changeLeftData" @handleClick="clickCustomLeft" :disabledS="rightData1.length === MULTICOUNT" :disabledR="rightData2.length === 1 && rightData1.length === MULTICOUNT"/>
          </div>
        </el-scrollbar>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj1" @handleToRight="toCustomMultiRight(1)" @handleToLeft="toMultiLeft(1)" :isEnough="rightData1.length === MULTICOUNT"/>
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj2" @handleToRight="toCustomMultiRight(2)" @handleToLeft="toMultiLeft(2)" :needVariableType="2" :isEnough="rightData2.length === 1"/>
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>自变量(≥2)</span>
            <span class="icons">
              <SvgIcon iconName="icon-shuzi"></SvgIcon>
              <SvgIcon iconName="icon-zimu"></SvgIcon>
            </span>
          </header>
          <el-scrollbar ref="scrollbarRef">
            <div class="ul">
              <variableDraggable :list="rightData1" :group="groupRight1" :activeObj="rightActiveObj1" @handleClick="element =>clickCustomMultiRight(1, element)" @handleEnd="onEndRight1"/>
            </div>
          </el-scrollbar>
        </div>
        <div class="right1">
          <header class="header">
            <span><pre>二分类因变量(=1)</pre></span>
            <SvgIcon iconName="icon-zimu"></SvgIcon>
          </header>
          <div class="ul">
            <variableDraggable :list="rightData2" :group="groupRight2" :activeObj="rightActiveObj2" @handleClick="element =>clickCustomMultiRight(2, element)"/>
          </div>
        </div>
      </div>
    </div>
    <div class="main2">
      <div class="titleDiv titleDiv2"><i class="iconfont icon-canshushezhi"></i>参数设置</div>
      <div class="main2Content">
        <el-form ref="formRef" :model="paramsForm" :rules="rules" label-position="left">
          <el-form-item label="数据平衡：">
            <el-select v-model="paramsForm.data_balance" clearable placeholder="请选择一项">
              <el-option :label="item.label" :value="item.value" v-for="(item, index) in SELECTOTIONOBJ.options1" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="验证方式：" prop="draw_graphics" >
            <el-select v-model="paramsForm.validation_method" clearable placeholder="请选择一项">
              <el-option :label="item.label" :value="item.value" v-for="(item, index) in SELECTOTIONOBJ.options2" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <div style="display: flex;">
            <el-form-item label="随机种子：" v-if="paramsForm.validation_method !== 'no_validation'">
              <el-input type="number" v-no-e v-model="paramsForm.random_state" placeholder="请填写"></el-input>
            </el-form-item>
            <el-form-item label="验证集占比：" v-if="paramsForm.validation_method === 'random_split'" class="ml10" prop="test_size">
              <el-input type="number" v-no-e v-model="paramsForm.test_size" placeholder="数值范围0-1"></el-input>
            </el-form-item>
            <el-form-item label="折数：" v-if="paramsForm.validation_method === 'k_fold'" class="ml10" prop="k_fold_value">
              <el-input type="number" v-no-e v-model="paramsForm.k_fold_value" placeholder="数值范围1-20"></el-input>
            </el-form-item>
          </div>
          <el-form-item label="模型参数设置：">
            <el-radio-group v-model="paramsForm.modelParams" @change="clearVali">
              <el-radio :value="1">默认</el-radio>
              <el-radio :value="2">手动设置</el-radio>
            </el-radio-group>
          </el-form-item>
          <commonSubTitle text="模型参数"></commonSubTitle>
          <el-form-item label="节点分裂评价准则：" :class="{'disabled': paramsForm.modelParams === 1}">
            <el-select v-model="paramsForm.criterion" clearable placeholder="请选择一项" :disabled="paramsForm.modelParams === 1">
              <el-option :label="item.label" :value="item.value" v-for="(item, index) in SELECTOTIONOBJ.options3" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="决策树数量：" :class="{'disabled': paramsForm.modelParams === 1}" prop="n_estimators">
            <el-input v-model="paramsForm.n_estimators" :disabled="paramsForm.modelParams === 1" placeholder="数值范围5-200"></el-input>
          </el-form-item>
          <el-form-item label="有放回采样：" :class="{'disabled': paramsForm.modelParams === 1}">
            <el-radio-group v-model="paramsForm.oob_score" :disabled="paramsForm.modelParams === 1">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="袋外测试数据：" :class="{'disabled': paramsForm.modelParams === 1}">
            <el-radio-group v-model="paramsForm.bootstrap" :disabled="paramsForm.modelParams === 1">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="划分时最大特征比例：" :class="{'disabled': paramsForm.modelParams === 1}">
            <el-select v-model="paramsForm.max_features" clearable placeholder="请选择一项" :disabled="paramsForm.modelParams === 1" @change="changeMaxFeatures">
              <el-option :label="item.label" :value="item.value" v-for="(item, index) in SELECTOTIONOBJ.options7" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="自定义数值：" :class="{'disabled': paramsForm.modelParams === 1 || paramsForm.max_features === 0}" prop="params8" v-if="paramsForm.max_features === 'custom'">
            <el-input v-model="paramsForm.params8" :disabled="paramsForm.modelParams === 1 || paramsForm.max_features === 0" placeholder="数值范围0-1"></el-input>
          </el-form-item>
          <commonSubTitle text="节点分裂设置"></commonSubTitle>
          <el-form-item label="内部节点分裂的最小样本数：" :class="{'disabled': paramsForm.modelParams === 1}" prop="min_samples_split">
            <el-input type="number" v-no-e v-model="paramsForm.min_samples_split" placeholder="整数，最小值为2" :disabled="paramsForm.modelParams === 1"></el-input>
          </el-form-item>
          <el-form-item label="叶子节点的最小样本数：" :class="{'disabled': paramsForm.modelParams === 1}" prop="min_samples_leaf">
            <el-input type="number" v-no-e v-model="paramsForm.min_samples_leaf" placeholder="整数，最小值为1" :disabled="paramsForm.modelParams === 1"></el-input>
          </el-form-item>
          <el-form-item label="叶子节点中样本的最小权重：" :class="{'disabled': paramsForm.modelParams === 1}" prop="min_weight_fraction_leaf">
            <el-input type="number" v-no-e v-model="paramsForm.min_weight_fraction_leaf" placeholder="数值范围0-1" :disabled="paramsForm.modelParams === 1"></el-input>
          </el-form-item>
          <commonSubTitle text="树的规模设置"></commonSubTitle>
          <el-form-item label="树的最大深度：" :class="{'disabled': paramsForm.modelParams === 1}" prop="max_depth">
            <el-input type="number" v-no-e v-model="paramsForm.max_depth" placeholder="整数，数值范围1-20" :disabled="paramsForm.modelParams === 1" ></el-input>
          </el-form-item>
          <el-form-item label="叶子节点的最大数量：" :class="{'disabled': paramsForm.modelParams === 1}" prop="max_leaf_nodes">
            <el-input type="number" v-no-e v-model="paramsForm.max_leaf_nodes" placeholder="整数，最小值为2" :disabled="paramsForm.modelParams === 1" ></el-input>
          </el-form-item>
          <el-form-item label="节点划分不纯度的阈值：" :class="{'disabled': paramsForm.modelParams === 1}" prop="min_impurity_decrease">
            <el-input type="number" v-no-e v-model="paramsForm.min_impurity_decrease" placeholder="数值范围0-1" :disabled="paramsForm.modelParams === 1"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'randomForest',
  inheritAttrs: false
})
import { ref, watch, nextTick } from 'vue'
import { groupLeft, useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { ElMessage } from 'element-plus'
import { checkBinaryVariable } from '@/api/api_dataAnalysis.js'
import transferButton from '@/components/dataAnalysis/engineeringLibrary/common/transferButton.vue'
import variableDraggable from '@/components/dataAnalysis/engineeringLibrary/common/variableDraggable.vue'
import { MULTICOUNT } from '@/components/dataAnalysis/utils/commonData'
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
const rightData2 = ref([])
const leftActiveObj = ref([])
const rightActiveObj1 = ref([])
const rightActiveObj2 = ref([])
const SELECTOTIONOBJ = {
  options1: [
    {
      label: '欠采样',
      value: 'under'
    },
    {
      label: '过采样',
      value: 'over'
    },
    {
      label: '不处理',
      value: 0
    }
  ],
  options2: [
    {
      label: '不验证',
      value: 'no_validation'
    },
    {
      label: '随机拆分为训练集和验证集',
      value: 'random_split'
    },
    {
      label: 'K折交叉验证',
      value: 'k_fold'
    },
    {
      label: '留一交叉验证',
      value: 'loo'
    }
  ],
  options3: [
    {
      label: 'gini',
      value: 'gini'
    },
    {
      label: 'entropy',
      value: 'entropy'
    },
    {
      label: 'log_loss',
      value: 'log_loss'
    }
  ],
  options4: [
    {
      label: 'best',
      value: 'best'
    },
    {
      label: 'random',
      value: 'random'
    }
  ],
  options7: [
    {
      label: '无',
      value: 0
    },
    {
      label: 'sqrt',
      value: 'sqrt'
    },
    {
      label: 'log2',
      value: 'log2'
    },
    {
      label: '自定义',
      value: 'custom'
    }
  ]
}

const paramsForm = ref({
  data_balance: 0,
  validation_method: 'no_validation',
  random_state: 123,
  test_size: 0.3,
  k_fold_value: 5,
  modelParams: 1,
  criterion: 'gini',
  max_features: 0,
  params8: '',
  min_samples_split: 2,
  min_samples_leaf: 1,
  min_weight_fraction_leaf: 0,
  max_depth: 10,
  max_leaf_nodes: 4,
  min_impurity_decrease: 0,
  n_estimators: 100,
  oob_score: true,
  bootstrap: false
})

// 验证集占比校验
const validateSplit1 = (rule, value, callback) => {
  if (value < 0 || value > 1) {
    callback(new Error('数值范围0-1'))
  } else {
    callback()
  }
}
// 折数校验 树的最大深度校验
const validateK = (rule, value, callback) => {
  const regex = /^[1-9]\d*$/
  if (!regex.test(value)) {
    callback(new Error('必须是1-20的整数'))
  } else if (value < 1 || value > 20) {
    callback(new Error('数值范围1-20'))
  } else {
    callback()
  }
}
const validateMinSamplesSplit = (rule, value, callback) => {
  const regex = /^[1-9]\d*$/
  if (!regex.test(value)) {
    callback(new Error('必须是>=2的整数'))
  } else if (value < 2) {
    callback(new Error('数值范围>=2'))
  } else {
    callback()
  }
}
const validateMinSamplesLeaf = (rule, value, callback) => {
  const regex = /^[1-9]\d*$/
  if (!regex.test(value)) {
    callback(new Error('必须是>=1的整数'))
  } else if (value < 1) {
    callback(new Error('数值范围>=1'))
  } else {
    callback()
  }
}
const validateNestimators = (rule, value, callback) => {
  const regex = /^[1-9]\d*$/
  if (!regex.test(value)) {
    callback(new Error('必须是5-200的整数'))
  } else if (value < 5 || value > 200) {
    callback(new Error('数值范围5-200'))
  } else {
    callback()
  }
}

const rules = {
  test_size: [{ required: true, message: '数值范围0-1', trigger: 'blur' }, { validator: validateSplit1, trigger: 'blur' }],
  k_fold_value: [{ required: true, message: '数值范围1-20', trigger: 'blur' }, { validator: validateK, trigger: 'blur' }],
  params8: [{ required: true, message: '数值范围0-1', trigger: 'blur' }, { validator: validateSplit1, trigger: 'blur' }],
  min_samples_split: [{ required: true, message: '数值范围>=2', trigger: 'blur' }, { validator: validateMinSamplesSplit, trigger: 'blur' }],
  min_samples_leaf: [{ required: true, message: '数值范围>=1', trigger: 'blur' }, { validator: validateMinSamplesLeaf, trigger: 'blur' }],
  min_weight_fraction_leaf: [{ required: true, message: '数值范围0-1', trigger: 'blur' }, { validator: validateSplit1, trigger: 'blur' }],
  max_depth: [{ required: true, message: '数值范围1-20', trigger: 'blur' }, { validator: validateK, trigger: 'blur' }],
  max_leaf_nodes: [{ required: true, message: '数值范围>=2', trigger: 'blur' }, { validator: validateMinSamplesSplit, trigger: 'blur' }],
  n_estimators: [{ required: true, message: '数值范围5-200', trigger: 'blur' }, { validator: validateNestimators, trigger: 'blur' }],
  min_impurity_decrease: [{ required: true, message: '数值范围0-1', trigger: 'blur' }, { validator: validateSplit1, trigger: 'blur' }]
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
    inputConditions.righData2V.forEach(label => {
      const objIndex = leftAllData.value.findIndex(obj => obj.label === label)
      leftActiveObj.value.push(leftAllData.value[objIndex])
      toMultiRight(rightData2)
    })
    if (inputConditions.paramsForm.max_features === null) {
      inputConditions.paramsForm.max_features = 0
    }
    if (inputConditions.paramsForm.data_balance === null) {
      inputConditions.paramsForm.data_balance = 0
    }
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
const scrollbarRef = ref(null)
watch(() => rightData1.value, (val) => {
  if (val.length === MULTICOUNT && rightData2.value.length === 1) {
    leftActiveObj.value = []
  } else if (rightData1.value.length === MULTICOUNT) {
    leftActiveObj.value = leftActiveObj.value.filter(item => item.dataProperty !== 1)
  }

  // 处理拖拽后的rightActiveObj1
  if (rightActiveObj1.value.length > 0) {
    const arr = rightActiveObj1.value.filter(item => val.some(d => d.label === item.label))
    rightActiveObj1.value = arr
  }
  nextTick(() => {
    scrollbarRef.value.update()
  })
}, { deep: true })

watch(() => rightData2.value, async (val) => {
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
    }
  }

  if (val.length === 1 && rightData1.value.length === MULTICOUNT) {
    leftActiveObj.value = []
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
      ElMessage.warning('请选择二分类因变量')
      rightData1.value.push(obj)
      rightData2.value = []
    }
  }
}

const clickCustomLeft = (item, multiType) => {
  if ((rightData1.value.length < MULTICOUNT) || (item.dataProperty !== 1 && rightData2.value.length < 1)) {
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
      if (leftActiveObj.value.length + rightData1.value.length < MULTICOUNT + 1) {
        toMultiRight(rightData1)
      } else {
        ElMessage.warning(`输入变量最多不能超过${MULTICOUNT}`)
      }
      return false
    } else if (value === 2) {
      const SLength = leftActiveObj.value.filter(item => item.dataProperty === 1)
      if (leftActiveObj.value.length > 1) {
        ElMessage.warning('请选择1个定性变量')
        return false
      } else if (SLength.length > 0) {
        ElMessage.warning('请选择定性变量')
        return false
      } else if (rightData2.value.length > 0) {
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

const changeMaxFeatures = (value) => {
  if (value === 1) {
    paramsForm.value.params8 = ''
    formRef.value.clearValidate(['params8'])
  }
}
const clearVali = (value) => {
  if (value === 1) {
    formRef.value.clearValidate()
  }
}

// 开始分析
const beginAnalysis = async (outParams, cb) => {
  if (!outParams) {
    if (rightData1.value.length < 2) {
      ElMessage.warning(`请选择2至${MULTICOUNT}个自变量`)
      return false
    }
    if (rightData2.value.length === 0) {
      ElMessage.warning(`请选择因变量`)
      return false
    }

    formRef.value.validateField(['test_size', 'k_fold_value'], (valid) => {
      if (valid) {
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
        cb && cb()
      }
    })
  } else {
    toBeginAnalysis(outParams)
  }
}

// 发送请求
const toBeginAnalysis = async (outParams) => {
  const field = []
  const combinedData = [...rightData1.value, ...rightData2.value]
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
    dependent_variable: rightData2.value[0].label,
    data_balance: paramsForm.value.data_balance === 0 ? null : paramsForm.value.data_balance, // 数据平衡
    validation_method: paramsForm.value.validation_method, // 验证方式
    project_id: props.engineeringInfo.id,
    field,
    input_conditions: JSON.stringify({
      righData1V: metric_S,
      righData2V: [rightData2.value[0].label],
      paramsForm: paramsForm.value
    })
  }

  if (!outParams) {
  // 处理验证方式相关参数
    if (paramsForm.value.validation_method === 'random_split') {
      params.random_state = Number(paramsForm.value.random_state) // 随机种子
      params.test_size = Number(paramsForm.value.test_size) // 验证集占比
    } else if (paramsForm.value.validation_method === 'k_fold') {
      params.random_state = Number(paramsForm.value.random_state) // 随机种子
      params.k_fold_value = Number(paramsForm.value.k_fold_value) // 折数
    } else if (paramsForm.value.validation_method === 'loo') {
      params.random_state = Number(paramsForm.value.random_state) // 随机种子
    }
    // 处理模型参数
    if (paramsForm.value.modelParams === 2) {
      params.model_params = {
        criterion: paramsForm.value.criterion, // 节点分裂评价准则
        n_estimators: Number(paramsForm.value.n_estimators), // 决策树数量
        oob_score: paramsForm.value.oob_score, // 有放回采样
        bootstrap: paramsForm.value.bootstrap, // 袋外测试数据
        max_features: paramsForm.value.max_features === 'custom' ? Number(paramsForm.value.params8) : paramsForm.value.max_features === 0 ? null : paramsForm.value.max_features, // 划分时最大特征数或比例
        min_samples_split: Number(paramsForm.value.min_samples_split), // 内部节点分裂的最小样本数
        min_samples_leaf: Number(paramsForm.value.min_samples_leaf), // 叶子节点的最小样本数
        min_weight_fraction_leaf: Number(paramsForm.value.min_weight_fraction_leaf), // 叶子节点中样本的最小权重
        max_depth: Number(paramsForm.value.max_depth), // 树的最大深度
        max_leaf_nodes: Number(paramsForm.value.max_leaf_nodes), // 叶子节点的最大数量
        min_impurity_decrease: Number(paramsForm.value.min_impurity_decrease) // 节点划分不纯度的阈值
      }
    }
  }

  sendRequest(props.isAntdSix, props.currentNode, newDataOperateId, params, emits, { validation_method: paramsForm.value.validation_method })
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
