import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  // const columnMerge = 0
  const chartArr = []
  const tableArr = [
    {
      tableHeader: [
        {
          label: '模型数据摘要',
          prop: '',
          children: [
            {
              label: '影响事件变量名',
              prop: 'label_name'
            },
            {
              label: '事件(状态=1)',
              prop: 'event_1'
            },
            {
              label: '删失(状态=0)',
              prop: 'event_0'
            },
            {
              label: '事件数占比',
              prop: 'event_persent'
            },
            {
              label: '整体',
              prop: 'total'
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: description.table_one,
      tableClassName: 'survivalAnalysisTable1'
    }
  ]
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '生存情况的中位数',
          prop: '',
          children: [
            {
              label: '',
              prop: 'group'
            },
            {
              label: '中位数',
              prop: 'median_survival_time'
            },
            {
              label: '95%置信区间下限',
              prop: 'median_ci_lower'
            },
            {
              label: '95%置信区间上限',
              prop: 'median_ci_upper'
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: description.table_two,
      tableClassName: 'survivalAnalysisTable2'
    }
  ]
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: '生存状态差异检验',
          prop: '',
          children: [
            {
              label: '项',
              prop: 'method'
            },
            {
              label: '卡方',
              prop: 'test_statistic'
            },
            {
              label: '自由度',
              prop: 'degree_of_freedom'
            },
            {
              label: 'P值',
              prop: 'p'
            }
          ]
        }
      ],
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: description.table_three,
      tableClassName: 'survivalAnalysisTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '模型数据摘要',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '生存情况的中位数',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  chartArr.push({
    type: 'table',
    name: '生存状态差异检验',
    tableArr: tableArr3,
    statement: description.table_three_result
  })
  chartArr.push({
    type: 'graph',
    name: 'Kaplan-Meier曲线',
    data: description.img.data,
    layout: description.img.layout,
    options: {},
    imgUrl: '',
    statement: description.img_result
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
