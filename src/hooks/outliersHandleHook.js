// import API from '@/api/api_analysis.js'
import { reactive, ref, computed } from 'vue'
// import _ from 'lodash'

export function useOutliersHandleHook() {
  // Reactive state
  const filterMethod = ref('')
  const scoreNum = ref(null)
  const handleMethod = ref('')
  const paddingMethod = ref('')
  const independentVariable = ref([])
  const paddingNumber = ref(null)
  const metricName = ref('')
  const meanValue = ref(null)
  const txt = ref('')
  const rangeValue = reactive({
    startValue: null,
    endValue: null,
    startSymbol: '>=',
    endSymbol: '<='
  })
  const isSingleVarible = ref(true)
  const projectTabsActive = ref('0')
  const metricList = ref([])
  const startComputingOptions = ref([
    {
      value: '>=',
      label: '≤'
    },
    {
      value: '>',
      label: '<'
    }
  ])
  const endComputingOptions = ref([
    {
      value: '<=',
      label: '≤'
    },
    {
      value: '<',
      label: '<'
    }
  ])
  const options = ref([
    { label: '3_sigma', value: '3_sigma', tooltip: '异常值如超过3倍标准差，那么可以将其视为异常值。' },
    { label: 'IQR', value: 'IQR', tooltip: '超过上四分位+1.5倍IQR距离，或者下四分位-1.5倍IQR距离的点为异常值。' },
    { label: 'z_score', value: 'z_score', tooltip: 'z_score的绝对值大于3的观测值被认为是异常值' },
    { label: '指定固定值', value: 'fixed' },
    { label: '指定区间值', value: 'range_value' },
    { label: '指定标准差', value: 'mean_std' },
    { label: '指定分布区间', value: 'range_percent' }
  ])
  // 处理方法数据
  const handleMethodOptions = reactive([
    { value: 'statisticsFill', label: '统计量填充' },
    { value: 'ruleFill', label: '规则填充' },
    { value: 'returnFill', label: '回归填充' },
    { value: 'multipleImputation', label: '多重插补' }
    // { value: 'randomForestFill', label: '随机森林填充' },
    // { value: 'delete', label: '删除异常值所在行' }
  ])
  const conversionOptions = reactive([
    { label: '对数变换', value: 'logarithm' },
    { label: '平方根变换', value: 'square' },
    { label: '反正弦变换', value: 'inverseSine' },
    { label: '倒数变换', value: 'reciprocal' },
    { label: 'Box-Cox变换', value: 'BoxCox' },
    { label: '最大最小值标准化', value: 'array_minmax' },
    { label: '中心化', value: 'center' }
  ])
  const variableConversionOption = reactive([
    { label: '转换为有序分类变量', value: 'logato_ordered_categoricalrithm' },
    { label: '转换为无序分类变量', value: 'to_unordered_categorical' },
    { label: '用户指定变量切分点', value: 'user_defined_split_points' },
    { label: '根据ROC曲线确定截断值', value: 'roc_curve_cutoff' },
    { label: '字符型变量转换', value: 'character_variable_conversion' },
    { label: '数值型变量转换', value: 'numeric_variable_conversion' },
    { label: '字符串分割为多个子字符串', value: 'split_string_into_substrings' }
  ])
  const proportionalSampling = reactive([
    { label: '分层抽样', value: 'stratified_sampling' },
    { label: '整群抽样', value: 'cluster_sampling' },
    { label: '多阶段抽样', value: 'multistage_sampling' }
  ])
  const mergeSplitSubsetData = reactive([
    { label: '数据合并', value: 'data_merge' },
    { label: '数据拆分', value: 'data_split' },
    { label: '数据取子集', value: 'data_subset' }
  ])
  const paddingOptionsMap = ref({
    statisticsFill: [
      { value: 'fill_with_mean', label: '均值填充' },
      { value: 'fill_with_median', label: '中位数填充' },
      { value: 'fill_with_3sigma', label: '三倍标准差填充' },
      { value: 'fill_with_3sigma_negative', label: '负三倍标准差填充' },
      { value: 'fill_with_mode', label: '众数填充' },
      { value: 'fill_with_0', label: '0值填充' }
    ],
    ruleFill: [
      { value: 'custom', label: '固定值填充' },
      { value: 'previous', label: '空值前边值填充' },
      { value: 'next', label: '空值后边值填充' }
    ],
    returnFill: [
      { value: '1', label: 'Checkbox1' },
      { value: '2', label: 'Checkbox2' },
      { value: '3', label: 'Checkbox3Checkbox3Checkbox3' }
    ]
  })

  // Validation
  const vertify = reactive({
    filterMethod: {
      msg: '请选择异常值筛选方法',
      verify: () => !filterMethod.value
    },
    requiresScoreNum: {
      msg: '信息不完整',
      verify: () => ['z_score', 'fixed', 'mean_std'].includes(filterMethod.value) && handleMethod.value !== 'delete' && !scoreNum.value
    },
    handleMethod: {
      msg: '请选择离群值处理方法',
      verify: () => !handleMethod.value
    },
    paddingMethod: {
      msg: '请选择填充方法',
      verify: () => ['statisticsFill', 'ruleFill', 'fill'].includes(handleMethod.value) && !paddingMethod.value
    },
    paddingNumber: {
      msg: '信息不完整',
      verify: () => ['ruleFill'].includes(handleMethod.value) && ['custom'].includes(paddingMethod.value) && !paddingNumber.value
    },
    independentVariable: {
      msg: '请选择自变量',
      verify: () => handleMethod.value === 'returnFill' && !independentVariable.value.length
    },
    rangeValue: {
      msg: '信息不完整',
      verify: () =>
        ['range_value', 'range_percent'].includes(filterMethod.value) &&
        (!rangeValue.startValue || !rangeValue.endValue) &&
        handleMethod.value !== 'delete'
    },
    rangeValueLegal: {
      msg: '输入值不合法',
      verify: () =>
        ['range_value', 'range_percent'].includes(filterMethod.value) && rangeValue.startValue > rangeValue.endValue
    }
  })

  // Computed properties
  const argumentFill = computed(() => {
    return []
  })

  // Methods
  const toggleChecked = () => {
    metricList.value = []
  }

  const saveBatch = () => {
    for (const k in vertify) {
      if (vertify[k].verify()) {
        console.error(vertify[k].msg)
        return
      }
    }

    let title = ''
    if (handleMethod.value === 'delete') {
      title = '删除'
    } else if (handleMethod.value === 'multipleImputation') {
      title = '多重插补'
    } else {
      title = '填充'
    }
    txt.value = title + '将直接作用到当前数据集上'
    // API.outlierBatchHandle({ /* pass the required parameters */ })
    //   .then(res => {
    //     if (res.code === 10000) {
    //       console.log('操作成功')
    //     } else {
    //       console.error(res.msg)
    //     }
    //   })
    //   .catch(() => {})
  }

  const outlierDataHandle = () => {
    const params = {
      project_id: projectTabsActive.value,
      metric_name: metricName.value,
      outlier_thresh_method: filterMethod.value,
      process_method: handleMethod.value,
      thresh_value: scoreNum.value,
      thresh_value_range: rangeValue
    }
    console.log(params)
    // API.outlierDataHandle(params).then((res) => {
    //   if (res.code === 10000) {
    //     console.log('成功处理数据')
    //   } else {
    //     console.error('处理失败', res.msg)
    //   }
    // }).catch(() => {})
  }

  const saveLagAdjustmentBetweenVariablesHandle = () => {
    if (!isSingleVarible.value) return
    txt.value = '变量间的滞后调整将直接作用到当前数据集上！'
    // API.lagAdjustmentBetweenVariablesHandle({ /* pass the required params */ })
    //   .then((res) => {
    //     if (res.code === 10000) {
    //       console.log('滞后调整成功')
    //     } else {
    //       console.error(res.msg)
    //     }
    //   })
    //   .catch(() => {})
  }

  const saveCrossTableConversion = () => {
    if (!isSingleVarible.value) return
    txt.value = '列联表变换将直接作用到当前数据集上！'
    // API.crossTableConversionDataHandle({ /* pass the required params */ })
    //   .then((res) => {
    //     if (res.code === 10000) {
    //       console.log('列联表转换成功')
    //     } else {
    //       console.error(res.msg)
    //     }
    //   })
    //   .catch(() => {})
  }

  return {
    filterMethod,
    scoreNum,
    handleMethod,
    paddingMethod,
    independentVariable,
    paddingNumber,
    metricName,
    meanValue,
    rangeValue,
    isSingleVarible,
    projectTabsActive,
    metricList,
    startComputingOptions,
    endComputingOptions,
    options,
    handleMethodOptions,
    paddingOptionsMap,
    conversionOptions,
    variableConversionOption,
    proportionalSampling,
    mergeSplitSubsetData,
    vertify,
    argumentFill,
    toggleChecked,
    saveBatch,
    outlierDataHandle,
    saveLagAdjustmentBetweenVariablesHandle,
    saveCrossTableConversion
  }
}
