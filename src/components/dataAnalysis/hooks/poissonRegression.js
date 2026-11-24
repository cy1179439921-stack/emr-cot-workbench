import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  const tableArr1 = [
    {
      tableHeader: [
        {
          label: '过度离散检验表',
          prop: '',
          children: [
            {
              label: '样本量',
              prop: 'len'
            },
            {
              label: '平均值',
              prop: 'mean'
            },
            {
              label: '方差',
              prop: 'std'
            },
            {
              label: 'O值',
              prop: 'O'
            },
            {
              label: 'P值',
              prop: 'p'
            }
          ]
        }
      ],
      tableData: description.table_one,
      tableClassName: 'poissonRegressionTable1',
      needFlexColumnWidth: true
    }
  ]
  const tableData2 = description.table_two.table.filter(item => item.name !== 'const')
  tableData2.forEach(item => {
    item.F_S = description.table_two.F_S
    item.F_p = description.table_two.F_p
    item.R2 = description.table_two.R2
    item.R2_adj = description.table_two.R2_adj
  })
  const tableArr2 = [
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
              prop: 'name',
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
                  label: 'F值',
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
              prop: 'name',
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
      columnMerge: tableData2.length,
      needFlexColumnWidth: true,
      tableData: tableData2,
      tableClassName: 'poissonRegressionTable2'
    }
  ]
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: '泊松回归拟合优度检验表',
          prop: '',
          children: [
            {
              label: '偏差',
              prop: 'deviance'
            },
            {
              label: '校正偏差',
              prop: 'corrected_deviance'
            },
            {
              label: 'Pearson卡方',
              prop: 'pearson_chi2'
            },
            {
              label: '校正Pearson卡方',
              prop: 'corrected_pearson_chi2'
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
      tableData: [description.table_three],
      tableClassName: 'poissonRegressionTable1',
      needFlexColumnWidth: true
    }
  ]
  const tableData4 = description.table_four.filter(item => item.name !== 'const')
  tableData4.forEach(item => {
    item.OR_95confidence_interval1 = item.OR_95confidence_interval[0]
    item.OR_95confidence_interval2 = item.OR_95confidence_interval[1]
  })
  const tableArr4 = [
    {
      tableHeader: [
        {
          label: '泊松回归分析结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'name'
            },
            {
              label: 'B',
              prop: 'B'
            },
            {
              label: '标准误差',
              prop: 'std'
            },
            {
              label: 'wald值',
              prop: 'wald_chi2'
            },
            {
              label: 'p值',
              prop: 'wald_p'
            },
            {
              label: 'RR 95%置信度下限',
              prop: 'OR_95confidence_interval1'
            },
            {
              label: 'RR 95%置信度上限',
              prop: 'OR_95confidence_interval2'
            }
          ]
        }
      ],
      tableData: tableData4,
      tableClassName: 'poissonRegressionTable4',
      needFlexColumnWidth: true
    }
  ]
  chartArr.push({
    type: 'graph',
    name: '箱式图',
    data: analysisResult.box_plot_data.data,
    layout: analysisResult.box_plot_data.layout,
    options: {},
    imgUrl: '',
    statement: description.box_plot_result
  })
  chartArr.push({
    type: 'table',
    name: '过度离散检验表',
    tableArr: tableArr1,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '共性诊断表',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  chartArr.push({
    type: 'table',
    name: '泊松回归拟合优度检验表',
    tableArr: tableArr3,
    statement: description.table_three_result
  })

  chartArr.push({
    type: 'table',
    name: '泊松回归分析结果表',
    tableArr: tableArr4,
    statement: description.table_four_result
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
