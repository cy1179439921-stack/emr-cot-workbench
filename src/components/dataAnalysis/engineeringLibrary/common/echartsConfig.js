import { echartsToPx, addThousandSeparator } from '@/utils/utils.js'
const colorList = ['#FF4E4E', '#3670F8', '#FAC858', '#04A273', '#9EB5EB', '#283E81', '#91CC75', '#68A400', '#FFA358', '#D599FD', '#8A33C4', '#FC8282', '#5987F3', '#F0AB21']
import lodash, { isArray } from 'lodash'

const generateRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
export const verticalBarChartBasicOption = (config) => {
  const { xAxisData = [], yAxisData = [], name = '', dataZoom, type = '' } = config
  return {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip'>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${addThousandSeparator(params.value)}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    grid: {
      left: echartsToPx(0),
      right: echartsToPx(6),
      top: echartsToPx(10),
      bottom: dataZoom ? echartsToPx(40) : echartsToPx(0),
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      },
      splitLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(54, 112, 248, 0.10)'
        }
      }
    },
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: '#666'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10),
        margin: echartsToPx(8)
      },
      splitLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      },
      data: xAxisData
    },
    series: {
      name,
      data: yAxisData,
      type: 'bar',
      barMaxWidth: echartsToPx(22),
      itemStyle: {
        // 每个柱子的样式设置
        color: function (params) {
          // 设置每个柱子的颜色
          return Number(type) === 1 ? '#3670F8' : colorList[params.dataIndex] || generateRandomColor()
        }
      },
      label: {
        show: false,
        position: 'top',
        fontSize: echartsToPx(10),
        color: '#333333',
        formatter: (params) => {
          return addThousandSeparator(params.value)
        }
      }
    },
    dataZoom
  }
}
export const histogramChartBasicOption = (config) => {
  const { xAxisData = [], yAxisData = [], name = '', dataZoom, type = '' } = config
  return {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip'>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${addThousandSeparator(params.value)}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    grid: {
      left: echartsToPx(0),
      right: echartsToPx(6),
      top: echartsToPx(10),
      bottom: dataZoom ? echartsToPx(40) : echartsToPx(0),
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10)
        // padding: [0, 0, 0, 0]
      },
      axisLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      },
      splitLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(54, 112, 248, 0.10)'
        }
      }
    },
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: '#666'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      triggerEvent: true,
      axisLabel: {
        show: true,
        color: '#666',
        fontSize: echartsToPx(10),
        margin: echartsToPx(8),
        rotate: 60,
        width: echartsToPx(50),
        overflow: 'truncate', // 截断溢出部分
        tooltip: {
          show: true
        }
      },
      splitLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      },
      z: 2,
      zlevel: 2,
      data: xAxisData
    },
    series: {
      name,
      data: yAxisData,
      type: 'bar',
      barCategoryGap: echartsToPx(1),
      itemStyle: {
        // 每个柱子的样式设置
        color: function (params) {
          // 设置每个柱子的颜色
          return Number(type) === 1 ? '#3670F8' : colorList[params.dataIndex] || generateRandomColor()
        }
      },
      label: {
        show: false,
        position: 'top',
        fontSize: echartsToPx(10),
        color: '#333333',
        formatter: (params) => {
          return addThousandSeparator(params.value)
        }
      }
    },
    dataZoom
  }
}

export const pieChartOption = (pieData, colorArr) => {
  const data = pieData?.length > 14 ? pieData.slice(0, 14) : pieData
  return {
    title: {
      text: ''
    },
    silent: !(data?.length),
    tooltip: {
      show: !!(data?.length),
      trigger: 'item',
      formatter: `{b}:{c}（{d}%）`,
      borderWidth: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    legend: {
      show: false,
      type: 'scroll',
      selectedMode: !!(data?.length),
      pageTextStyle: {
        color: '#666666',
        fontSize: echartsToPx(12)
      },
      itemGap: echartsToPx(26),
      itemStyle: {
        borderWidth: 0,
        inactiveWidth: 0
      },
      icon: 'circle',
      itemHeight: echartsToPx(12),
      textStyle: {
        fontSize: echartsToPx(12),
        color: '#666666'
      },
      bottom: 0,
      // bottom: echartsToPx(17),
      padding: 0,
      pageIconInactiveColor: '#999999',
      pageIconColor: '#3670F8',
      pageIconSize: echartsToPx(15)
    },
    series: {
      name: '',
      type: 'pie',
      bottom: echartsToPx(20),
      radius: ['60%', '78%'],
      label: {
        show: !!(data?.length),
        formatter: '{b}：{c}（{d}%)',
        color: '#333',
        position: 'outside',
        alignTo: 'edge',
        lineHeight: echartsToPx(20),
        edgeDistance: echartsToPx(10),
        fontSize: echartsToPx(10)
      },
      labelLine: {
        show: !!(data?.length),
        length: echartsToPx(8), // 调整指线的长度
        length2: echartsToPx(20), // 调整第二段指线的长度
        lineStyle: {
          width: echartsToPx(1) // 调整指线的宽度
        }
      },
      itemStyle: {
        borderRadius: echartsToPx(4),
        borderColor: '#fff',
        borderWidth: echartsToPx(1)
      },
      data: (data?.length) ? data : [{ name: '无', value: 0 }]
    },
    color: (data?.length) ? ((colorArr?.length) ? colorArr : colorList) : ['rgb(201,201,201)']
  }
}

export const linesChartsOption = (config) => {
  const { xAxisData = [], yAxisData = [] } = config
  return {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip'>
                <div class='echartsTooltipContent'>
                   <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                   <div class='echartsTooltipXName'>${params.name}</div>
                  <div class='echartsTooltipValue'>
                  ${addThousandSeparator(params.value)}
                  </div>
                </div>
              </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    color: ['#3670F8'],
    grid: {
      left: echartsToPx(0),
      right: echartsToPx(6),
      top: echartsToPx(10),
      bottom: echartsToPx(0),
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10)

      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        },
        formatter: (value) => {
          return lodash.isInteger(value) ? value : '' // 判断y轴数值为整数的才显示
        }
      },
      splitLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(54, 112, 248, 0.10)'
        }
      }
    },
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: '#666'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10),
        margin: echartsToPx(8)
      },
      splitLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      },
      data: xAxisData
    },
    series: {
      data: yAxisData,
      yAxisIndex: 0,
      type: 'line',
      symbolSize: echartsToPx(8),
      smooth: true,
      lineStyle: {
        width: echartsToPx(2)
      }
    }
  }
}

export const scatterChartsOption = (config) => {
  const { xAxisData = [], yAxisData = [], name = '', chartsType = 'single' } = config
  let series = {
    name,
    data: yAxisData,
    type: 'scatter',
    symbolSize: echartsToPx(8),
    label: {
      show: false
    }
  }
  if (chartsType === 'multiple') {
    series = []
    yAxisData.forEach(item => {
      series.push({
        data: item,
        type: 'scatter',
        large: true,
        largeThreshold: 2000,
        progressive: 300,
        progressiveThreshold: 3000,
        symbolSize: echartsToPx(8),
        label: {
          show: false
        }
      })
    })
  }

  return {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip'>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${addThousandSeparator(params.value)}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    color: ['#3670F8', '#F59F0C'],
    grid: {
      left: echartsToPx(0),
      right: echartsToPx(6),
      top: echartsToPx(10),
      bottom: echartsToPx(0),
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      },
      splitLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(54, 112, 248, 0.10)'
        }
      }
    },
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: '#666'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10),
        margin: echartsToPx(8)
      },
      splitLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      },
      data: xAxisData
    },
    series
  }
}

export const scatterChartsOption2 = (config) => {
  const { dataArr = [], name = '' } = config
  const series = []
  dataArr.forEach(item => {
    series.push({
      name,
      type: 'scatter',
      symbolSize: echartsToPx(8),
      data: item,
      label: {
        show: false
      },
      large: true,
      largeThreshold: 2000,
      progressive: 300,
      progressiveThreshold: 3000
    })
  })

  return {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        if (isArray(params.value)) {
          params.showValue = params.value[1]
        }
        return `<div class='echartsTooltip'>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${addThousandSeparator(params.showValue)}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    color: ['#3670F8', '#F59F0C'],
    grid: {
      left: echartsToPx(0),
      right: echartsToPx(6),
      top: echartsToPx(10),
      bottom: echartsToPx(0),
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      },
      splitLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(54, 112, 248, 0.10)'
        }
      }
    },
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: '#666'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10),
        margin: echartsToPx(8)
      },
      splitLine: {
        lineStyle: {
          color: '#E0E6F1'
        }
      }
    },
    series
  }
}
