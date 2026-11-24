import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = _.cloneDeep(analysisResult.input_params)
  const chartArr = []
  const columnMerge = description.table_two.variable.length
  const tableData2 = []
  description.table_two.variable.forEach(item => {
    if (item.variable === 'const') {
      tableData2.push(item)
    }
  })
  tableData2[0].variable = '常数'
  description.table_two.variable.forEach(item => {
    if (item.variable !== '常数' && item.variable !== 'const') {
      tableData2.push(item)
    }
  })
  tableData2.push({
    variable: 'R²',
    control_beta: description.table_two.control.R2,
    control_std: '',
    control_t_value: '',
    control_p_value: '',
    stratified_beta: description.table_two.stratified.R2,
    stratified_std: '',
    stratified_t_value: '',
    stratified_p_value: ''
  })
  tableData2.push({
    variable: '调整R²',
    control_beta: description.table_two.control.R2_adj,
    control_std: '',
    control_t_value: '',
    control_p_value: '',
    stratified_beta: description.table_two.stratified.R2_adj,
    stratified_std: '',
    stratified_t_value: '',
    stratified_p_value: ''
  })
  tableData2.push({
    variable: 'F值',
    control_beta: description.table_two.control.F,
    control_std: '',
    control_t_value: '',
    control_p_value: '',
    stratified_beta: description.table_two.stratified.F,
    stratified_std: '',
    stratified_t_value: '',
    stratified_p_value: ''
  })
  tableData2.push({
    variable: '△R²',
    control_beta: description.table_two.control.delta_R2,
    control_std: '',
    control_t_value: '',
    control_p_value: '',
    stratified_beta: description.table_two.stratified.delta_R2,
    stratified_std: '',
    stratified_t_value: '',
    stratified_p_value: ''
  })
  tableData2.push({
    variable: '△F值',
    control_beta: description.table_two.control.delta_F,
    control_std: '',
    control_t_value: '',
    control_p_value: '',
    stratified_beta: description.table_two.stratified.delta_F,
    stratified_std: '',
    stratified_t_value: '',
    stratified_p_value: ''
  })
  tableData2.push({
    variable: `因变量：${inputParams.dependent_var}`
  })
  tableData2.push({
    variable: '注：***、**、*分别代表1%、5%、10%的显著性水平'
  })
  console.log('tableData2', tableData2)
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '分层回归',
          prop: '',
          children: [
            {
              label: '',
              prop: '',
              children: [
                {
                  label: '',
                  prop: 'variable'
                }
              ]
            },
            {
              label: '控制层',
              prop: '',
              children: [
                {
                  label: 'B',
                  prop: 'control_beta'
                },
                {
                  label: '标准差',
                  prop: 'control_std'
                },
                {
                  label: 't',
                  prop: 'control_t_value'
                },
                {
                  label: 'p',
                  prop: 'control_p_value'
                }
              ]
            },
            {
              label: '层次1',
              prop: '',
              children: [
                {
                  label: 'B',
                  prop: 'stratified_beta'
                },
                {
                  label: '标准差',
                  prop: 'stratified_std'
                },
                {
                  label: 't',
                  prop: 'stratified_t_value'
                },
                {
                  label: 'p',
                  prop: 'stratified_p_value'
                }
              ]
            }
          ]
        }
      ],
      columnMerge,
      // columnIndexArr: [0],
      needFlexColumnWidth: true,
      tableData: tableData2,
      tableClassName: 'hierarchicalRegressionTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '分层回归结果',
    tableArr: tableArr2,
    statement: description.table_two_result
  })

  const newInputParams = [
    {
      label: '定量变量',
      value: inputParams.dependent_var
    }, {
      label: '控制变量',
      value: inputParams.control_variable.filter(item => item !== 'const').join('、')
    }, {
      label: '核心变量',
      value: inputParams.stratified_variable.join('、')
    }]

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
