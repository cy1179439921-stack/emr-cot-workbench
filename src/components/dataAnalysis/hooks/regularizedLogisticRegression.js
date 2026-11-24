import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []

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
      name: 'ROC曲线',
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
      name: 'ROC曲线',
      data: description.roc_plot_2.data,
      layout: description.roc_plot_2.layout,
      options: {},
      imgUrl: '',
      statement: description.roc_res
    })
  }

  if (description.model_eval_dict_1) {
    const tableArr2 = [
      {
        tableHeader: [
          {
            label: '模型拟合效果',
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
          }],
        // columnMerge: tableData.length -,
        needFlexColumnWidth: false,
        tableData: [description.model_eval_dict_1],
        tableClassName: 'survivalAnalysisTable1'
      }
    ]
    chartArr.push({
      type: 'table',
      name: '模型拟合效果',
      tableArr: tableArr2,
      statement: description.model_eval_dict_res
    })
  }
  if (description.model_eval_dict_2) {
    const tableArr3 = [
      {
        tableHeader: [
          {
            label: '模型拟合效果',
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
          }],
        // columnMerge: tableData.length -,
        needFlexColumnWidth: false,
        tableData: [description.model_eval_dict_2],
        tableClassName: 'survivalAnalysisTable1'
      }
    ]
    chartArr.push({
      type: 'table',
      name: '模型拟合效果',
      tableArr: tableArr3,
      statement: description.model_eval_dict_res
    })
  }

  if (description.calibration_curve_plot_1) {
    chartArr.push({
      type: 'graph',
      name: '校准曲线',
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
      name: '校准曲线',
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
