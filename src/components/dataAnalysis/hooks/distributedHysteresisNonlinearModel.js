import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  chartArr.push({
    type: 'graph',
    name: '时间序列分解图',
    data: description.scatter_plot.data,
    layout: description.scatter_plot.layout,
    options: {},
    imgUrl: '',
    statement: description.scatter_plot_res
  })
  chartArr.push({
    type: 'graph',
    name: '3D图',
    data: description.prediction_plot_2.data,
    layout: description.prediction_plot_2.layout,
    options: {},
    imgUrl: '',
    statement: description.prediction_plot_2_res
  })
  chartArr.push({
    type: 'graph',
    name: '自变量对因变量的滞后效应',
    data: description.prediction_plot_1.data,
    layout: description.prediction_plot_1.layout,
    options: {},
    imgUrl: '',
    statement: description.prediction_plot_1_res
  })
  chartArr.push({
    type: 'graph',
    name: '累计滞后时间下自变量与因变量关系',
    data: description.model_plot.data,
    layout: description.model_plot.layout,
    options: {},
    imgUrl: '',
    statement: description.model_plot_res
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
