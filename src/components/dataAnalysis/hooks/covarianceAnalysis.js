import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = _.cloneDeep(analysisResult.input_params)
  const chartArr = []
  const tableData1 = description.table_one.anova_table
  tableData1.forEach(item => {
    item.R2 = description.table_one.R_squared
    item.R2_adj = description.table_one.R_squared_adj
  })
  const tableArr1 = [
    {
      tableHeader: [
        {
          label: '主体间效应检验',
          prop: '',
          children: [
            {
              label: '项',
              prop: 'Factor'
            },
            {
              label: '平方和',
              prop: 'sum_sq'
            },
            {
              label: '自由度',
              prop: 'df'
            },
            {
              label: '均方',
              prop: 'mean_squared'
            },
            {
              label: 'F',
              prop: 'F'
            },
            {
              label: 'P',
              prop: 'PR(>F)'
            },
            {
              label: 'R²',
              prop: 'R2'
            },
            {
              label: '调整R²',
              prop: 'R2_adj'
            }
          ]
        }
      ],
      columnMerge: tableData1.length,
      columnIndexArr: [6, 7],
      needFlexColumnWidth: true,
      tableData: tableData1,
      tableClassName: 'covarianceAnalysisTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '主体间效应检验',
    tableArr: tableArr1,
    statement: description.table_one_result
  })
  const tableArr2 = []
  inputParams.independent_var.forEach(paramsName => {
    tableArr2.push({
      tableHeader: [
        {
          label: '协方差分析',
          prop: '',
          children: [
            {
              label: paramsName,
              prop: 'Level'
            },
            {
              label: '平均值',
              prop: 'Adjusted_Mean'
            },
            {
              label: '标准误差',
              prop: 'Std_Error'
            },
            {
              label: '95%置信区间下限',
              prop: 'CI_Lower'
            },
            {
              label: '95%置信区间上限',
              prop: 'CI_Upper'
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: description.table_two.filter(item => item.Factor === paramsName),
      tableClassName: 'covarianceAnalysisTable2'
    })
  })
  chartArr.push({
    type: 'table',
    name: '协方差分析',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  if (inputParams.multiple_comparisons_method_name) {
    const tableArr3 = []
    inputParams.independent_var.forEach(paramsName => {
      tableArr3.push(
        {
          tableHeader: [{
            label: '多重比较分析',
            prop: '',
            children: [
              {
                label: `${paramsName}(I）`,
                prop: 'Level1'
              },
              {
                label: `${paramsName}(J）`,
                prop: 'Level2'
              },
              {
                label: '平均值差值',
                prop: 'Mean_Difference'
              },
              {
                label: '标准误差',
                prop: 'Std_Error'
              },
              {
                label: 'P',
                prop: 'P'
              },
              {
                label: '95%置信区间下限',
                prop: 'CI_Lower'
              },
              {
                label: '95%置信区间上限',
                prop: 'CI_Upper'
              }
            ]
          }],
          needFlexColumnWidth: true,
          tableData: description.table_three.filter(item => item.Factor === paramsName),
          tableClassName: 'multipleFactorAnovaTable3'
        })
    })

    chartArr.push({
      type: 'table',
      name: '多重比较分析',
      tableArr: tableArr3,
      statement: description.table_three_result
    })
  }

  const newInputParams = [
    {
      label: '定量资料因变量',
      value: inputParams.dependent_var
    }, {
      label: '定性分组自变量',
      value: inputParams.independent_var.join('、')
    }, {
      label: '定量资料协变量',
      value: inputParams.covariates_var.join('、')
    }
  ]

  return {
    node_id: analysisResult.node_id,
    prompt: analysisResult.prompt,
    coreFlag: analysisResult.coreFlag,
    coreDescription: analysisResult.coreDescription,
    input_params: newInputParams,
    resultDescription: analysisResult.result,
    chartArr
  }
}
