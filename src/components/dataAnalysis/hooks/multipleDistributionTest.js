// import { ref } from 'vue'
import { handleSWAndKS } from '@/components/dataAnalysis/utils/handleSWAndKS'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  // const columnMerge = 0
  const columnArr = []
  const tableData2 = []
  for (const key in description.table_one.metrics) {
    if (key !== 'total') {
      columnArr.push({
        label: key,
        prop: key
      })
    }
  }
  description.table_two.forEach(item => {
    tableData2.push({
      metric: item.metric,
      paramValue: '临界值',
      value1: item.critical_values[0],
      value2: item.critical_values[1],
      value3: item.critical_values[2],
      value4: item.critical_values[3],
      value5: item.critical_values[4]
    })
    tableData2.push({
      metric: item.metric,
      paramValue: '显著性水平',
      value1: item.significance_level[0],
      value2: item.significance_level[1],
      value3: item.significance_level[2],
      value4: item.significance_level[3],
      value5: item.significance_level[4]
    })
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: '总体描述结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'metric'
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
            },
            {
              label: '统计量',
              prop: 'statistic'
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
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '多分布检验结果表',
          prop: '',
          children: [
            {
              label: '',
              prop: 'metric'
            },
            {
              label: '',
              prop: 'paramValue'
            },
            {
              label: '',
              prop: 'value1'
            },
            {
              label: '',
              prop: 'value2'
            },
            {
              label: '',
              prop: 'value3'
            },
            {
              label: '',
              prop: 'value4'
            },
            {
              label: '',
              prop: 'value5'
            }
          ]
        }
      ],
      columnMerge: 2,
      columnIndexArr: [0],
      needFlexColumnWidth: true,
      tableData: tableData2,
      tableClassName: 'multipleDistributionTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '总体描述结果',
    tableArr,
    statement: analysisResult.description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '多分布检验结果',
    tableArr: tableArr2,
    statement: analysisResult.description.table_two_result
  })
  chartArr.push({
    type: 'graph',
    name: '多分布检验频数折线图',
    data: analysisResult.img.data,
    layout: analysisResult.img.layout,
    options: {},
    imgUrl: '',
    statement: analysisResult.description.img_result
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
