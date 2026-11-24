// import { ref } from 'vue'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  const tableArr = [
    {
      tableHeader: [
        {
          label: '单样本统计表',
          prop: '',
          children: [
            {
              label: '',
              prop: 'metric'
            },
            {
              label: '个案数',
              prop: 'length'
            },
            {
              label: '平均值',
              prop: 'mean'
            },
            {
              label: '标准偏差',
              prop: 'std'
            },
            {
              label: '标准误差平均值',
              prop: 'stand_err'
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: [
        {
          metric: description.table_one.metric,
          length: description.table_one.length,
          mean: description.table_one.mean,
          std: description.table_one.std,
          stand_err: description.table_one.stand_err
        }
      ],
      tableClassName: 'tTestTable1'
    },
    {
      tableHeader: [
        {
          label: '单样本检验表',
          prop: '',
          children: [
            {
              label: '检验值=' + description.table_one.input_param,
              prop: '',
              children: [
                {
                  label: '',
                  prop: 'metric'
                },
                {
                  label: 't值',
                  prop: 'statistic'
                },
                {
                  label: '自由度',
                  prop: 'df'
                },
                {
                  label: 'P值（双尾）',
                  prop: 'pvalue'
                },
                {
                  label: '平均值差值',
                  prop: 'mean_diff'
                }
              ]
            },
            {
              label: '差值95%置信区间',
              prop: '',
              children: [
                {
                  label: '下限',
                  prop: 'min'
                },
                {
                  label: '上限',
                  prop: 'max'
                }
              ]
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: [
        {
          metric: description.table_one.metric,
          statistic: description.table_one.statistic,
          df: description.table_one.df,
          pvalue: description.table_one.pvalue,
          mean_diff: description.table_one.mean_diff,
          min: description.table_one.min,
          max: description.table_one.max
        }
      ],
      tableClassName: 'tTestTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: 'T检验-单样本结果',
    tableArr,
    statement: analysisResult.description.table_one_result
  })
  chartArr.push({
    type: 'graph',
    name: '正态性检验直方图',
    data: analysisResult.img.data,
    layout: analysisResult.img.layout,
    options: {},
    imgUrl: '',
    statement: analysisResult.description.img_result
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
