// import { ref } from 'vue'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  chartArr.push({
    type: 'graph',
    name: 'Moran散点图',
    data: description.plot.data,
    layout: description.plot.layout,
    options: {},
    imgUrl: '',
    statement: description.plot_res
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: '全局莫兰指数表',
          prop: '',
          children: [
            {
              label: '全局莫兰指数I',
              prop: 'Moran\'s I'
            },
            {
              label: '标准差',
              prop: 'Standard Deviation (SD) of Moran\'s I'
            },
            {
              label: 'Z值',
              prop: 'z-value (using randomization)'
            },
            {
              label: 'P值',
              prop: 'P-value'
            }
          ]
        }
      ],
      needFlexColumnWidth: false,
      tableData: [description.table],
      tableClassName: 'survivalAnalysisTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '全局莫兰指数表',
    tableArr,
    statement: description.table_res
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
