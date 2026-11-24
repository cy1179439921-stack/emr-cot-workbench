import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  const validation_method = analysisResult?.validation_method || ''

  const tableData = [
    {
      index: 1,
      text: '发生',
      val1: description.cm_dict.TP,
      val2: description.cm_dict.FN
    },
    {
      index: 2,
      text: '未发生',
      val1: description.cm_dict.FP,
      val2: description.cm_dict.TN
    }
  ]
  const tableArr = [
    {
      tableHeader: [
        {
          label: '分类结果表',
          prop: '',
          children: [
            {
              label: '混淆矩阵',
              prop: 'index'
            },
            {
              label: '',
              prop: 'text'

            },
            {
              label: '预测值',
              prop: '',
              children: [
                {
                  label: '发生',
                  prop: 'val1'
                },
                {
                  label: '未发生',
                  prop: 'val2'
                }
              ]
            }
          ]
        }],
      // columnMerge: tableData.length -,
      needFlexColumnWidth: false,
      tableData,
      tableClassName: 'survivalAnalysisTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '分类结果',
    tableArr,
    statement: description.table_res
  })

  if (description.roc_plot_1) {
    chartArr.push({
      type: 'graph',
      name: `${['random_split', 'k_fold', 'loo'].includes(validation_method) ? '训练集' : ''}ROC曲线`,
      data: description.roc_plot_1.data,
      layout: description.roc_plot_1.layout,
      options: {},
      imgUrl: '',
      statement: description.roc_res
    })
  }
  if (description.roc_plot_2) {
    chartArr.push({
      type: 'graph',
      name: `${['random_split', 'k_fold', 'loo'].includes(validation_method) ? '验证集' : ''}ROC曲线`,
      data: description.roc_plot_2.data,
      layout: description.roc_plot_2.layout,
      options: {},
      imgUrl: '',
      statement: description.roc_res
    })
  }

  const tableData2 = []
  if (description.model_eval_dict_1) {
    tableData2.push(description.model_eval_dict_1)
  }
  if (description.model_eval_dict_2) {
    tableData2.push(description.model_eval_dict_2)
  }
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '模型拟合效果表',
          prop: '',
          children: [
            {
              label: 'AUC(95% CI)',
              prop: 'AUC'
            },
            {
              label: '敏感度',
              prop: 'Sensitivity'
            },
            {
              label: '特异度',
              prop: 'Specificity'
            },
            {
              label: '约登指数',
              prop: 'Jorden Index'
            },
            {
              label: 'F1分数',
              prop: 'F1'
            }
          ]
        }
      ],
      tableData: tableData2,
      tableClassName: 'decisionTable2'
    }
  ]
  if (['random_split', 'k_fold'].includes(validation_method)) {
    tableArr2[0].tableHeader[0].children.unshift({
      label: '',
      prop: 'name'
    })
    if (tableArr2[0].tableData.length === 2) {
      tableArr2[0].tableData[0].name = '训练集'
      tableArr2[0].tableData[1].name = '验证集'
    }
  }
  chartArr.push({
    type: 'table',
    name: '模型拟合效果',
    tableArr: tableArr2,
    statement: analysisResult.description.model_eval_dict_res
  })

  if (description.calibration_curve_plot_1) {
    chartArr.push({
      type: 'graph',
      name: `${['random_split', 'k_fold', 'loo'].includes(validation_method) ? '训练集' : ''}校准曲线`,
      data: description.calibration_curve_plot_1.data,
      layout: description.calibration_curve_plot_1.layout,
      options: {},
      imgUrl: '',
      statement: description.calibration_curve_plot_res
    })
  }
  if (description.calibration_curve_plot_2) {
    chartArr.push({
      type: 'graph',
      name: `${['random_split', 'k_fold', 'loo'].includes(validation_method) ? '验证集' : ''}校准曲线`,
      data: description.calibration_curve_plot_2.data,
      layout: description.calibration_curve_plot_2.layout,
      options: {},
      imgUrl: '',
      statement: description.calibration_curve_plot_res
    })
  }

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
