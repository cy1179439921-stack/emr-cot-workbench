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
          label: '多因素方差分析结果',
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
      tableClassName: 'multipleFactorAnovaTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '多因素方差分析结果',
    tableArr: tableArr1,
    statement: description.table_one_result
  })
  if (inputParams.multiple_comparisons_method_name) {
    const tableArr2 = []
    inputParams.factors_to_compare.forEach(paramsName => {
      const tableData = description.table_two.filter(item => item.Factor === paramsName)
      if (tableData.length > 0) {
        tableArr2.push(
          {
            tableHeader: [
              {
                label: '事后多重比较结果',
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
                    label: '平均值差值 (I -J）',
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
                    label: '95%置信区',
                    prop: '',
                    children: [
                      {
                        label: '上限',
                        prop: 'CI_Upper'
                      },
                      {
                        label: '下限',
                        prop: 'CI_Lower'
                      }
                    ]
                  }
                ]
              }
            ],
            needFlexColumnWidth: true,
            tableData,
            tableClassName: 'multipleFactorAnovaTable2'
          }
        )
      }
    })
    chartArr.push({
      type: 'table',
      name: '事后多重比较结果',
      tableArr: tableArr2,
      statement: description.table_two_result
    })
  }

  const newInputParams = [
    {
      label: '定量因变量',
      value: inputParams.dependent_var
    }, {
      label: '定性分组自变量',
      value: inputParams.factors_to_compare.join('、')
    }]

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
