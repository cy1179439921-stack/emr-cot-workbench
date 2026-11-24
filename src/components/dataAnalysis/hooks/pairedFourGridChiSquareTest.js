import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const inputParams = analysisResult.input_params
  console.log('inputParams', inputParams)
  const chartArr = []
  const tableArr = []
  description.table_one.forEach(item => {
    const column1 = []
    let columnMerge = 0
    item.table_one.forEach(item2 => {
      if (item2.name !== '总计') {
        column1.push({
          label: `${item2.name}`, // 使用模版字符串防止item.name为0
          prop: `${item2.name}` // 使用模版字符串防止item.name为0
        })
      }
    })
    const table_one = []
    item.table_one[0].classify.forEach((item3, index) => {
      columnMerge++
      const row = {
        param: item3.name !== 'total' ? item.independent_var : '合计',
        paramValue: item3.name !== 'total' ? item3.name : '合计'
      }
      item.table_one.forEach(item4 => {
        if (item4.name === '总计') {
          row.total = item4.classify[index].count
        } else {
          row[item4.name] = item4.classify[index].count
        }
      })
      row.chi2 = item.table_two.pearson.chi2
      row.p = item.table_two.pearson.p
      table_one.push(row)
    })
    tableArr.push(
      {
        tableHeader: [
          {
            label: '配对卡方结果表',
            prop: '',
            children: [
              {
                label: '配对',
                prop: 'param'
              },
              {
                label: '名称',
                prop: 'paramValue'
              },
              {
                label: inputParams.dependent_var,
                prop: '',
                children: column1
              },
              {
                label: '总计',
                prop: 'total'
              },
              {
                label: 'X²',
                prop: 'chi2'
              },
              {
                label: 'P',
                prop: 'p'
              }
            ]
          }
        ],
        columnMerge,
        columnIndexArr: [0, columnMerge + 2, columnMerge + 3],
        tableData: table_one,
        needFlexColumnWidth: true,
        tableClassName: 'independenceChisquareTestTable1'
      }
    )
  })
  chartArr.push({
    type: 'table',
    name: '配对卡方结果',
    tableArr,
    statement: description.table_one_result
  })
  description.img.forEach((item, index) => {
    chartArr.push({
      type: 'graph',
      name: `交叉列连表热力图${index + 1}`,
      customName: index === 0 ? '2.交叉列连表热力图' : '',
      data: item.img.data,
      layout: item.img.layout,
      options: {},
      imgUrl: '',
      hiddenStatement: index !== description.img.length - 1,
      statement: description.img_result
    })
  })
  const newInputParams = [
    {
      label: '定性资料变量1',
      value: inputParams.dependent_var
    }, {
      label: '定性资料变量2',
      value: inputParams.independent_var.join('、')
    }
  ]
  return {
    node_id: analysisResult.node_id,
    prompt: analysisResult.prompt,
    coreFlag: analysisResult.coreFlag,
    coreDescription: analysisResult.coreDescription,
    input_params: newInputParams,
    resultDescription: analysisResult.result,
    chartArr
  }
}
