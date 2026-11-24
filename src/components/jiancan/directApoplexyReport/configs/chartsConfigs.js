
import * as echarts from 'echarts'
import { echartsToPx } from '@/utils/utils'
import lodash from 'lodash'
const colorList = ['#FF4E4E', '#3670F8', '#FAC858', '#04A273', '#9EB5EB', '#283E81', '#91CC75', '#68A400', '#FFA358', '#D599FD', '#8A33C4']
// eslint-disable-next-line max-len
const lineSymble = 'image://data:image/png;base64,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'

// eslint-disable-next-line max-len
// const symbolIcon = 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAAXNSR0IArs4c6QAAAolJREFUSEu9Vj1oE2EYft5rkuZAIXWTDipIJ4UopjiZFhwd0kkcBH8m7dATpIOgNgoOReg51E6K4CBOjeAoNHXSRjSgUxGsQ3EzBYULuXqvfS+55H57V2P7Lh9338/zve/3fM/zEWIirzVyGWQ1gnKIwXkAOQZyBKwBWGNCdYD51Ttdle/IoKieU5oxpoCmAJTiNiP9BHpmwXxU0/fVw8aHAo1qxgxAd5MABMdweUVXZ/z/PUBSpjTURQLG/g2kPYuBqgljoq4PbTjreIAKWnMpDOTkUQXnCgqkPXigPWV13cLqOuPl2z926w8Bq+nZ8QBQWLlk0TsXUjbAdrH82cJcZRM/fvoBe2W0t1fQfucJqU/uxUaGCY8n09ivRvLFgy0gAiag7rDA4x90tWqvMqo1F93skkye30wO4iz8y2BcfGh6MnNKSKc147AF+ubeReV2pnsWOyWFZFa63/JMa8EYIv/ZFI8pmL2a3un6nvHX5k18/OouIZfJX7bZK2kUj29/+HG7kHOafmp2h8llFiAhgUiLHXI2I8P9AYWUr04FrdkgIOcAvXmQScy0qMyEFGdv9c6JgY29A/KXrh/GORmKagjNnRCK7wkZtjhQCdBb5GZhsj96Tz8xsfylR+8t/9KpbWxqYzcvrAI+0tE6r2r/TwmSO/ReH7xsA3XcdMmdlVzaG6VUYikSSl+fNwOWwdg8Ia7bleYomxCwOKUQubn3IoFNOJlEGZ9YxvkzA5DWUQ25/QLwumb5dK1bl8qKnp0IGJ/86Cj5XNIHSZQyxFq5M3HXHyfuHYrrKkhPMfhSnFpLv2TB4LK4adj4WJ+WcjK4xFCK8nB0lF4ekASqM6zvLTR194snDOgv3RszPvNrT/gAAAAASUVORK5CYII='
// eslint-disable-next-line max-len
const symbolIcon = 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAodJREFUSEu9lk1IVFEUx3/nzeg4YeDCFoGS9AEFQW6aMRIqaBO4aGFQOYFhtMmY56ZF5SKK6ANyoiLJAu1zYdRGWhm2sDJdVBTYwsQwUEgoKJwPZ96JN/FmxplpnNK6y3v+9/7Pueec/7lCgbXd1Iow0WaFrcBaoEbArTAGjAk89+LpfhaSb7+7RvIZ/Ednq9RtnBAloFBeyAmBHyrcVXf81MjF8ulsbA6Bv212r6pxHagodHGOTZhWODDSUdafaZtH4DcjpkLHH108HxxHaRu+XHbV2U4R+IPhgIrcyb68qlLYU++ibr1B9Ypf8MkvytAHi97BBJ9nNPtIXIVdTiTJE3VmuEaRd5nv7TLgSIObph2uggHdG0hwrS9OwsqE6YwBm4dC3okkgc+MdAGHHIjXA6HDJdSuNop6rTfjFuaNOcLRNFyQ7lchz0GxS3FWolMoZY65fZ+bBl9hz7OZ+4YTnH4Qz9yOG+g68QUjrQhXHMvGVcIts7Qoz7NBLaEY7z+lc6Kq7eIzI4+B3Yvx3jmbE4XQJz4z+hq01gHdP1bKmpV5+2/BqD5OKfsvxFI4gQmb4Ctoqqn6z5ay3Pt3BN/Dys7jaQIgnkMwcM7DMs+CzuYF5CHgfzzR0iX50YsE53szSjWZ5CUs0+ZLMUYns8r0nzdaUiqC4ZuItDiZs5NsS8WmIqXi7bhFa+ccsbl5etQzHPI2L1rsbj9N0PkkW+yYMdC02Nm8/mA0oKI5cl1dKTTWu9iywcCWbnvZEv1y1OLhYILJYuTaCeyfDpw0SbRRoSuzu4tqu2JGZorEHvouOSlIUzFD38LqocQ6U9TQz/Q2WcIaDYjINk19W9StiP1lGQNd8NvyE8kYK6rDOmBZAAAAAElFTkSuQmCC'
export const chartsConfigs = {
  horizontalBarChartBasicOption: {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      textStyle: {
        fontSize: echartsToPx(14)
      }
    },
    grid: {
      left: 0,
      right: '5%',
      top: '5%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#015CA2',
        fontSize: echartsToPx(10)
      },
      splitLine: {
        lineStyle: {
          color: '#E1EFFD'
        }
      }
      // boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          color: '#E1EFFD'
        }
      },
      axisLabel: {
        // width: 70,
        // overflow: 'break',
        color: '#333333',
        fontSize: echartsToPx(12)
      },
      data: []
    },
    series: {
      name: '上报总数',
      type: 'bar',
      // barWidth: echartsToPx(24),
      barMaxWidth: echartsToPx(24),
      data: [],
      itemStyle: {
        color: '#6F9AD8',
        borderRadius: [0, echartsToPx(12), echartsToPx(12), 0]
      },
      label: {
        show: true,
        position: 'right',
        fontSize: echartsToPx(12),
        fontFamily: 'D-DIN',
        color: '#FFFFFF'
      }
    }
  },
  lineChartBasicOption: (lineConfig) => {
    return {
      title: {
        show: lineConfig?.title,
        text: lineConfig?.title,
        textStyle: {
          fontWeight: 400,
          fontSize: echartsToPx(12),
          color: '#666666',
          lineHeight: echartsToPx(12)
        },
        top: 0,
        left: 0
      },
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
        left: echartsToPx(10),
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
        },
        ...lineConfig?.yAxis
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
          margin: echartsToPx(14),
          fontSize: echartsToPx(10)
        },
        splitLine: {
          lineStyle: {
            color: '#E1EFFD'
          }
        },
        data: lineConfig?.xAxisData || []
      },
      series: {
        name: lineConfig?.name,
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
        },
        data: lineConfig?.yAxisData || []
      }
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
      // grid: {
      //   top: 76,
      //   left: '3%',
      //   right: '4%',
      //   bottom: '0',
      //   containLabel: true
      // },
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
  },
  instrumentPanel: (val = 0, name, pointerOffsetCenter, radius) => {
    return {
      // grid: {
      //   top: 20
      // },
      legend: {
        show: true,
        type: 'scroll',
        bottom: echartsToPx(24),
        data: [{
          name: '小于等于25',
          itemStyle: {
            color: '#FF7B4E'
          }
        },
        {
          name: '大于25小于等于50',
          itemStyle: {
            color: '#FFCC50'
          }
        },
        {
          name: '大于50',
          itemStyle: {
            color: '#08AF7D'
          }
        }
        ],
        pageTextStyle: {
          color: '#015CA2'
        },
        itemHeight: echartsToPx(12),
        selectedMode: false,
        // pageIconInactiveColor: 'rgba(83, 134, 111, 1)',
        pageIconColor: 'rgba(83, 134, 111, 1)',
        icon: 'circle',
        itemGap: echartsToPx(26),
        textStyle: {
          // padding: echartsToPx(-6),
          fontSize: echartsToPx(12),
          color: '#666666'
        }
      },
      backgroundColor: '#FFFFFF',
      // 圆环位置和大小
      series: [
        // 仪表盘
        {
          name,
          type: 'gauge',
          z: 4,
          radius: radius || '100%',
          startAngle: 180, // 起始角度，同极坐标
          endAngle: 0, // 终止角度，同极坐标
          axisLine: {
            show: true,
            roundCap: true,
            lineStyle: {
              width: echartsToPx(20),
              color: [
                [0.25,
                  new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#FF7B4E' },
                    { offset: 1, color: '#FF7B4E' }
                  ])],
                [0.5,
                  new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#FFFC3F' },
                    { offset: 1, color: '#FFB859' }
                  ])
                ],
                [1,
                  new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#7BE26F' },
                    { offset: 1, color: '#08AF7D' }
                  ])
                ]
              ]
            }
          },
          center: ['50%', '60%'],
          splitNumber: 10, // 控制刻度数量
          splitLine: {
            show: false,
            length: echartsToPx(10),
            distance: echartsToPx(-20),
            lineStyle: {
              color: '#fff',
              width: echartsToPx(1)
            }
          },
          axisTick: {
            show: true,
            distance: echartsToPx(-26),
            length: echartsToPx(4),
            lineStyle: {
              // color: '#fff',
              color: 'auto',
              width: echartsToPx(1)
            }
          },
          axisLabel: {
            show: false,
            distance: echartsToPx(35),
            fontSize: echartsToPx(11),
            color: '#3C81CF'
          },
          splitLabel: {
            show: false
          },
          pointer: {
            // 分隔线
            icon: 'triangle',
            show: true,
            offsetCenter: pointerOffsetCenter || [0, '-72%'],
            itemStyle: {
              color: '#FF5F5A',
              borderWidth: echartsToPx(5),
              borderColor: '#FF5F5A'
            },
            keepAspect: true,
            length: '4%',
            width: '3.5%'
            // keepAspect: true,
            // shadowColor: 'auto', // 默认透明
            // shadowBlur: 0,
            // length: '50%',
            // width: echartsToPx(40),
            // icon: 'image://data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7'
          },
          itemStyle: {
            color: '#3C81CF',
            borderColor: '#3C81CF',
            borderWidth: echartsToPx(5)
          },
          title: {
            show: true,
            x: 'center',
            borderColor: '#1598FF',
            fontSize: echartsToPx(14),
            color: '#333',
            offsetCenter: [0, '75%']
          },
          detail: {
            offsetCenter: [echartsToPx(10), echartsToPx(-15)],
            formatter: function (params) {
              return (val * 100).toFixed(0) + '%'
            },
            show: true,
            fontFamily: 'DIN Alternate',
            fontWeight: 700,
            fontSize: echartsToPx(34),
            color: '#3C81CF'
          },
          progress: {
            show: false,
            roundCap: true,
            clip: true
          },
          data: [
            {
              name: '',
              value: val * 100,
              detail: {
                show: true,
                formatter: () => {
                  return `{a|${(val * 100).toFixed(0)}}{c| }{b|%}`
                },
                rich: {
                  a: {
                    fontWeight: 700,
                    fontSize: echartsToPx(70),
                    color: '#333333',
                    // lineHeight: echartsToPx(70),
                    fontFamily: 'DIN Alternate',
                    verticalAlign: 'bottom'
                  },
                  b: {
                    fontWeight: 700,
                    fontSize: echartsToPx(34),
                    color: '#999999',
                    lineHeight: echartsToPx(58),
                    height: echartsToPx(70)
                  },
                  c: {
                    fontSize: echartsToPx(10), // 设置空格的间距大小
                    color: 'transparent' // 设置空格的颜色为透明，使其不可见
                  }
                }
              }
            }
          ]
        },
        {
          name: '小于等于25',
          // 指针内环
          type: 'pie',
          center: ['0%', '0%'],
          // hoverAnimation: false,
          emphasis: {
            disabled: true
          },
          legendHoverLink: false,
          radius: ['0%', '0%'],
          z: 10,
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: 0,
              itemStyle: {
                color: '#fff'
              }
            }
          ]
        },
        {
          name: '大于25小于等于50',
          // 指针内环
          type: 'pie',
          center: ['0%', '0%'],
          // hoverAnimation: false,
          emphasis: {
            disabled: true
          },
          legendHoverLink: false,
          radius: ['0%', '0%'],
          z: 10,
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: 0,
              itemStyle: {
                color: '#fff'
              }
            }
          ]
        },
        {
          name: '大于50',
          // 指针内环
          type: 'pie',
          center: ['0%', '0%'],
          // hoverAnimation: false,
          emphasis: {
            disabled: true
          },
          legendHoverLink: false,
          radius: ['0%', '0%'],
          z: 10,
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: 0,
              itemStyle: {
                color: '#fff'
              }
            }
          ]
        }
      ]
    }
  },
  areaLineOption: (xAxisData = [], data = [], titleTxt = '') => {
    return {
      title: {
        show: Boolean(titleTxt),
        left: 0,
        top: echartsToPx(0),
        text: titleTxt,
        textStyle: {
          fontSize: echartsToPx(18),
          color: '#1A1A1A'
        }
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
        show: true,
        right: 0,
        itemWidth: echartsToPx(16),
        itemHeight: echartsToPx(16),
        icon: 'path://M1917.138671875,384.9537658691406L996.912109375,384.9537658691406C907.4456176757812,65.4306640625,549.5797729492188,-100.72135162353516,255.6184844970703,65.4306640625C-76.685546875,257.14453125,-76.685546875,755.6005859375,255.6184844970703,947.314453125c293.96128845214844,178.9329833984375,664.6080780029297,0,741.2936248779297,-319.52313232421875L1917.138671875,627.7913208007812L1917.138671875,384.9537658691406Z',
        top: echartsToPx(0),
        textStyle: {
          fontSize: echartsToPx(12),
          color: '#666'
        },
        padding: [echartsToPx(4), 0, 0, 0]
      },
      grid: {
        top: echartsToPx(49),
        left: 0,
        right: '3%',
        bottom: 0,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          color: '#333333',
          fontSize: echartsToPx(10)
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(69, 69, 79, 1)'
          },
          axisLabel: {
            color: '#333333',
            fontSize: echartsToPx(10)
          },
          splitLine: {
            lineStyle: {
              color: '#E0E6F1'
            }
          }
        },
        axisLine: {
          lineStyle: {
            color: '#6E7079'
          }
        },
        data: xAxisData
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 20,
        splitNumber: 2,
        axisLine: {
          lineStyle: {
            color: '#6E7079'
          }
        },
        axisLabel: {
          color: '#333333',
          fontSize: echartsToPx(10)
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(224,230,241,0.5)'
          }
        }
      },
      color: ['rgba(60, 129, 207, 1)'],
      series: [
        {
          name: '评分趋势',
          data,
          symbol: 'circle',
          symbolSize: echartsToPx(8),
          type: 'line',
          // smooth: true,
          lineStyle: {
            width: echartsToPx(2)
          }
          // areaStyle: {
          // opacity: 0.8,
          // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //   {
          //     offset: 0,
          //     color: 'rgba(45, 143, 255, 0.24)'
          //   },
          //   {
          //     offset: 1,
          //     color: 'rgba(255, 255, 255, 0)'
          //   }
          // ])
          // }
        }
      ]
    }
  },
  radarOptions: (indicator = [], data = [], center, radius) => {
    return {
      radar: {
        center: center || ['50%', '50%'],
        radius: radius || '72%',
        splitArea: {
          areaStyle: {
            color: ['#fff']
          }
        },
        axisName: {
          color: '#333',
          formatter: (value) => {
            const index = lodash.findIndex(indicator, { name: value })
            const arr = [`{a|${value}}`,
              `{b|${data[index]}}`
            ]
            return arr.join(': ')
          },
          nameGap: echartsToPx(0),
          rich: {
            a: {
              // color: 'red',
              // lineHeight: 10
              fontWeight: 400,
              fontSize: echartsToPx(10),
              color: '#333333',
              lineHeight: echartsToPx(14)
            },
            b: {
              color: '#3670F8',
              align: 'right',
              fontFamily: 'D-Din',
              fontWeight: 700,
              fontSize: echartsToPx(18)
            }
          }
        },
        axisLine: {
          lineStyle: {
            // color: '#E0E6F1' // 雷达图中轴线颜色
            color: 'rgba(54, 112, 248, 0.10)'
          }
        },
        indicator
      },
      series: [
        {
          name: '',
          type: 'radar',
          symbolSize: echartsToPx(6),
          itemStyle: {
            color: '#3670F8'
          },
          areaStyle: {
            color: 'rgba(54, 112, 248, 0.20)'
          },
          lineStyle: {
            color: '#3670F8',
            width: echartsToPx(2)
          },
          data: [
            {
              value: data
            }
          ]
        }
      ]
    }
  }
}
