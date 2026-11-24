// import { ref } from 'vue'
import { handleSWAndKS } from '@/components/dataAnalysis/utils/handleSWAndKS'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  // const columnMerge = 0
  const chartArr = []
  const tableArr = [
    {
      tableHeader: [
        {
          label: '总体描述结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'name'
            },
            {
              label: '样本量',
              prop: 'length'
            },
            {
              label: '中位数',
              prop: 'median'
            },
            {
              label: '平均值',
              prop: 'mean'
            },
            {
              label: '标准差',
              prop: 'std'
            },
            {
              label: '偏度',
              prop: 'skew'
            },
            {
              label: '峰度',
              prop: 'kurtosis'
            },
            {
              label: 'S-W检验统计量',
              prop: 'S-w-t'
            },
            {
              label: 'S-W检验P值',
              prop: 'S-w-p'
            },
            {
              label: 'K-S检验统计量',
              prop: 'K-s-t'
            },
            {
              label: 'K-S检验P值',
              prop: 'K-s-p'
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: handleSWAndKS(description.table_one),
      tableClassName: 'multipleDistributionTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '总体描述结果',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'graph',
    name: '正态性检验直方图',
    data: analysisResult.img.data,
    layout: analysisResult.img.layout,
    options: {},
    imgUrl: '',
    statement: description.img_result
  })
  analysisResult.img_pp.forEach((item, index) => {
    chartArr.push({
      type: 'graph',
      name: '正态性检验P-P图',
      customName: index === 0 ? '3. 正态性检验P-P图' : '',
      data: item.value.data,
      layout: item.value.layout,
      options: {},
      imgUrl: '',
      statement: description.pp_result
    })
  })

  analysisResult.img_qq.forEach((item, index) => {
    chartArr.push({
      type: 'graph',
      name: '正态性检验Q-Q图',
      customName: index === 0 ? '4. 正态性检验Q-Q图' : '',
      data: item.value.data,
      layout: item.value.layout,
      options: {},
      imgUrl: '',
      statement: description.qq_result
    })
  })
  const newInputParams = [
    {
      label: '定量变量',
      value: analysisResult.input_params.map(item => item.value).join('、')
    }
  ]
  return {
    node_id: analysisResult.node_id,
    prompt: analysisResult.prompt,
    coreFlag: analysisResult.coreFlag,
    coreDescription: analysisResult.coreDescription,
    input_params: newInputParams,
    resultDescription: analysisResult.result,
    chartArr
  }
}
