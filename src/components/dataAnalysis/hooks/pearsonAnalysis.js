import _ from 'lodash'
export const handleResult = (analysisResult) => {
  console.log('analysisResult', analysisResult)
  const description = _.cloneDeep(analysisResult.description)
  // const columnMerge = 0
  const chartArr = []
  const table_one = description.table_one
  // 将后端返回的数据平铺
  const columnMerge = 3
  const data1 = [
    // {
    //   label: '',
    //   prop: 'method'
    // },
    {
      label: '',
      prop: 'paramsName'
    },
    {
      label: '',
      prop: 'tezheng'
    }
  ]
  const tableData = []
  const tezhengArr = ['相关系数', '显著性(双尾)', '个案数']
  const paramsArr = []
  for (const item in table_one) {
    paramsArr.push(item)
    // columnMerge += 3
    data1.push({
      label: item,
      prop: item.replace(/\./g, '__')
    })
  }
  for (const item in table_one) {
    tezhengArr.forEach((d, index) => {
      const json1 = {
        // method: '皮尔逊',
        paramsName: item,
        tezheng: d
      }
      paramsArr.forEach(p => {
        switch (index) {
          case 0:
            json1[p.replace(/\./g, '__')] = table_one[p][item].r
            break
          case 1:
            json1[p.replace(/\./g, '__')] = table_one[p][item].pvalue
            break
          case 2:
            json1[p.replace(/\./g, '__')] = table_one[p][item].n
            break
        }
      })
      tableData.push(json1)
    })
  }
  console.log('tableData', tableData)
  const tableArr = [
    {
      tableHeader: [
        {
          label: analysisResult.name + '结果表',
          prop: '',
          children: data1
        }
      ],
      columnMerge,
      columnIndexArr: [0],
      tableData,
      tableClassName: 'tTestTable-pearson1',
      needFlexColumnWidth: true
    }
  ]
  chartArr.push({
    type: 'table',
    name: analysisResult.name + '结果',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'graph',
    name: '相关系数热力图',
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
