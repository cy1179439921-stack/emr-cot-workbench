import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  const chartArr = []
  let columnMerge = 0
  const columnArr = []
  const tableData2 = []
  for (const key in description.table_one.metrics) {
    if (key !== 'total') {
      columnArr.push({
        label: key,
        prop: key
      })
    }
  }
  for (const key in description.table_two.metrics) {
    if (key !== 'total') {
      columnMerge++
      tableData2.push({
        param: inputParams[1].value,
        paramValue: key,
        length: description.table_two.metrics[key].length,
        mean: description.table_two.metrics[key].mean,
        std: description.table_two.metrics[key].std,
        F: description.table_two.F,
        P: description.table_two.pvalue
      })
    }
  }
  tableData2.push({
    param: '',
    paramValue: '总计',
    length: description.table_two.metrics.total.length,
    mean: description.table_two.metrics.total.mean,
    std: description.table_two.metrics.total.std,
    F: '',
    P: ''
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: '方差齐性检验',
          prop: '',
          children: [
            {
              label: '',
              prop: 'param'
            },
            {
              label: inputParams[0].value + '(标准差)',
              prop: 'name',
              children: columnArr
            },
            {
              label: 'F值',
              prop: 'F'
            },
            {
              label: 'P值（双尾）',
              prop: 'P'
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: [
        {
          param: inputParams[1].value,
          F: description.table_one.F,
          P: description.table_one.pvalue
        }
      ],
      tableClassName: 'onewayAnovaTable1'
    }
  ]
  for (const key in description.table_one.metrics) {
    tableArr[0].tableData[0][key] = description.table_one.metrics[key].std
  }
  const tableArr2 = [
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
              label: '类别',
              prop: 'paramValue'
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
              prop: 'P'
            }
          ]
        }
      ],
      endMergeRowIndex: columnMerge,
      columnMerge,
      columnIndexArr: [0, 5, 6],
      needFlexColumnWidth: true,
      tableData: tableData2,
      tableClassName: 'onewayAnovaTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '方差齐性检验',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '方差分析结果',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  chartArr.push({
    type: 'graph',
    name: '方差分析均值图',
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
