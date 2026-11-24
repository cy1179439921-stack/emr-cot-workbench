// import { ref } from 'vue'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  const chartArr = []
  let columnMerge = 0
  const table_one = []
  inputParams.forEach(item => {
    columnMerge++
    const row = {
      param: item.value,
      w: description.table_one.W,
      chi_squared: description.table_one.chi_squared,
      p_value: description.table_one.p_value,
      ranks: description.table_one.ranks[item.value],
      medians: description.table_one.medians[item.value]
    }
    table_one.push(row)
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: 'Kendall一致性检验结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'param'
            },
            {
              label: '秩平均值',
              prop: 'ranks'
            },
            {
              label: '中位数',
              prop: 'medians'
            },
            {
              label: "Kendall's W 系数",
              prop: 'w'
            },
            {
              label: '卡方',
              prop: 'chi_squared'
            },
            {
              label: 'P值',
              prop: 'p_value'
            },
            {
              label: 'P值（双尾）',
              prop: 'p_value'
            }
          ]
        }
      ],
      columnMerge,
      columnIndexArr: [4, 5, 6],
      needFlexColumnWidth: true,
      tableData: table_one,
      tableClassName: 'postMultipleComparisonTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: 'Kendall一致性检验结果',
    tableArr,
    statement: description.table_one_result
  })
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
