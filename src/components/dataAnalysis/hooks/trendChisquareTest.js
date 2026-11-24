import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)

  const table_one = []
  const tableHeader = [
    {
      label: '频数表',
      prop: '',
      children: [
        {
          label: '',
          prop: 'param'
        },
        {
          label: '',
          prop: 'property'
        }
      ]
    }
  ]
  description.table_one[0].classify.forEach((item, index) => {
    tableHeader[0].children.push({
      label: item.name,
      prop: item.name
    })
  })
  description.table_one.forEach(item => {
    const row1 = {
      param: item.name,
      property: '计数'
    }
    item.classify.forEach(child => {
      row1[child.name] = child.count
    })
    const row2 = {
      param: item.name,
      property: '占比'
    }
    item.classify.forEach(child => {
      row2[child.name] = child.rate
    })
    table_one.push(row1, row2)
  })
  const tableOneArr = [
    {
      tableHeader,
      tableData: table_one,
      columnMerge: 2,
      columnIndexArr: [0],
      tableClassName: 'chisquareTestTable1'
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
      param: '线性关联',
      chi2: description.table_two.likelihood.chi2,
      dof: description.table_two.likelihood.dof,
      p: description.table_two.likelihood.p
    }
  ]
  const tableTwoArr = [
    {
      tableHeader: [
        {
          label: '趋势卡方检验结果',
          prop: '',
          children: [
            {
              label: '',
              prop: 'param'
            },
            {
              label: '值',
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
  const chartArr = []
  chartArr.push({
    type: 'table',
    name: '频数表',
    tableArr: tableOneArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '趋势卡方检验结果',
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
