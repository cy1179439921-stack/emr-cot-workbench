import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  const chartArr = []
  const tableData = description.table_one.table
  tableData.forEach(item => {
    item.F = description.table_one.F
    item.R2 = description.table_one.R2
    item.R2_adj = description.table_one.R2_adj
  })
  tableData.push({
    name: inputParams[0].label + '：' + inputParams[0].value
  })
  const tableArr = [
    {
      tableHeader: [
        {
          label: '线性回归分析结果表',
          prop: '',
          children: [
            {
              label: '线性回归分析结果 n=' + description.table_one.length,
              prop: '',
              children: [
                {
                  label: '',
                  prop: 'name'
                },
                {
                  label: '非标准化系数',
                  prop: 'name',
                  children: [
                    {
                      label: 'B',
                      prop: 'B'
                    },
                    {
                      label: '标准误',
                      prop: 'std'
                    }
                  ]
                },
                {
                  label: '标准化系数',
                  prop: '',
                  children: [
                    {
                      label: 'Beta',
                      prop: 'beta'
                    }
                  ]
                },
                {
                  label: 't值',
                  prop: 't'
                },
                {
                  label: 'P值（双尾）',
                  prop: 'p'
                },
                {
                  label: 'VIF',
                  prop: 'VIF'
                },
                {
                  label: 'R²',
                  prop: 'R2'
                },
                {
                  label: '调整R²',
                  prop: 'R2_adj'
                },
                {
                  label: 'F',
                  prop: 'F'
                }
              ]
            }
          ]
        }
      ],
      columnMerge: 2,
      columnIndexArr: [7, 8, 9],
      lastRowNeedMerge: 10,
      needFlexColumnWidth: true,
      tableData,
      tableClassName: 'oneVariableLinearRegressionTable1'
    }
  ]
  chartArr.push({
    type: 'table',
    name: '线性回归分析结果',
    tableArr,
    statement: description.table_one_res
  })
  chartArr.push({
    type: 'graph',
    name: '拟合效果图',
    data: analysisResult.img.data,
    layout: analysisResult.img.layout,
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
