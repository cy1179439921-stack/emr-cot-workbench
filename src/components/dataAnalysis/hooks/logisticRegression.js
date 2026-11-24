import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  const chartArr = []
  const tableData1 = description.table_one.table
  tableData1.forEach(item => {
    item.name = description.table_one.duration
  })
  const tableArr1 = [
    {
      tableHeader: [
        {
          label: '二分类因变量基本汇总结果表',
          prop: '',
          children: [
            {
              label: '因变量',
              prop: 'name'
            },
            {
              label: '选项',
              prop: 'label_name'
            },
            {
              label: '频数',
              prop: 'count'
            },
            {
              label: '百分比（%）',
              prop: 'percentage'
            }
          ]
        }
      ],
      columnMerge: 3,
      columnIndexArr: [0],
      needFlexColumnWidth: true,
      tableData: tableData1,
      tableClassName: 'logisticRegressionTable1'
    }
  ]
  const tableData2 = [
    {
      chiValue: description.table_two[0].value,
      p: description.table_two[1].value,
      ac: description.table_two[2].value,
      bc: description.table_two[3].value
    }
  ]
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '模型评价结果表',
          prop: '',
          children: [
            {
              label: '似然比卡方值',
              prop: 'chiValue'
            },
            {
              label: 'P值',
              prop: 'p'
            },
            {
              label: 'AIC',
              prop: 'ac'
            },
            {
              label: 'BIC',
              prop: 'bc'
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: tableData2,
      tableClassName: 'logisticRegressionTable2'
    }
  ]
  const tableData3 = description.table_three.table
  tableData3[0].factor = '常数'
  tableData3.push({
    factor: inputParams[0].label + '：' + inputParams[0].value
  })
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: '二分类逻辑回归结果表',
          prop: '',
          children: [
            {
              label: '自变量',
              prop: 'factor'
            },
            {
              label: '回归系数',
              prop: 'regress_coe'
            },
            {
              label: '标准误差',
              prop: 'se'
            },
            {
              label: 'Wald',
              prop: 'Wald'
            },
            {
              label: 'P值',
              prop: 'pvalue'
            },
            {
              label: 'OR',
              prop: 'OR'
            },
            {
              label: 'OR值95%置信区间',
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
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: tableData3,
      tableClassName: 'logisticRegressionTable3'
    }
  ]
  const tableData4 = [
    {
      acc: description.table_four.acc,
      recall: description.table_four.recall,
      precision: description.table_four.precision,
      F1: description.table_four.F1,
      AUC: description.table_four.AUC
    }
  ]
  const tableArr4 = [
    {
      tableHeader: [
        {
          label: '分类评价指标结果表',
          prop: '',
          children: [
            {
              label: '准确率',
              prop: 'acc'
            },
            {
              label: '召回率',
              prop: 'recall'
            },
            {
              label: '精确率',
              prop: 'precision'
            },
            {
              label: 'F1',
              prop: 'F1'
            },
            {
              label: 'AUC',
              prop: 'AUC'
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: tableData4,
      tableClassName: 'logisticRegressionTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '二分类因变量基本汇总结果',
    tableArr: tableArr1,
    statement: description.table_one_res
  })
  chartArr.push({
    type: 'table',
    name: '模型评价结果',
    tableArr: tableArr2,
    statement: description.table_two_res
  })
  chartArr.push({
    type: 'table',
    name: '二分类逻辑回归结果',
    tableArr: tableArr3,
    statement: description.table_three_res
  })
  chartArr.push({
    type: 'graph',
    name: '混淆矩阵热力图',
    data: analysisResult.heatmap_img.data,
    layout: analysisResult.heatmap_img.layout,
    options: {},
    imgUrl: '',
    statement: description.heatmap_res
  })
  chartArr.push({
    type: 'graph',
    name: '分类评价指标结果',
    data: analysisResult.roc_img.data,
    layout: analysisResult.roc_img.layout,
    options: {},
    imgUrl: '',
    statement: description.roc_res
  })
  chartArr.push({
    type: 'table',
    name: '分类评价指标结果',
    tableArr: tableArr4,
    statement: description.table_four_res
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
