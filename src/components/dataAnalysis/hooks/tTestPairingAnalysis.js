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
          label: '配对差值正态检验结果',
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
  console.log('zheshisha', tableArr, handleSWAndKS(description.table_one))
  chartArr.push({
    type: 'table',
    name: '配对差值正态检验结果',
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
  const tableTwo = description.table_two
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '配对样本T检验结果',
          prop: '',
          children: [
            {
              label: '配对变量',
              prop: 'metric'
            },
            {
              label: '平均值±标准差',
              prop: '',
              children: [
                {
                  label: '配对样本一',
                  prop: 'Rel1'
                },
                {
                  label: '配对样本二',
                  prop: 'Rel2'
                },
                {
                  label: '配对差值',
                  prop: 'Rel_diff'
                }
              ]
            },
            {
              label: 't',
              prop: 't'
            },
            {
              label: '自由度',
              prop: 'df'
            },
            {
              label: 'p',
              prop: 'pvalue'
            }
          ]
        }
      ],
      tableData: [
        {
          metric: `${inputParams[0].value}配对${inputParams[1].value}`,
          Rel1: `${tableTwo.Rel1[0]}±${tableTwo.Rel1[1]}`,
          Rel2: `${tableTwo.Rel2[0]}±${tableTwo.Rel2[1]}`,
          Rel_diff: `${tableTwo.Rel_diff[0]}±${tableTwo.Rel_diff[1]}`,
          t: tableTwo.t,
          df: tableTwo.df,
          pvalue: tableTwo.pvalue
        }
      ],
      tableClassName: 'tTestParingTable2',
      needFlexColumnWidth: true
    }
  ]
  chartArr.push({
    type: 'table',
    name: '配对样本T检验结果',
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
