import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  // const inputParams = analysisResult.input_params
  const chartArr = []
  const tableArr1 = [
    {
      tableHeader: [
        {
          label: '拟合优度检验表',
          prop: '',
          children: [
            {
              label: '似然比卡方值',
              prop: 'llr'
            },
            {
              label: 'P值',
              prop: 'llr_pvalue'
            },
            {
              label: 'AIC',
              prop: 'aic'
            },
            {
              label: 'BIC',
              prop: 'bic'
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: [description.table_one],
      tableClassName: 'logisticRegressionTable2'
    }
  ]
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '无序logistics回归总效应表',
          prop: '',
          children: [
            {
              label: '变量',
              prop: 'name'
            },
            {
              label: '自由度',
              prop: 'lrdf'
            },
            {
              label: '卡方',
              prop: 'lrstat'
            },
            {
              label: 'P值',
              prop: 'lr_pvalue'
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: description.total_effect_table,
      tableClassName: 'orderlyLogisticsRegressionTable3'
    }
  ]
  const tableData3 = description.table_two
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: '无序logistics回归结果表',
          prop: '',
          children: [
            {
              label: '参数',
              prop: 'name'
            },
            {
              label: '因变量',
              prop: 'dependent_variable_name'
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
      tableClassName: 'unorderedLogisticsRegression3'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '拟合优度检验表',
    tableArr: tableArr1,
    statement: description.table_one_res
  })
  chartArr.push({
    type: 'table',
    name: '无序logistics回归总效应表',
    tableArr: tableArr2,
    statement: description.table_two_res
  })
  chartArr.push({
    type: 'table',
    name: '无序logistics回归结果',
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
