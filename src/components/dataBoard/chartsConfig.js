/* eslint-disable no-unused-vars */

import * as echarts from 'echarts'
import { echartsToPx } from '@/utils/utils'
const darkColorList = ['rgba(124, 242, 246, 1)', 'rgba(140, 235, 160, 1)', 'rgba(240, 204, 115, 1)', 'rgba(255, 95, 90, 1)', 'rgba(145, 204, 117, 1)', 'rgba(85, 113, 223, 1)', 'rgba(249, 96, 234, 1)', 'rgba(255, 172, 133, 1)']
const lightColorList = ['rgba(75, 112, 250, 1)', 'rgba(53, 180, 253, 1)', 'rgba(115, 220, 198, 1)', 'rgba(108, 194, 56, 1)', 'rgba(200, 219, 81, 1)', 'rgba(252, 226, 126, 1)', 'rgba(125, 203, 248, 1)', 'rgba(96, 131, 249, 1)']

const darkLineColorList = ['#FF4E4E', '#3670F8', '#FAC858', '#04A273', '#9EB5EB', '#91CC75', '#68A400', '#FFA358', '#D599FD', '#8A33C4']

const pieColorList = ['#FF4E4E', '#FAC858', '#9EB5EB', '#3670F8', '#91CC75', '#04A273', '#68A400', '#FFA358', '#D599FD', '#8A33C4']
// eslint-disable-next-line max-len
const lineSymble = 'image://data:image/png;base64,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'
// eslint-disable-next-line max-len
const symbolIcon = 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAodJREFUSEu9lk1IVFEUx3/nzeg4YeDCFoGS9AEFQW6aMRIqaBO4aGFQOYFhtMmY56ZF5SKK6ANyoiLJAu1zYdRGWhm2sDJdVBTYwsQwUEgoKJwPZ96JN/FmxplpnNK6y3v+9/7Pueec/7lCgbXd1Iow0WaFrcBaoEbArTAGjAk89+LpfhaSb7+7RvIZ/Ednq9RtnBAloFBeyAmBHyrcVXf81MjF8ulsbA6Bv212r6pxHagodHGOTZhWODDSUdafaZtH4DcjpkLHH108HxxHaRu+XHbV2U4R+IPhgIrcyb68qlLYU++ibr1B9Ypf8MkvytAHi97BBJ9nNPtIXIVdTiTJE3VmuEaRd5nv7TLgSIObph2uggHdG0hwrS9OwsqE6YwBm4dC3okkgc+MdAGHHIjXA6HDJdSuNop6rTfjFuaNOcLRNFyQ7lchz0GxS3FWolMoZY65fZ+bBl9hz7OZ+4YTnH4Qz9yOG+g68QUjrQhXHMvGVcIts7Qoz7NBLaEY7z+lc6Kq7eIzI4+B3Yvx3jmbE4XQJz4z+hq01gHdP1bKmpV5+2/BqD5OKfsvxFI4gQmb4Ctoqqn6z5ay3Pt3BN/Dys7jaQIgnkMwcM7DMs+CzuYF5CHgfzzR0iX50YsE53szSjWZ5CUs0+ZLMUYns8r0nzdaUiqC4ZuItDiZs5NsS8WmIqXi7bhFa+ccsbl5etQzHPI2L1rsbj9N0PkkW+yYMdC02Nm8/mA0oKI5cl1dKTTWu9iywcCWbnvZEv1y1OLhYILJYuTaCeyfDpw0SbRRoSuzu4tqu2JGZorEHvouOSlIUzFD38LqocQ6U9TQz/Q2WcIaDYjINk19W9StiP1lGQNd8NvyE8kYK6rDOmBZAAAAAElFTkSuQmCC'
import darkLineSymble from '@/assets/darkLineSymble.png'
import { addThousandSeparator } from '@/utils/utils.js'
import lodash from 'lodash'
export const darkBasicOption = {
  horizontalBarChartBasicOption: {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip darkModeEchartsTooltip'>
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
    // color,
    legend: {},
    grid: {
      left: 0,
      right: echartsToPx(55),
      top: echartsToPx(14),
      bottom: echartsToPx(1),
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.60)',
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(255, 255, 255, 0.20)'
        }
      }
      // boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      // y轴显示不全，鼠标移上去显示全部，记得加上这个
      triggerEvent: true,
      axisLabel: {
        width: echartsToPx(130),
        overflow: 'truncate',
        color: 'rgba(255, 255, 255, 0.60)',
        fontSize: echartsToPx(12),
        // 设置 tooltip 触发类型
        tooltip: {
          show: true
        }
      },
      z: 2,
      zlevel: 2
      // data: yAxisData
    },
    series: {
      // name,
      type: 'bar',
      barWidth: echartsToPx(17),
      // data,
      showBackground: true,
      backgroundStyle: {
        color: '#2D324C'
      },
      // itemStyle: {
      //   borderRadius: 0
      // },
      label: {
        show: true,
        position: 'right',
        fontSize: echartsToPx(10),
        color: '#fff',
        formatter: (params) => {
          return addThousandSeparator(params.value)
        }
      }
    }
  },
  barAndLineChartBasicOption: {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip darkModeEchartsTooltip'>
                  <div class='echartsTooltipName'>${params.seriesName}</div>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${params.value}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      borderColor: 'rgba(0, 0, 0, 0.60)',
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    legend: {
      show: false,
      left: '50%',
      bottom: 0,
      selectedMode: false,
      icon: 'image://' + darkLineSymble,
      itemWidth: echartsToPx(16),
      itemHeight: echartsToPx(12),
      textStyle: {
        fontSize: echartsToPx(12),
        color: '#666'
      }
    },
    grid: {
      left: 0,
      right: echartsToPx(10),
      top: echartsToPx(10),
      bottom: echartsToPx(10),
      containLabel: true
    },
    yAxis: {
      name: '',
      // minInterval: 1,
      position: 'left',
      alignTicks: true,
      type: 'value',
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.60)',
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
          color: 'rgba(255, 255, 255, 0.20)'
        }
      }
      // ...lineConfig?.yAxis
    },
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(255, 255, 255, 0.60)'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.60)',
        margin: echartsToPx(14),
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          color: '#E1EFFD'
        }
      }
      // data: lineConfig?.xAxisData || []
    },
    series: {
      // name: lineConfig?.name,
      yAxisIndex: 0,
      type: 'line',
      symbolSize: echartsToPx(10),
      smooth: true,
      itemStyle: {
        color: '#rgba(250, 200, 88, 0.6)'
      },
      symbol: 'image://' + darkLineSymble,
      lineStyle: {
        color: '#FAC858',
        width: echartsToPx(2)
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(250, 200, 88, 0.6)'
          },
          {
            offset: 1,
            color: 'rgba(250, 200, 88, 0)'
          }
        ])
      }
      // data: lineConfig?.yAxisData || []
    }
  },
  verticalBarChartBasicOption: {
    // title: {
    //   text: '标题',
    //   textStyle: {},
    //   bottom: 0,
    //   left: '50%'
    // },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    // legend: {
    //   left: 0,
    //   icon: 'circle',
    //   top: 26,
    //   textStyle: {
    //     fontSize: 12,
    //     color: '#FFFFFF'
    //   }
    // },
    grid: {
      left: 0,
      right: '5%',
      top: '10%',
      bottom: '5%',
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      }
      // boundaryGap: [0, 0.01]
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      data: []
    },
    series: [
      {
        name: '',
        type: 'bar',
        barMaxWidth: echartsToPx(24),
        // barWidth: echartsToPx(24),
        data: [],
        itemStyle: {
          color: 'rgba(140, 235, 160, 1)',
          borderRadius: [echartsToPx(12), echartsToPx(12), 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          fontSize: echartsToPx(12),
          fontFamily: 'D-DIN',
          color: '#FFFFFF',
          formatter: (params) => {
            return addThousandSeparator(params.value)
          }
        }
      }
    ]
  },
  dataZooVerticalBarChartBasicOption: {
    // title: {
    //   text: '标题',
    //   textStyle: {},
    //   bottom: 0,
    //   left: '50%'
    // },
    dataZoom: {
      start: 0,
      end: 100,
      type: 'inside'

    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    // legend: {
    //   left: 0,
    //   icon: 'circle',
    //   top: 26,
    //   textStyle: {
    //     fontSize: 12,
    //     color: '#FFFFFF'
    //   }
    // },
    grid: {
      left: 0,
      right: '5%',
      top: '10%',
      bottom: '5%',
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      }
      // boundaryGap: [0, 0.01]
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      axisTick: {
        show: true,
        alignWithLabel: true
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      data: []
    },
    series: [
      {
        name: '',
        type: 'bar',
        // barWidth: 24,
        barMaxWidth: echartsToPx(24),
        data: [],
        itemStyle: {
          color: 'rgba(140, 235, 160, 1)',
          borderRadius: [echartsToPx(12), echartsToPx(12), 0, 0]
        },
        label: {
          show: false,
          position: 'top',
          fontSize: echartsToPx(12),
          fontFamily: 'D-DIN',
          color: '#FFFFFF'
        }
      }
    ]
  },
  verticalBarChartBasicOption2(xAxisData = [], data = [], name = '', dataZoom) {
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
      color: ['#6694FF'],
      grid: {
        left: echartsToPx(6),
        right: echartsToPx(6),
        top: echartsToPx(30),
        bottom: dataZoom ? echartsToPx(40) : 0,
        containLabel: true
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.60)',
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
            color: 'rgba(255, 255, 255, 0.20)'
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
          color: 'rgba(255, 255, 255, 0.60)',
          fontSize: echartsToPx(10)
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
        data,
        type: 'bar',
        barMaxWidth: echartsToPx(22),
        label: {
          show: true,
          position: 'top',
          fontSize: echartsToPx(10),
          color: '#fff',
          formatter: (params) => {
            return addThousandSeparator(params.value)
          }
        }
      },
      dataZoom
    }
  },
  linesChartsOption: {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip darkModeEchartsTooltip'>
                  <div class='echartsTooltipName'>${params.seriesName}</div>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${params.value}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      borderColor: 'rgba(0, 0, 0, 0.60)',
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    legend: {
      top: 'bottom',
      textStyle: {
        fontSize: echartsToPx(12),
        color: '#fff'
      },
      itemWidth: echartsToPx(17),
      itemHeight: echartsToPx(13),
      data: []
    },
    grid: {
      left: 0,
      right: 0,
      top: echartsToPx(10),
      bottom: echartsToPx(30),
      containLabel: true
    },
    yAxis: {
      name: '',
      position: 'left',
      alignTicks: true,
      type: 'value',
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.60)',
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
          color: 'rgba(255, 255, 255, 0.20)'
        }
      }
    },
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(255, 255, 255, 0.60)'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.60)',
        margin: echartsToPx(14),
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          color: '#E1EFFD'
        }
      }
    },
    series: [],
    color: darkLineColorList
  },
  stackedAreaChart: {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      top: 'bottom',
      textStyle: {
        fontSize: echartsToPx(12),
        color: '#fff'
      },
      itemWidth: echartsToPx(14),
      itemHeight: echartsToPx(11),
      data: []
    },
    grid: {
      top: echartsToPx(16),
      left: 0,
      right: 0,
      bottom: echartsToPx(30),
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.60)',
          fontSize: echartsToPx(10)
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.20)'
          }
        }
      }
    ],
    series: [
    ],
    color: darkLineColorList
  },
  pieChartOption2: (data, colorArr) => {
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
        type: 'scroll',
        selectedMode: !!(data?.length),
        pageTextStyle: {
          color: '#FFFFFF',
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
          height: echartsToPx(15),
          lineHeight: echartsToPx(15),
          fontSize: echartsToPx(12),
          color: '#FFFFFF'
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
        // avoidLabelOverlap: false,
        label: {
          show: !!(data?.length),
          formatter: '{b}：{c}（{d}%)',
          color: '#fff',
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
          // borderColor: 'rgba(255, 254, 254, 0.1)',
          // borderColor: '#fff',
          borderWidth: echartsToPx(0)
        },
        data: (data?.length) ? data : [{ name: '无', value: 0 }]
      },
      color: (data?.length) ? ((colorArr?.length) ? colorArr : pieColorList) : ['#505675']
    }
  },
  PolarOption: {
    title: [
      {
        text: ''
      }
    ],
    polar: {
      radius: [30, '80%']
    },
    angleAxis: {
      // max: 4,
      startAngle: 75,
      axisLabel: {
        color: '#fff',
        fontSize: echartsToPx(12)
      }
    },
    radiusAxis: {
      type: 'category',
      data: []
    },
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip darkModeEchartsTooltip'>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${params.value}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      borderColor: 'rgba(0, 0, 0, 0.60)',
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    series: {
      type: 'bar',
      data: [],
      coordinateSystem: 'polar',
      label: {
        show: true,
        color: '#fff',
        position: 'start',
        // formatter: '{b}: {c}',
        formatter: (params) => {
          return `${params.data.name}:${addThousandSeparator(params.value)}`
        },
        fontSize: echartsToPx(10)
      }
    },
    color: ['#3670F8']
  }
}
export const lightBasicOption = {
  horizontalBarChartBasicOption: {
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
    // color,
    legend: {},
    grid: {
      left: 0,
      right: echartsToPx(55),
      top: echartsToPx(14),
      bottom: echartsToPx(1),
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(54, 112, 248, 0.10)'
        }
      }
      // boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      // y轴显示不全，鼠标移上去显示全部，记得加上这个
      triggerEvent: true,
      axisLabel: {
        width: echartsToPx(130),
        overflow: 'truncate',
        color: '#666',
        fontSize: echartsToPx(12),
        // 设置 tooltip 触发类型
        tooltip: {
          show: true
        }
      },

      z: 2,
      zlevel: 2
      // data: yAxisData
    },
    series: {
      // name,
      type: 'bar',
      barWidth: echartsToPx(17),
      // data,
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(54, 112, 248, 0.03)'
      },
      // itemStyle: {
      //   borderRadius: 0
      // },
      label: {
        show: true,
        position: 'right',
        fontSize: echartsToPx(10),
        color: '#333',
        formatter: (params) => {
          return addThousandSeparator(params.value)
        }
      }
    }
  },
  barAndLineChartBasicOption: {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip'>
                  <div class='echartsTooltipName'>${params.seriesName}</div>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${params.value}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      borderColor: 'rgba(0, 0, 0, 0.60)',
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    legend: {
      show: false,
      left: '50%',
      bottom: 0,
      selectedMode: false,
      icon: lineSymble,
      itemWidth: echartsToPx(16),
      itemHeight: echartsToPx(12),
      textStyle: {
        fontSize: echartsToPx(12),
        color: '#666'
      }
    },
    grid: {
      left: 0,
      right: echartsToPx(10),
      top: echartsToPx(10),
      bottom: echartsToPx(10),
      containLabel: true
    },
    yAxis: {
      name: '',
      // minInterval: 1,
      position: 'left',
      alignTicks: true,
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
      // ...lineConfig?.yAxis
    },
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          width: echartsToPx(1),
          color: '#666666'
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
        margin: echartsToPx(14),
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          color: '#E1EFFD'
        }
      }
      // data: lineConfig?.xAxisData || []
    },
    series: {
      // name: lineConfig?.name,
      yAxisIndex: 0,
      type: 'line',
      symbolSize: echartsToPx(10),
      smooth: true,
      itemStyle: {
        color: '#3670F8'
      },
      symbol: symbolIcon,
      lineStyle: {
        color: '#3670F8',
        width: echartsToPx(2)
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#C7D8FF'
          },
          {
            offset: 1,
            color: '#F9FCFF'
          }
        ])
      }
      // data: lineConfig?.yAxisData || []
    }
  },
  verticalBarChartBasicOption: {
    // title: {
    //   text: '标题',
    //   textStyle: {},
    //   bottom: 0,
    //   left: '50%'
    // },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    // legend: {
    //   left: 0,
    //   icon: 'circle',
    //   top: 26,
    //   textStyle: {
    //     fontSize: 12,
    //     color: '#FFFFFF'
    //   }
    // },
    grid: {
      left: 0,
      right: '5%',
      top: '10%',
      bottom: '5%',
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      }
      // boundaryGap: [0, 0.01]
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      data: []
    },
    series: [
      {
        name: '',
        type: 'bar',
        // barWidth: echartsToPx(24),
        barMaxWidth: echartsToPx(24),
        data: [],
        itemStyle: {
          color: 'rgba(59, 192, 152, 1)',
          borderRadius: [echartsToPx(12), echartsToPx(12), 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          fontSize: echartsToPx(12),
          fontFamily: 'D-DIN',
          color: '#C8C8C8',
          formatter: (params) => {
            return addThousandSeparator(params.value)
          }
        }
      }
    ]
  },
  dataZooVerticalBarChartBasicOption: {
    // title: {
    //   text: '标题',
    //   textStyle: {},
    //   bottom: 0,
    //   left: '50%'
    // },
    dataZoom: {
      start: 0,
      end: 100,
      type: 'inside'
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    // legend: {
    //   left: 0,
    //   icon: 'circle',
    //   top: 26,
    //   textStyle: {
    //     fontSize: 12,
    //     color: '#FFFFFF'
    //   }
    // },
    grid: {
      left: 0,
      right: '5%',
      top: '10%',
      bottom: '5%',
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      }
      // boundaryGap: [0, 0.01]
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        color: '#C8C8C8',
        fontSize: 10
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      axisTick: {
        show: true,
        alignWithLabel: true
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      },
      data: []
    },
    series: [
      {
        name: '',
        type: 'bar',
        // barWidth: 24,
        barMaxWidth: echartsToPx(24),
        data: [],
        itemStyle: {
          color: 'rgba(140, 235, 160, 1)',
          borderRadius: [echartsToPx(12), echartsToPx(12), 0, 0]
        },
        label: {
          show: false,
          position: 'top',
          fontSize: echartsToPx(12),
          fontFamily: 'D-DIN',
          color: '#FFFFFF'
        }
      }
    ]
  },
  verticalBarChartBasicOption2(xAxisData = [], data = [], name = '', dataZoom) {
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
      color: ['#6694FF'],
      grid: {
        left: echartsToPx(6),
        right: echartsToPx(6),
        top: echartsToPx(30),
        bottom: dataZoom ? echartsToPx(40) : 0,
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
          fontSize: echartsToPx(10)
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
        data,
        type: 'bar',
        barMaxWidth: echartsToPx(22),
        label: {
          show: true,
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
  },
  linesChartsOption: {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip'>
                  <div class='echartsTooltipName'>${params.seriesName}</div>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${params.value}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      borderColor: 'rgba(0, 0, 0, 0.60)',
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    legend: {
      top: 'bottom',
      textStyle: {
        fontSize: echartsToPx(12),
        color: '#666666'
      },
      itemWidth: echartsToPx(17),
      itemHeight: echartsToPx(13),
      data: []
    },
    grid: {
      left: 0,
      right: 0,
      top: echartsToPx(10),
      bottom: echartsToPx(30),
      containLabel: true
    },
    yAxis: {
      name: '',
      position: 'left',
      alignTicks: true,
      type: 'value',
      axisLabel: {
        color: '#666666',
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
          color: '#666666'
        }
      },
      axisTick: {
        length: echartsToPx(5),
        lineStyle: {
          width: echartsToPx(1)
        }
      },
      axisLabel: {
        color: '#666666',
        margin: echartsToPx(14),
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          color: '#E1EFFD'
        }
      }
    },
    series: [],
    color: darkLineColorList
    // {
    //   yAxisIndex: 0,
    //   type: 'line',
    //   symbolSize: echartsToPx(10),
    //   smooth: true,
    //   itemStyle: {
    //     color: '#3670F8'
    //   },
    //   lineStyle: {
    //     color: '#FAC858',
    //     width: echartsToPx(2)
    //   },
    // }
  },
  stackedAreaChart: {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      left: 0,
      icon: 'path://M170.6422882080078,512a195.072,195.072,0,1,0,390.14402770996094,0a195.072,195.072,0,0,0,-390.14402770996094,0ZM877.7142944335938,548.5714111328125a36.571429,36.571429,0,0,0,0,-73.14285278320312l0,73.14285278320312Zm-512,0l512,0l0,-73.14285278320312L365.71429443359375,475.4285583496094l0,73.14285278320312Z',
      top: echartsToPx(26),
      textStyle: {
        fontSize: echartsToPx(12),
        color: '#015CA2'
      },
      // '心脑血管疾病', '恶性肿瘤', '呼吸系统疾病'
      data: []
    },
    grid: {
      top: echartsToPx(120),
      left: 0,
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      // boundaryGap: false,
      data: [],
      axisLabel: {
        color: '#C8C8C8',
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(69, 69, 79, 1)'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: '#C8C8C8',
          fontSize: echartsToPx(10)
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(69, 69, 79, 1)'
          }
        }
      }
    ],
    series: [
      {
        name: '心脑血管疾病',
        type: 'line',
        // smooth: true,
        symbolSize: 8,
        symbol: 'circle',
        // stack: 'Total',
        // areaStyle: {
        //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        //     {
        //       offset: 0,
        //       color: 'rgba(115, 220, 198, 1)'
        //     },
        //     {
        //       offset: 1,
        //       color: 'rgba(115, 220, 198, 0)'
        //     }
        //   ])
        // },
        emphasis: {
          focus: 'series'
        },
        data: []
      },
      {
        name: '恶性肿瘤',
        type: 'line',
        // smooth: true,
        symbol: 'circle',
        symbolSize: echartsToPx(8),
        // stack: 'Total',
        emphasis: {
          focus: 'series'
        },
        // areaStyle: {
        //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        //     {
        //       offset: 0,
        //       color: 'rgba(108, 194, 56, 1)'
        //     },
        //     {
        //       offset: 1,
        //       color: 'rgba(108, 194, 56, 0)'

        //     }
        //   ])
        // },
        data: []
      },
      {
        name: '呼吸系统疾病',
        type: 'line',
        symbol: 'circle',
        // smooth: true,
        symbolSize: echartsToPx(8),
        // stack: 'Total',
        // areaStyle: {
        //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        //     {
        //       offset: 0,
        //       color: 'rgba(250, 200, 88, 1)'
        //     },
        //     {
        //       offset: 1,
        //       color: 'rgba(250, 200, 88, 0)'

        //     }
        //   ])
        // },
        emphasis: {
          focus: 'series'
        },
        data: []
      }

    ],
    color: lightColorList
  },
  pieChartOption2: (data, colorArr) => {
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
          height: echartsToPx(15),
          lineHeight: echartsToPx(15),
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
          // borderColor: '#fff',
          borderWidth: echartsToPx(0)
        },
        data: (data?.length) ? data : [{ name: '无', value: 0 }]
      },
      color: (data?.length) ? ((colorArr?.length) ? colorArr : pieColorList) : ['rgb(201,201,201)']
    }
  },
  PolarOption: {
    polar: {
      radius: [echartsToPx(30), '80%']
    },
    angleAxis: {
      // max: 4,
      startAngle: 75,
      axisLabel: {
        color: '#666',
        fontSize: echartsToPx(12)
      }
    },
    radiusAxis: {
      type: 'category',
      data: []
    },
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip darkModeEchartsTooltip'>
                  <div class='echartsTooltipContent'>
                     <div class='toolTipPointer dataAnalysis' style='background:${params.color}'></div>
                     <div class='echartsTooltipXName'>${params.name}</div>
                    <div class='echartsTooltipValue'>
                    ${params.value}
                    </div>
                  </div>
                </div>`
      },
      borderWidth: 0,
      borderRadius: echartsToPx(2),
      borderColor: 'rgba(0, 0, 0, 0.60)',
      backgroundColor: 'rgba(0, 0, 0, 0.60)',
      textStyle: {
        color: '#fff',
        fontSize: echartsToPx(14)
      }
    },
    series: {
      type: 'bar',
      data: [],
      coordinateSystem: 'polar',
      label: {
        show: true,
        position: 'start',
        // formatter: '{b}: {c}',
        formatter: (params) => {
          return `${params.data.name}:${addThousandSeparator(params.value)}`
        },
        fontSize: echartsToPx(10)
        // color: '#666',
        // textShadowColor: '#fff',
        // textShadowBlur: echartsToPx(6)
      }
    },
    color: ['#3670F8']
  }
}
export const handelOption = (type, data, mode) => {
}
