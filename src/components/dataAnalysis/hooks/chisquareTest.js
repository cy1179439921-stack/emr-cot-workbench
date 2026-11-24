import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  const chartArr = []
  let columnMerge = 0
  const column1 = []
  description.table_one.forEach(item => {
    if (item.name !== '总计') {
      column1.push({
        label: `${item.name}`, // 使用模版字符串防止item.name为0
        prop: `${item.name}` // 使用模版字符串防止item.name为0
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
          label: '卡方检验分析结果表',
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
      tableData: table_one,
      needFlexColumnWidth: true,
      tableClassName: 'independenceChisquareTestTable1'
    }
  ]
  const table_two = [
    {
      param: '皮尔逊卡方',
      chi2: description.table_two.pearson.chi2,
      dof: description.table_two.pearson.dof,
      p: description.table_two.pearson.p
    },
    {
      param: '连续校正卡方',
      chi2: description.table_two.adjusted.chi2,
      dof: description.table_two.adjusted.dof,
      p: description.table_two.adjusted.p
    },
    {
      param: '似然比卡方',
      chi2: description.table_two.likelihood.chi2,
      dof: description.table_two.likelihood.dof,
      p: description.table_two.likelihood.p
    },
    {
      param: 'Fisher精确检验',
      chi2: description.table_two.fisher.chi2,
      dof: description.table_two.fisher.dof,
      p: description.table_two.fisher.p
    }
  ]
  const tableTwoArr = [
    {
      tableHeader: [
        {
          label: '卡方检验结果',
          prop: '',
          children: [
            {
              label: '',
              prop: 'param'
            },
            {
              label: 'X²',
              prop: 'chi2'
            },
            {
              label: '自由度',
              prop: 'dof'
            },
            {
              label: 'P值',
              prop: 'p'
            }
          ]
        }
      ],
      tableData: table_two,
      tableClassName: 'chisquareTestTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '卡方检验分析结果',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '卡方检验结果',
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
