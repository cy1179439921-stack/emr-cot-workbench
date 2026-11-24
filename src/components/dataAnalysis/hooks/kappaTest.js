// import { ref } from 'vue'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  const table_one = []
  description.table_one.forEach(item => {
    const row = item.result
    row.metrics = item.metrics
    table_one.push(row)
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: 'Kappa一致性检验结果表',
          prop: '',
          children: [
            {
              label: '配对项',
              prop: 'metrics'
            },
            {
              label: 'Kappa值',
              prop: 'kappa'
            },
            {
              label: '标准误差',
              prop: 'SE'
            },
            {
              label: 'z',
              prop: 'Z'
            },
            {
              label: 'P',
              prop: 'P_value'
            }
          ]
        }
      ],
      tableData: table_one,
      tableClassName: 'kappaTestTable1',
      needFlexColumnWidth: true
    }
  ]
  chartArr.push({
    type: 'table',
    name: 'Kappa一致性检验结果',
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
