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
      tableData: handleSWAndKS(description.table_one),
      tableClassName: 'tTestParingTable1',
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
              label: '中位数',
              prop: 'median'
            },
            {
              label: '标准差',
              prop: 'std'
            },
            {
              label: '总个案数(样本量)',
              prop: 'length'
            },
            {
              label: '检验值',
              prop: 'test_num'
            },
            {
              label: '个案数<检验值',
              prop: 'xiaoyu'
            },
            {
              label: '个案数>检验值',
              prop: 'dayu'
            },
            {
              label: '游程数',
              prop: 'run'
            },
            {
              label: 'Z值（统计量）',
              prop: 'z'
            },
            {
              label: 'P值（双尾）',
              prop: 'p'
            }
          ]
        }
      ],
      tableData: description.table_two,
      tableClassName: 'tTestParingTable1',
      needFlexColumnWidth: true
    }
  ]
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
