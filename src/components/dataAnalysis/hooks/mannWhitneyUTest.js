import { handleSWAndKS } from '@/components/dataAnalysis/utils/handleSWAndKS'
import _ from 'lodash'
export const handleResult = (analysisResult) => {
  const description = _.cloneDeep(analysisResult.description)
  const chartArr = []
  // let columnMerge = 0
  // for (let i in description.table_one) {
  //   columnMerge = description.table_one[i].length
  // }
  const columnArr = []
  const tableData2 = []
  for (const key in description.table_one.metrics) {
    if (key !== 'total') {
      columnArr.push({
        label: key,
        prop: key
      })
    }
  }
  description.table_two.forEach(item => {
    for (const key in item) {
      // columnMerge++
      for (const key2 in item[key]) {
        tableData2.push({
          name: key,
          groupName: key2,
          k5: item[key][key2].k5,
          k10: item[key][key2].k10,
          k25: item[key][key2].k25,
          k50: item[key][key2].k50,
          k75: item[key][key2].k75,
          k90: item[key][key2].k90,
          k95: item[key][key2].k95
        })
      }
    }
  })
  console.log('tableData2', tableData2)
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
      // columnMerge: columnMerge,
      needFlexColumnWidth: true,
      tableData: handleSWAndKS(description.table_one),
      tableClassName: 'tTestParingTable1'
    }
  ]
  for (const key in description.table_one.metrics) {
    tableArr[0].tableData[0][key] = description.table_one.metrics[key].std
  }
  const tableArr2 = [
    {
      tableHeader: [
        {
          label: '加权平均百分位数表',
          prop: '',
          children: [
            {
              label: '',
              prop: '',
              children: [
                {
                  label: '变量名',
                  prop: 'name'
                }
              ]
            },
            {
              label: '百分位数',
              prop: '',
              children: [
                {
                  label: '组别',
                  prop: 'groupName'
                },
                {
                  label: '5%',
                  prop: 'k5'
                },
                {
                  label: '10%',
                  prop: 'k10'
                },
                {
                  label: '25%',
                  prop: 'k25'
                },
                {
                  label: '50%',
                  prop: 'k50'
                },
                {
                  label: '75%',
                  prop: 'k75'
                },
                {
                  label: '90%',
                  prop: 'k90'
                },
                {
                  label: '95%',
                  prop: 'k95'
                }
              ]
            }
          ]
        }
      ],
      columnMerge: 2,
      columnIndexArr: [0],
      needFlexColumnWidth: true,
      tableData: tableData2,
      tableClassName: 'mannWhitneyUTestTable2'
    }
  ]
  const tableArr3 = []
  description.table_three.forEach(item => {
    const tableData3 = []

    for (const key in item) {
      for (const d in item[key].T_P) {
        tableData3.push({
          groupName: d,
          value: item[key].T_P[d],
          z: item[key].z,
          p: item[key].p
        })
      }
      tableArr3.push({
        tableHeader: [
          {
            label: '非参数检验结果表',
            prop: '',
            children: [
              {
                label: '类别/变量名',
                prop: 'groupName'
              },
              {
                label: key,
                prop: 'value'
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
        columnMerge: 2,
        columnIndexArr: [2, 3],
        tableData: tableData3,
        tableClassName: 'mannWhitneyUTestTable3'
      })
    }
  })
  chartArr.push({
    type: 'table',
    name: '正态性检验结果',
    tableArr,
    statement: description.table_one_result
  })
  chartArr.push({
    type: 'table',
    name: '百分位数表',
    tableArr: tableArr2,
    statement: description.table_two_result
  })
  analysisResult.img.forEach((item, index) => {
    for (const key in item) {
      chartArr.push({
        type: 'graph',
        name: key + '曼惠特尼U检验频数直方图',
        customName: index === 0 ? '3. 曼惠特尼U检验频数直方图' : '',
        custome: '',
        data: item[key].data,
        layout: item[key].layout,
        options: {},
        imgUrl: '',
        statement: [item[key].img_result]
      })
    }
  })
  chartArr.push({
    type: 'table',
    name: '非参数检验结果',
    customName: '4. 非参数检验结果',
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
