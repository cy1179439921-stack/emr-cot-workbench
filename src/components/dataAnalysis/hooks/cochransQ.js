// import { ref } from 'vue'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  let columnMerge = 0
  const table_one = []
  description.table_one.res.forEach((item, index) => {
    columnMerge++
    const row = {
      param: item.name,
      rate0: item.data[0].count,
      rate1: item.data[1].count,
      length: description.table_one.length,
      q: description.table_one.q,
      dof: description.table_one.dof,
      p_value: description.table_one.p_value
    }
    table_one.push(row)
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: "Cochran's Q 检验表",
          prop: '',
          children: [
            {
              label: '',
              prop: 'param'
            },
            {
              label: '频数百分比',
              prop: '',
              children: [
                {
                  label: '0',
                  prop: 'rate0'
                },
                {
                  label: '1',
                  prop: 'rate1'
                }
              ]
            },
            {
              label: '样本量',
              prop: 'length'
            },
            {
              label: "Cochran's Q",
              prop: 'q'
            },
            {
              label: 'df',
              prop: 'dof'
            },
            {
              label: 'P',
              prop: 'p_value'
            }
          ]
        }
      ],
      tableData: table_one,
      columnMerge,
      columnIndexArr: [3, 4, 5, 6],
      needFlexColumnWidth: true,
      tableClassName: 'cochransQTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: "Cochran's Q 检验",
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'graph',
    name: '频数分析堆叠图',
    data: analysisResult.img.data,
    layout: analysisResult.img.layout,
    options: {},
    imgUrl: '',
    statement: description.img_result
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
