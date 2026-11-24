import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params

  const findParam = inputParams.find(item => item.label === '分层变量')
  const tableOneArr = []
  const tableThreeArr = []
  description.strata_data.forEach((group, index) => {
    const table_one = []
    const table_three = []
    // 组装第1个表格
    const tableHeader = [
      {
        label: '分层频数表',
        prop: '',
        children: [
          {
            label: findParam.value,
            prop: 'param'
          },
          {
            label: String(group.name),
            prop: '',
            children: [
              {
                label: '',
                prop: 'property'
              }
            ]
          }
        ]
      }
    ]
    group.table_one[0].classify.forEach((item, index) => {
      tableHeader[0].children[1].children.push({
        label: String(item.name),
        prop: String(item.name)
      })
    })
    // 组装第3个表格
    const tableHeader3 = [
      {
        label: '分层卡方检验结果表',
        prop: '',
        children: [
          {
            label: String(group.name),
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
        ]
      }
    ]

    group.table_one.forEach(item => {
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
    tableOneArr.push({
      tableHeader,
      tableData: table_one,
      columnMerge: 2,
      columnIndexArr: [0],
      needFlexColumnWidth: true,
      tableClassName: 'CMHstratifiedChisquareTestTable1'
    })
    const row1 = group.table_two.pearson
    row1.param = '皮尔逊卡方'
    const row2 = group.table_two.adjusted
    row2.param = '连续校正卡方'
    const row3 = group.table_two.fisher
    row3.param = 'Fisher精确检验'
    table_three.push(row1, row2, row3)
    tableThreeArr.push({
      tableHeader: tableHeader3,
      tableData: table_three,
      tableClassName: 'CMHstratifiedChisquareTestTable3'
    })
  })
  // 组装第2个表格
  const table_two = [
    {
      param: '皮尔逊卡方',
      chi2: description.base_table_two.pearson.chi2,
      dof: description.base_table_two.pearson.dof,
      p: description.base_table_two.pearson.p
    },
    {
      param: '连续校正卡方',
      chi2: description.base_table_two.adjusted.chi2,
      dof: description.base_table_two.adjusted.dof,
      p: description.base_table_two.adjusted.p
    },
    {
      param: 'Fisher精确检验',
      chi2: description.base_table_two.fisher.chi2,
      dof: description.base_table_two.fisher.dof,
      p: description.base_table_two.fisher.p
    }
  ]
  const tableTwoArr = [
    {
      tableHeader: [
        {
          label: '整体卡方检验结果表',
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
      tableClassName: 'CMHstratifiedChisquareTestTable2'
    }
  ]
  // 组装第4个表格
  const table_four = [
    {
      param: '卡方',
      value: description.or_table.or_table_one.statistic
    },
    {
      param: '自由度',
      value: description.or_table.or_table_one.dof
    },
    {
      param: 'P值',
      value: description.or_table.or_table_one.p_value
    }
  ]
  const tableFourArr = [
    {
      tableHeader: [
        {
          label: 'OR值同质性检验表',
          prop: '',
          children: [
            {
              label: 'Breslow-day检验',
              prop: '',
              children: [
                {
                  label: '',
                  prop: 'param'
                },
                {
                  label: '',
                  prop: 'value'
                }
              ]
            }
          ]
        }
      ],
      tableData: table_four,
      tableClassName: 'CMHstratifiedChisquareTestTable4'
    }
  ]

  const tableFiveArr = [
    {
      tableHeader: [
        {
          label: 'CMH条件独立性检验表',
          prop: '',
          children: [
            {
              label: 'OR',
              prop: 'or'
            },
            {
              label: 'OR 95% CI',
              prop: 'or_ci'
            },
            {
              label: '卡方',
              prop: 'statistic'
            },
            {
              label: 'P值',
              prop: 'p_value'
            }
          ]
        }
      ],
      tableData: [description.or_table.or_table_two],
      tableClassName: 'CMHstratifiedChisquareTestTable2'
    }
  ]
  const chartArr = []

  chartArr.push({
    type: 'table',
    name: '分层频数表',
    tableArr: tableOneArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '整体卡方检验结果',
    tableArr: tableTwoArr,
    statement: description.table_two_result
  })
  chartArr.push({
    type: 'table',
    name: '分层卡方检验结果',
    tableArr: tableThreeArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: 'OR值同质性检验',
    tableArr: tableFourArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: 'CMH条件独立性检验',
    tableArr: tableFiveArr,
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
