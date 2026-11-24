// import * as echarts from 'echarts'
import { echartsToPx, addThousandSeparator } from '@/utils/utils.js'
const colorList = ['#FAC858', '#507AFC', '#FF7B7B', '#25C7CB']
export const homePageConfigs = {
  horizontalBarChartBasicOption2: (yAxisData = [], data = [], color = ['#6694FF'], name = '') => {
    // if (yAxisData.length < 12) {
    //   const num = 13 - yAxisData.length
    //   for (let i = 0; i < num; i++) {
    //     yAxisData.unshift('')
    //     data.unshift('')
    //   }
    // }
    if (yAxisData.length < 1) {
      // yAxisData = ['', '', '', '', '', '', '', '', '', '']
      data = ['', '', '', '', '', '', '', '', '', '']
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
        backgroundColor: 'rgba(0, 0, 0, 0.60)',
        textStyle: {
          color: '#fff',
          fontSize: echartsToPx(14)
        }
      },
      color,
      legend: {},
      grid: {
        left: echartsToPx(12),
        right: echartsToPx(55),
        top: echartsToPx(32),
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
          backgroundColor: '#fff',
          overflow: 'truncate',
          color: '#666',
          fontSize: echartsToPx(12),
          // 设置 tooltip 触发类型
          tooltip: {
            show: true
          }
        },
        z: 2,
        zlevel: 2,
        data: yAxisData
      },
      series: {
        name,
        type: 'bar',
        barWidth: echartsToPx(22),
        data,
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
    }
  },
  verticalBarChartBasicOption(xAxisData = [], data = [], name = '', dataZoom, color) {
    let isInit = true
    if (xAxisData.length < 1) {
      xAxisData = ['', '', '', '', '', '', '', '', '', '']
      data = ['', '', '', '', '', '', '', '', '', '']
      isInit = false
      dataZoom = ''
    } else {
      isInit = true
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
          // <div class='echartsTooltipName'>${params.seriesName}</div>
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
      color: color || ['#6694FF'],
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
        showBackground: !isInit,
        backgroundStyle: {
          color: 'rgba(54, 112, 248, 0.03)'
        },
        label: {
          show: true,
          position: 'top',
          fontSize: echartsToPx(10),
          // fontFamily: 'D-DIN',
          color: '#333333',
          // formatter: '{c}'
          formatter: (params) => {
            return addThousandSeparator(params.value)
          }
        }
      },
      dataZoom
    }
  },
  pieChartOption: (data, colorArr) => {
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
        // top: echartsToPx(20),
        bottom: echartsToPx(20),
        // radius: ['64%', '82%'],
        radius: ['60%', '78%'],
        // avoidLabelOverlap: false,
        label: {
          show: !!(data?.length),
          formatter: '{b}：{c}（{d}%)',
          color: '#333',
          position: 'outside',
          alignTo: 'edge',
          lineHeight: echartsToPx(20),
          edgeDistance: echartsToPx(10),
          // width: 100,
          // overflow: 'break',
          fontSize: echartsToPx(10)
        },
        labelLine: {
          show: !!(data?.length),
          // minTurnAngle: 25,
          // maxSurfaceAngle: 80,
          length: echartsToPx(8), // 调整指线的长度
          length2: echartsToPx(20), // 调整第二段指线的长度
          lineStyle: {
            width: echartsToPx(1) // 调整指线的宽度
          // color: '#333' // 调整指线的颜色
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
}
