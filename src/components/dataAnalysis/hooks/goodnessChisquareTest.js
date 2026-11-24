// import { ref } from 'vue'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  const chartArr = []
  let columnMerge = 0
  const tableData1 = description.table_one
  tableData1.forEach(item => {
    item.param = inputParams
  })
  columnMerge = tableData1.length
  const tableArr = [
    {
      tableHeader: [
        {
          label: '拟合优度卡方检验结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'param'
            },
            {
              label: '类别',
              prop: 'name'
            },
            {
              label: '实际频数',
              prop: 'frequency_real'
            },
            {
              label: '期望频数',
              prop: 'frequency_exp'
            },
            {
              label: '实际比例',
              prop: 'proportion_real'
            },
            {
              label: '期望比例',
              prop: 'proportion_exp'
            },
            {
              label: '残差',
              prop: 'residual'
            },
            {
              label: 'X²',
              prop: 'x'
            },
            {
              label: 'P值（双尾）',
              prop: 'p'
            }
          ]
        }
      ],
      columnMerge,
      columnIndexArr: [0, 7, 8],
      tableData: tableData1,
      tableClassName: 'goodnessChisquareTestTable1',
      needFlexColumnWidth: true
    }
  ]
  tableArr[0].tableData.forEach(item => {
    item.param = inputParams[0].value
  })
  chartArr.push({
    type: 'table',
    name: '拟合优度卡方检验结果',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'graph',
    name: '正态性检验直方图',
    data: analysisResult.img.data,
    layout: analysisResult.img.layout,
    options: {},
    imgUrl: '',
    statement: description.img_result
  })
  console.log('调用handleResult')
  return {
    node_id: analysisResult.node_id,
    prompt: analysisResult.prompt,
    coreFlag: analysisResult.coreFlag,
    coreDescription: analysisResult.coreDescription,
    input_params: analysisResult.input_params,
    resultDescription: analysisResult.result,
    chartArr
  }
}
