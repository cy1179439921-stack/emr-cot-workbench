import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = _.cloneDeep(analysisResult.input_params)
  const chartArr = []
  const tableData1 = description.table_one
  tableData1.forEach(item => {
    item.param = inputParams[0].value
  })
  const tableArr1 = [
    {
      tableHeader: [
        {
          label: 'ADF检验表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'param'
            },

            {
              label: '差分阶数',
              prop: 'diff_order'
            },
            {
              label: 't值',
              prop: 't'
            },
            {
              label: 'P值',
              prop: 'p'
            },
            {
              label: 'AIC',
              prop: 'aic'
            },
            {
              label: '临界值',
              prop: '',
              children: [
                {
                  label: '1%',
                  prop: '1%'
                },
                {
                  label: '5%',
                  prop: '5%'
                },
                {
                  label: '10%',
                  prop: '10%'
                }
              ]
            }
          ]
        }
      ],
      tableData: tableData1,
      columnMerge: tableData1.length,
      columnIndexArr: [0],
      needFlexColumnWidth: true,
      tableClassName: 'ARIMAModelTable1'
    }
  ]
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '模型参数表',
          prop: '',
          children: [
            {
              label: '项',
              prop: 'param'
            },
            {
              label: '符号',
              prop: 'symbol'
            },
            {
              label: '值',
              prop: 'value'
            }
          ]
        }
      ],
      tableData: [
        {
          param: '',
          symbol: '自由度',
          value: description.table_two.df
        },
        {
          param: '样本数量',
          symbol: 'N',
          value: description.table_two.len
        },
        {
          param: 'Q统计量',
          symbol: 'Q6（p值）',
          value: description.table_two.lb_res_6.res
        },
        {
          param: 'Q统计量',
          symbol: 'Q12（p值）',
          value: description.table_two.lb_res_12.res
        },
        {
          param: 'Q统计量',
          symbol: 'Q18（p值）',
          value: description.table_two.lb_res_18.res
        },
        {
          param: 'Q统计量',
          symbol: 'Q24（p值）',
          value: description.table_two.lb_res_24.res
        },
        {
          param: 'Q统计量',
          symbol: 'Q30（p值）',
          value: description.table_two.lb_res_30.res
        },
        {
          param: '信息准则',
          symbol: 'AIC',
          value: description.table_two.aic
        },
        {
          param: '信息准则',
          symbol: 'BIC',
          value: description.table_two.bic
        },
        {
          param: '拟合优度',
          symbol: 'R方',
          value: description.table_two.r2
        }
      ],
      tableClassName: 'ARIMAModelTable2'
    }
  ]
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: `ARIMA模型(${description.table_two.order?.toString()})`,
          prop: '',
          children: [
            {
              label: '',
              prop: 'name'
            },
            {
              label: '系数',
              prop: 'coef'
            },
            {
              label: '标准差',
              prop: 'std_err'
            },
            {
              label: 't',
              prop: 'z'
            },
            {
              label: 'p',
              prop: 'p_value'
            },
            {
              label: '95CI下限',
              prop: '275'
            },
            {
              label: '95CI上限',
              prop: '975'
            }
          ]
        }
      ],
      tableData: description.table_three,
      needFlexColumnWidth: true,
      tableClassName: 'ARIMAModelTable3'
    }
  ]
  const tableData4 = []
  description.forecast.forEach((item, index) => {
    tableData4.push({
      index: index + 1,
      value: item
    })
  })
  const tableArr4 = [
    {
      tableHeader: [
        {
          label: '时间序列预测表',
          prop: '',
          children: [
            {
              label: '预测值',
              prop: '',
              children: [
                {
                  label: '预测单位',
                  prop: 'index'
                },
                {
                  label: '预测结果',
                  prop: 'value'
                }
              ]
            }
          ]
        }
      ],
      tableData: tableData4,
      tableClassName: 'ARIMAModelTable4'
    }
  ]
  const tableData5 = [
    {
      param: 'ARIMA模型',
      mae_format: description.table_four.mae_format,
      mse_format: description.table_four.mse_format,
      rmse_format: description.table_four.rmse_format
    }
  ]
  const tableArr5 = [
    {
      tableHeader: [
        {
          label: '模型准确率评价',
          prop: '',
          children: [
            {
              label: '参数',
              prop: 'param'
            },
            {
              label: 'MAE',
              prop: 'mae_format'
            },
            {
              label: 'MSE',
              prop: 'mse_format'
            },
            {
              label: 'RMSE',
              prop: 'rmse_format'
            }
          ]
        }
      ],
      tableData: tableData5,
      tableClassName: 'ARIMAModelTable4'
    }
  ]
  chartArr.push({
    type: 'table',
    name: 'ADF检验',
    tableArr: tableArr1,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'graph',
    name: '最佳差分序列图',
    data: description.best_adf.data,
    layout: description.best_adf.layout,
    options: {},
    imgUrl: '',
    statement: ''
  })
  chartArr.push({
    type: 'table',
    name: '模型参数表',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  chartArr.push({
    type: 'graph',
    name: '模型残差自相关图（ACF）',
    data: description.acf_plot.data,
    layout: description.acf_plot.layout,
    options: {},
    imgUrl: '',
    statement: description.acf_plot_result
  })
  chartArr.push({
    type: 'graph',
    name: '模型残差偏自相关图（PACF）',
    data: description.pacf_plot.data,
    layout: description.pacf_plot.layout,
    options: {},
    imgUrl: '',
    statement: description.pacf_plot_result
  })
  chartArr.push({
    type: 'table',
    name: 'ARIMA模型',
    tableArr: tableArr3,
    statement: description.table_three_result
  })
  chartArr.push({
    type: 'graph',
    name: '时间序列图',
    data: description.forecast_plot.data,
    layout: description.forecast_plot.layout,
    options: {},
    imgUrl: '',
    statement: description.forecast_plot_result
  })
  chartArr.push({
    type: 'table',
    name: '时间序列预测表',
    tableArr: tableArr4,
    statement: description.forecast_result
  })
  chartArr.push({
    type: 'table',
    name: '模型准确率评价',
    tableArr: tableArr5,
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
