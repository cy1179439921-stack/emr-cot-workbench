import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  const validation_method = analysisResult?.validation_method || ''

  chartArr.push({
    type: 'graph',
    name: `${['random_split', 'k_fold'].includes(validation_method) ? '训练集' : ''}变量重要性图`,
    data: description.feature_importances_plot.data,
    layout: description.feature_importances_plot.layout,
    options: {},
    imgUrl: '',
    statement: description.feature_importances_plot_res
  })
  chartArr.push({
    type: 'graph',
    name: `${['random_split', 'k_fold'].includes(validation_method) ? '训练集' : ''}决策树`,
    data: description.tree_polt.data,
    layout: description.tree_polt.layout,
    options: {},
    imgUrl: '',
    statement: description.tree_polt_res
  })
  const tableData1 = []
  description.tree_dict.Condition.forEach((item, index) => {
    tableData1.push({
      index: index + 1,
      Condition: item,
      Samples: description.tree_dict.Samples[index],
      Success_Cases: description.tree_dict.Success_Cases[index],
      Success_Rate: description.tree_dict.Success_Rate[index]
    })
  })
  const tableArr1 = [
    {
      tableHeader: [
        {
          label: `${['random_split', 'k_fold'].includes(validation_method) ? '训练集' : ''}决策树模型分类规则表`,
          prop: '',
          children: [
            {
              label: '序号',
              prop: 'index',
              width: 60
            },
            {
              label: '条件',
              prop: 'Condition',
              width: 240
            },
            {
              label: '患者例数',
              prop: 'Samples',
              width: 60
            },
            {
              label: '成功例数',
              prop: 'Success_Cases',
              width: 60
            },
            {
              label: '成功率',
              prop: 'Success_Rate',
              width: 60
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: tableData1,
      tableClassName: 'decisionTable1'
    }
  ]
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
  } else if (['bootstrap'].includes(validation_method)) {
    tableArr2[0].tableHeader[0].children.unshift({
      label: '',
      prop: 'name'
    })
    if (tableArr2[0].tableData.length === 2) {
      tableArr2[0].tableData[0].name = '原数据集'
      tableArr2[0].tableData[1].name = 'bootstrap'
    }
  }
  chartArr.push({
    type: 'table',
    name: `${['random_split', 'k_fold'].includes(validation_method) ? '训练集' : ''}决策树模型分类规则`,
    tableArr: tableArr1,
    statement: analysisResult.description.tree_dict_res
  })
  if (description.roc_plot_1) {
    chartArr.push({
      type: 'graph',
      name: `${['random_split', 'k_fold'].includes(validation_method) ? '训练集' : ['bootstrap'].includes(validation_method) ? '原数据集' : ''}ROC曲线`,
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
      name: `${['random_split', 'k_fold'].includes(validation_method) ? '验证集' : ['bootstrap'].includes(validation_method) ? 'bootstrap ' : ''}ROC曲线`,
      data: description.roc_plot_2.data,
      layout: description.roc_plot_2.layout,
      options: {},
      imgUrl: '',
      statement: description.roc_res
    })
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
      name: `${['random_split', 'k_fold'].includes(validation_method) ? '训练集' : ['bootstrap'].includes(validation_method) ? '原数据集' : ''}校准曲线`,
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
      name: `${['random_split', 'k_fold'].includes(validation_method) ? '验证集' : ['bootstrap'].includes(validation_method) ? 'bootstrap ' : ''}校准曲线`,
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
