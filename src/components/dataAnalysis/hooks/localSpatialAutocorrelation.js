// import { ref } from 'vue'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  chartArr.push({
    type: 'graph',
    name: 'LISA显著性地图',
    data: description.plot_significance.data,
    layout: description.plot_significance.layout,
    options: {},
    imgUrl: '',
    statement: description.plot_significance_res
  })
  chartArr.push({
    type: 'graph',
    name: 'LISA聚类地图',
    data: description.plot_cluster.data,
    layout: description.plot_cluster.layout,
    options: {},
    imgUrl: '',
    statement: description.plot_cluster_res
  })
  chartArr.push({
    type: 'graph',
    name: '局部莫兰指数表',
    data: [],
    layout: {},
    options: {},
    imgUrl: '',
    statement: ['已在原数据集加入3列数据，分别是局部莫兰指数（moran_I），聚类区间（LISA_cluster），显著性（p_value）。']
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
