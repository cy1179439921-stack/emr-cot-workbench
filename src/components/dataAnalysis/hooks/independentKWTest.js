// import { ref } from 'vue'
import { handleSWAndKS } from '@/components/dataAnalysis/utils/handleSWAndKS'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  const tableArr = [
    {
      tableHeader: [
        {
          label: '正态性检验结果表',
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
      tableData: handleSWAndKS([description.table_one]),
      tableClassName: 'tTestParingTable1',
      needFlexColumnWidth: true
    }
  ]
  const tableData2 = []
  for (const key in description.table_two) {
    console.log('key', key)
    if (!['P', 'Z', 'metric_S', 'total'].includes(key)) {
      tableData2.push({
        name: description.table_two.metric_S,
        groupName: key,
        length: description.table_two[key].length,
        median: description.table_two[key].median,
        std: description.table_two[key].std,
        skew: description.table_two[key].skew,
        totalCount: 20000,
        P: description.table_two.P,
        Z: description.table_two.Z
      })
    }
  }
  tableData2.push({
    name: description.table_two.metric_S,
    groupName: '总计',
    length: description.table_two.total.length,
    median: description.table_two.total.median,
    std: description.table_two.total.std,
    skew: description.table_two.total.skew,
    totalCount: 20000,
    P: description.table_two.P
  })
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '非参数检验结果表',
          prop: '',
          children: [
            {
              label: '变量名',
              prop: 'name'
            },
            {
              label: '类别',
              prop: 'groupName'
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
              label: '标准差',
              prop: 'std'
            },
            {
              label: 'Z值（统计量）',
              prop: 'Z'
            },
            {
              label: 'P值（双尾）',
              prop: 'P'
            }
          ]
        }
      ],
      tableData: tableData2,
      columnMerge: tableData2.length,
      columnIndexArr: [0, 5, 6],
      tableClassName: 'independentKWTestTable2',
      needFlexColumnWidth: true
    }
  ]
  chartArr.push({
    type: 'table',
    name: '正态性检验结果',
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
  chartArr.push({
    type: 'table',
    name: '非参数检验结果',
    tableArr: tableArr2,
    statement: description.table_two_result
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
