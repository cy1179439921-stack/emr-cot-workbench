import _ from 'lodash'
export const handleResult = (analysisResult) => {
  console.log('analysisResult', analysisResult)
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  let columnMerge = 0
  let columnMerge2 = 0
  const table_one = []
  description.table_one.forEach((item, index) => {
    for (const m in item.metrics) {
      if (index === 0) {
        columnMerge++
      }
      const row = {
        param: item.metrics_name,
        property: m,
        length: item.metrics[m].length,
        mean: item.metrics[m].mean,
        std: item.metrics[m].std,
        F: item.F,
        p: item.pvalue
      }
      table_one.push(row)
    }
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: '方差分析结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'param'
            },
            {
              label: '变量值',
              prop: 'property'
            },
            {
              label: '样本量',
              prop: 'length'
            },
            {
              label: '平均值',
              prop: 'mean'
            },
            {
              label: '标准差',
              prop: 'std'
            },
            {
              label: 'F值',
              prop: 'F'
            },
            {
              label: 'P值（双尾）',
              prop: 'p'
            }
          ]
        }
      ],
      columnMerge,
      columnIndexArr: [0, 5, 6],
      needFlexColumnWidth: true,
      tableData: table_one,
      tableClassName: 'postMultipleComparisonTable1'
    }
  ]
  const table_two = []
  description.table_two.forEach((item, index) => {
    item.result.forEach(child => {
      if (index === 0) {
        columnMerge2++
      }
      const row = child
      row.param = item.metric
      table_two.push(row)
    })
  })
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '卡方检验结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'param'
            },
            {
              label: '(I)名称',
              prop: 'group1'
            },
            {
              label: '(J)名称',
              prop: 'group2'
            },
            {
              label: '(I)平均值',
              prop: 'group1_mean'
            },
            {
              label: '(J)平均值',
              prop: 'group2_mean'
            },
            {
              label: '差值(I-J)',
              prop: 'meandiff'
            },
            {
              label: 'P',
              prop: 'p_value'
            }
          ]
        }
      ],
      columnMerge: columnMerge2,
      columnIndexArr: [0],
      needFlexColumnWidth: true,
      tableData: table_two,
      tableClassName: 'postMultipleComparisonTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '方差分析结果',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '卡方检验结果',
    tableArr: tableArr2,
    statement: description.table_two_result
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
