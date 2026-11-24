import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  // const inputParams = analysisResult.input_params
  const chartArr = []
  const tableData1 = description.table_ols.table
  tableData1.forEach(item => {
    item.R2 = description.table_ols.R2
    item.R2_adj = description.table_ols.R2_adj
    item.F_S = description.table_ols.F_S
    item.F_p = description.table_ols.F_p
  })
  const tableArr1 = [
    {
      tableHeader: [
        {
          label: '共性诊断表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'name'
            },
            {
              label: '方差分析',
              prop: '',
              children: [
                {
                  label: 'R²',
                  prop: 'R2'
                },
                {
                  label: '调整R²',
                  prop: 'R2_adj'
                },
                {
                  label: 'F',
                  prop: 'F_S'
                },
                {
                  label: 'p值',
                  prop: 'F_p'
                }
              ]
            },
            {
              label: '参数估计',
              prop: '',
              children: [
                {
                  label: 'B',
                  prop: 'B'
                },
                {
                  label: '标准误差',
                  prop: 'std'
                },
                {
                  label: 't值',
                  prop: 't'
                },
                {
                  label: 'p值',
                  prop: 'p'
                },
                {
                  label: 'VIF',
                  prop: 'VIF'
                }
              ]
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: tableData1,
      tableClassName: 'orderlyLogisticsRegressionTable1'
    }
  ]

  const tableData2 = [description.table_one]
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '条件logistics回归模型似然比检验表',
          prop: '',
          children: [
            {
              label: '-2倍对数似然值',
              prop: 'AIC'
            },
            {
              label: '卡方值',
              prop: 'chi2'
            },
            {
              label: '自由度',
              prop: 'df'
            },
            {
              label: 'P值',
              prop: 'p_value'
            }
          ]
        }
      ],
      columnMerge: tableData2.length,
      needFlexColumnWidth: true,
      tableData: tableData2,
      tableClassName: 'conditionalLogisticsRegressionTable2'
    }
  ]
  const tableData3 = description.table_two
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: '有序logistics回归结果表',
          prop: '',
          children: [
            {
              label: '变量',
              prop: 'name'
            },
            {
              label: 'B',
              prop: 'regress_coe'
            },
            {
              label: '标准误差',
              prop: 'se'
            },
            {
              label: 'Wald卡方值',
              prop: 'Wald'
            },
            {
              label: 'p值',
              prop: 'pvalue'
            },
            {
              label: 'OR',
              prop: 'OR'
            },
            {
              label: 'OR 95%置信值',
              prop: '',
              children: [
                {
                  label: '下限',
                  prop: 'lower'
                },
                {
                  label: '上限',
                  prop: 'upper'
                }
              ]
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: tableData3,
      tableClassName: 'orderlyLogisticsRegressionTable3'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '共性诊断表',
    tableArr: tableArr1,
    statement: description.table_one_res
  })
  chartArr.push({
    type: 'table',
    name: '条件logistics回归模型似然比检验表',
    tableArr: tableArr2,
    statement: description.table_two_res
  })
  chartArr.push({
    type: 'table',
    name: '条件logistics回归结果表',
    tableArr: tableArr3,
    statement: description.table_three_res
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
