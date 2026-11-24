import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  let columnMerge = 0
  const column1 = []

  description.table_one.forEach(item => {
    if (item.name !== '总计') {
      column1.push({
        label: String(item.name),
        prop: String(item.name)
      })
    }
  })
  const table_one = []
  description.table_one[0].classify.forEach((item, index) => {
    columnMerge++
    const row = {
      param: item.name !== 'total' ? inputParams[0].value.split('、')[1] : '总计',
      paramValue: item.name !== 'total' ? item.name : '总计'
    }
    description.table_one.forEach(item2 => {
      if (item2.name === '总计') {
        row.total = item2.classify[index].count
      } else {
        row[item2.name] = item2.classify[index].count
      }
    })
    table_one.push(row)
  })

  const tableArr = [
    {
      tableHeader: [
        {
          label: '配对卡方检验分析结果表',
          prop: '',
          children: [
            {
              label: '',
              prop: 'param'
            },
            {
              label: '',
              prop: 'paramValue'
            },
            {
              label: inputParams[0].value.split('、')[0],
              prop: '',
              children: column1
            },
            {
              label: '总计',
              prop: 'total'
            }
          ]
        }
      ],
      columnMerge,
      columnIndexArr: [0],
      needFlexColumnWidth: true,
      tableData: table_one,
      tableClassName: 'independenceChisquareTestTable1'
    }
  ]

  const tableTwoArr = [
    {
      tableHeader: [
        {
          label: 'McNemar检验结果表',
          prop: '',
          children: [
            {
              label: '自由度',
              prop: 'dof'
            },
            {
              label: 'X²',
              prop: 'chi2'
            },
            {
              label: '精确X²',
              prop: 'exact_p'
            },
            {
              label: 'P值',
              prop: 'p'
            }
          ]
        }
      ],
      tableData: [description.table_two],
      tableClassName: 'chisquareTestTable2'
    }
  ]
  const chartArr = []
  chartArr.push({
    type: 'table',
    name: '配对卡方检验分析结果',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: 'McNemar检验结果',
    tableArr: tableTwoArr,
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
