import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  // const columnMerge = 0
  const chartArr = []
  const tableArr1 = [
    {
      tableHeader: [
        {
          label: ' OmInbus全局性检验结果表',
          prop: '',
          children: [
            {
              label: '-2倍对数极大似然值',
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
              label: 'P',
              prop: 'p_value'
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: [description.table_one],
      tableClassName: 'proportionalRiskCOXRegressionTable1'
    }
  ]
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: ' 回归系数汇总结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'variable'
            },
            {
              label: '回归系数',
              prop: 'coef'
            },
            {
              label: '标准差',
              prop: 'std'
            },
            {
              label: '自由度',
              prop: 'df'
            },
            {
              label: 'Wald值',
              prop: 'wald'
            },
            {
              label: 'P',
              prop: 'p_value'
            },
            {
              label: 'HR值',
              prop: 'HR'
            },
            {
              label: 'HR值95%置信区间',
              prop: '',
              children: [
                {
                  label: '上限',
                  prop: 'upper'
                },
                {
                  label: '下限',
                  prop: 'lower'
                }
              ]
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: description.table_two,
      tableClassName: 'tTestTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: 'OmInbus全局性检验结果',
    tableArr: tableArr1,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '回归系数汇总结果',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  chartArr.push({
    type: 'graph',
    name: '生存曲线图',
    data: analysisResult.img.data,
    layout: analysisResult.img.layout,
    options: {},
    imgUrl: '',
    statement: description.img_result
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
