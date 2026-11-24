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
    data: analysisResult.img_one.data,
    layout: analysisResult.img_one.layout,
    options: {},
    imgUrl: '',
    statement: description.img_one_result
  })
  const tableData2 = []
  for (const key in description.table_two) {
    if (!['P', 'Z'].includes(key)) {
      tableData2.push({
        name: key,
        length: description.table_two[key].length,
        median: description.table_two[key].median,
        std: description.table_two[key].std,
        totalCount: 20000,
        P: description.table_two.P,
        Z: description.table_two.Z
      })
    }
  }
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
              label: '统计量',
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
      columnIndexArr: [4, 5],
      tableClassName: 'independentKSTest2',
      needFlexColumnWidth: true
    }
  ]
  chartArr.push({
    type: 'table',
    name: '非参数检验结果',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  chartArr.push({
    type: 'graph',
    name: '箱线图对比',
    data: analysisResult.img_two.data,
    layout: analysisResult.img_two.layout,
    options: {},
    imgUrl: '',
    statement: description.img_two_result
  })
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: '非参数检验结果表',
          prop: '',
          children: [
            {
              label: '配对变量',
              prop: 'name'
            },
            {
              label: '中位数±标准差',
              prop: '',
              children: [
                {
                  label: '配对样本一',
                  prop: 'rel1'
                },
                {
                  label: '配对样本二',
                  prop: 'rel2'
                },
                {
                  label: '配对差值',
                  prop: 'rel_diff'
                }
              ]
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
      tableData: description.table_three,
      tableClassName: 'tTestParingTable2',
      needFlexColumnWidth: true
    }
  ]
  chartArr.push({
    type: 'table',
    name: '事后多重比较结果表',
    tableArr: tableArr3,
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
