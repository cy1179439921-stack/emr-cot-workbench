import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []

  const tableData = description.table_one
  const tableArr = [
    {
      tableHeader: [
        {
          label: '描述统计',
          prop: '',
          children: [
            {
              label: '变量',
              prop: 'name'
            },
            {
              label: 'N',
              prop: 'length'
            },
            {
              label: '最小值',
              prop: 'min'
            },
            {
              label: '最大值',
              prop: 'max'
            },
            {
              label: '均值',
              prop: 'mean'
            },
            {
              label: '标准偏差',
              prop: 'std'
            }
          ]
        }],
      // columnMerge: tableData.length -,
      needFlexColumnWidth: true,
      tableData,
      tableClassName: 'survivalAnalysisTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '描述统计',
    tableArr,
    statement: description.table_one_res
  })

  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '聚类汇总',
          prop: '',
          children: [
            {
              label: '聚类类别',
              prop: 'cluster'
            },
            {
              label: '频数',
              prop: 'num'
            },
            {
              label: '百分比',
              prop: 'percent'
            }
          ]
        }
      ],
      tableData: description.table_cluster_counts,
      needFlexColumnWidth: true,
      tableClassName: 'decisionTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '聚类汇总',
    tableArr: tableArr2,
    statement: description.table_cluster_counts_res
  })
  const types = []
  const params = []
  description.table_clustered_data.forEach(item => {
    if (!types.includes(item.cluster)) {
      types.push(item.cluster)
    }
    if (!params.includes(item.col_name)) {
      params.push(item.col_name)
    }
  })
  const children = []
  types.forEach((item, index) => {
    children.push({
      label: item,
      prop: 'value' + index
    })
  })
  const tableData3 = []
  params.forEach((item, index) => {
    const j = {
      col_name: item
    }
    const obj = description.table_clustered_data.find(o => o.col_name === item)
    j.f_value = obj.f_value
    j.p_value = obj.p_value
    types.forEach((t, tIndex) => {
      const obj2 = description.table_clustered_data.find(o => o.cluster === t && o.col_name === item)
      j['value' + tIndex] = obj2.front_end
    })
    tableData3.push(j)
  })
  const tableArr3 = [
    {
      tableHeader: [
        {
          label: '聚类后差异性',
          prop: '',
          children: [
            {
              label: '变量',
              prop: 'col_name'
            },
            {
              label: '聚类类别',
              prop: 'n',
              children
            },
            {
              label: 'F',
              prop: 'f_value'
            },
            {
              label: 'P',
              prop: 'p_value'
            }
          ]
        }
      ],
      needFlexColumnWidth: true,
      tableData: tableData3,
      tableClassName: 'decisionTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '聚类后差异性分析',
    tableArr: tableArr3,
    statement: description.table_clustered_data_res
  })
  const tableArr5 = [
    {
      tableHeader: [
        {
          label: '评价指标',
          prop: '',
          children: [
            {
              label: '轮廓系数',
              prop: 'Silhouette_Coefficient'
            },
            {
              label: 'DBI',
              prop: 'DBI'
            },
            {
              label: 'CH',
              prop: 'CH'
            }
            // {
            //   label: 'ARI',
            //   prop: 'ARI'
            // },
            // {
            //   label: 'V-measure',
            //   prop: 'V-measure'
            // }
          ]
        }
      ],
      tableData: [description.eval],
      tableClassName: 'decisionTable2'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '数据集聚类标注',
    tableArr: [],
    statement: ['已在原数据集中添加一列，变量名为聚类类别']
  })
  chartArr.push({
    type: 'table',
    name: '评价指标',
    tableArr: tableArr5,
    statement: description.eval_res
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
