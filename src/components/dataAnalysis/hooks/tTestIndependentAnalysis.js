// import { ref } from 'vue'
import { handleSWAndKS } from '@/components/dataAnalysis/utils/handleSWAndKS'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
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
            }
          ]
        }
      ],
      tableData: handleSWAndKS([description.table_one]),
      tableClassName: 'tTestTable-independent1',
      needFlexColumnWidth: true
    }
  ]
  const columnArr2 = []
  for (const key in description.table_two.res) {
    if (key !== 'total') {
      columnArr2.push({
        label: key,
        prop: key
      })
    }
  }
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '方差齐性检验',
          prop: '',
          children: [
            {
              label: '',
              prop: 'param'
            },
            {
              label: inputParams[0].value + '(标准差)',
              prop: 'name',
              children: columnArr2
            },
            {
              label: 'F值',
              prop: 'F'
            },
            {
              label: 'P值（双尾）',
              prop: 'P'
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: [
        {
          param: inputParams[1].value,
          F: description.table_two.levene_test_F,
          P: description.table_two.levene_test_p
        }
      ],
      tableClassName: 'tTestTable-independent2'
    }
  ]
  for (const key in description.table_two.res) {
    tableArr2[0].tableData[0][key] = description.table_two.res[key].std
  }
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: '独立样本T检验结果表',
          prop: '',
          children: [
            {
              label: '方法',
              prop: 'method'
            },
            {
              label: '方差',
              prop: 'std'
            },
            {
              label: '自由度',
              prop: 'dof'
            },
            {
              label: 't值',
              prop: 't'
            },
            {
              label: 'P值',
              prop: 'p'
            }
          ]
        }
      ],
      tableData: description.table_three,
      tableClassName: 'tTestTable-independent3',
      needFlexColumnWidth: true
    }
  ]
  chartArr.push({
    type: 'table',
    name: '总体描述结果',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '方差齐性检验',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  chartArr.push({
    type: 'table',
    name: '独立样本T检验结果',
    tableArr: tableArr3,
    statement: description.table_three_result
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
