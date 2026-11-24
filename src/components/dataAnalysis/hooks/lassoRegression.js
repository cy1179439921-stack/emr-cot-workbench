import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  console.log('inputParams', inputParams)
  const chartArr = []
  // const tableArr = []
  if (description.cv_plot) {
    chartArr.push({
      type: 'graph',
      name: 'Lasso回归交叉验证图',
      data: description.cv_plot.data,
      layout: description.cv_plot.layout,
      options: {},
      imgUrl: '',
      statement: ''
    })
  }
  chartArr.push({
    type: 'graph',
    name: 'γ与模型回归系数图',
    data: description.coef_path_plot.data,
    layout: description.coef_path_plot.layout,
    options: {},
    imgUrl: '',
    statement: ''
  })
  const data = description.coefficients
  const keys = Object.keys(data.metric_name)
  console.log('keys', keys)
  // 构建结果数组

  const tableData = []
  keys.forEach(key => {
    tableData.push({
      name: data.metric_name[key],
      length: data.coef[key],
      median: data.beta[key],
      r2: description.r2
    })
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: '模型系数表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'name'
            },
            {
              label: '标准化系数',
              prop: 'length'
            },
            {
              label: '非标准化系数',
              prop: 'median'
            },
            {
              label: 'R²',
              prop: 'r2'
            }
          ]
        }
      ],
      columnMerge: keys.length,
      columnIndexArr: [3],
      needFlexColumnWidth: true,
      tableData,
      tableClassName: 'multipleDistributionTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '模型系数表',
    tableArr,
    statement: description.coefficients_res
  })
  chartArr.push({
    type: 'graph',
    name: '模型结果图',
    data: description.pred_plot.data,
    layout: description.pred_plot.layout,
    options: {},
    imgUrl: '',
    statement: ''
  })
  const newInputParams = [
    {
      label: '定量变量',
      value: inputParams.dependent_var
    }, {
      label: '自变量',
      value: inputParams.independent_var.join('、')
    }
  ]
  return {
    node_id: analysisResult.node_id,
    prompt: analysisResult.prompt,
    coreFlag: analysisResult.coreFlag,
    coreDescription: analysisResult.coreDescription,
    input_params: newInputParams,
    resultDescription: analysisResult.result,
    chartArr
  }
}
