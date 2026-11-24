// eslint-disable-next-line no-unused-vars
import { echartsToPx, addThousandSeparator } from '@/utils/utils.js'
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import lodash from 'lodash'
const colors = ['#3670F8', '#FAC858', '#04A273', '#FF4E4E', '#68A400', '#FFA358', '#283E81', '#8A33C4']
// eslint-disable-next-line no-unused-vars
const convertImageToBase64 = (url, callback, outputFormat) => {
  let canvas = document.createElement('CANVAS')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.crossOrigin = 'Anonymous' // 如果图像跨域，需要设置这个属性
  img.onload = function () {
    canvas.height = img.height
    canvas.width = img.width
    ctx.drawImage(img, 0, 0)
    const dataURL = canvas.toDataURL(outputFormat || 'image/png')
    callback(dataURL)
    canvas = null
  }
  img.src = url
  return img
}

export const wordCloudConfigFn = (list = []) => {
  return {
    tooltip: {
      show: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
        show: true
      },
      formatter: (params) => {
        return `<div class='echartsTooltip middleFontSize'>
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
    series: [
      {
        type: 'wordCloud',
        // 可用的形状有(circle)圆形(默认)、(cardioid)心形，(diamond)菱形，(triangle-forward)三角形向前，(triangle)三角形，(pentagon)五边形和(star)星形。
        shape: 'circle',
        keepAspect: false, // 保持maskImage的宽高比或1:1的形状，他的选项是支持从echarts-wordcloud@2.1.0
        // //一个轮廓图像，其白色区域将被排除在绘制文本之外
        // 意思就是可以通过图片，来自定义词云的形状
        // maskImage: convertImageToBase64(addDataSetImg3),
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        right: null,
        bottom: null,
        sizeRange: [echartsToPx(20), echartsToPx(60)],
        rotationRange: [0, 0],
        rotationStep: 0,
        gridSize: echartsToPx(25),
        drawOutOfBound: false,
        layoutAnimation: true,
        textStyle: {
          // fontFamily: 'D-Din',
          fontWeight: 600,
          color: function (params) {
            // return colors[parseInt(Math.random() * 8)]
            if (params.dataIndex < colors.length) {
              return colors[params.dataIndex]
            } else {
              return colors[params.dataIndex - colors.length]
            }
          }
          // textShadowColor: 'rgba(0, 0, 0, 0.60)', // 设置阴影颜色
          // textShadowBlur: echartsToPx(4), // 设置阴影的模糊大小
          // textShadowOffsetX: echartsToPx(3), // 设置阴影在X轴的偏移量
          // textShadowOffsetY: echartsToPx(3)
        },
        emphasis: {
          focus: 'none'
        },
        data: list
      }
    ]
  }
}

// 根据类别获取主色（用于渐变中间色）
// eslint-disable-next-line no-unused-vars
const getCategoryColor = (category, categories) => {
  const obj = lodash.find(categories, { name: category })
  return obj?.color
}
export const relationshipDiagramFn = (nodes = [], links = [], categories = []) => {
  categories.forEach((item, index) => {
    const colorIndex = index % colors.length
    item.color = colors[colorIndex]
  })
  nodes = nodes.map(node => {
    // eslint-disable-next-line no-unused-vars
    const currentColor = getCategoryColor(String(node.category), categories)
    return {
      ...node,
      symbolSize: echartsToPx(40),
      category: String(node.category),
      itemStyle: {
        color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
          { offset: 0, color: '#fff' },
          { offset: 0.3, color: currentColor }
        ])
      }
    }
  })

  return {
    tooltip: {
      show: false
    },
    legend: {
      show: false
    },
    animationDuration: 1000,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      type: 'graph', // 关系图
      name: '', // 系列名称，用于tooltip的显示，legend 的图例筛选，在 setOption 更新数据和配置项时用于指定对应的系列。
      layout: 'force', // force circular
      // coordinateSystem: null, // 坐标系可选
      // xAxisIndex: 0, // x轴坐标 有多种坐标系轴坐标选项
      // yAxisIndex: 0, // y轴坐标
      force: { // 力引导图基本配置
        initLayout: 'circular', // 力引导的初始化布局，默认使用xy轴的标点
        repulsion: echartsToPx(200), // 节点之间的斥力因子。支持数组表达斥力范围，值越大斥力越大。
        gravity: 0.5, // 节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
        edgeLength: [echartsToPx(10), echartsToPx(300)], // 边的两个节点之间的距离，这个距离也会受 repulsion影响 。值越大则长度越长
        layoutAnimation: false // 因为力引导布局会在多次迭代后才会稳定，这个参数决定是否显示布局的迭代动画
        // 在浏览器端节点数据较多（>100）的时候不建议关闭，布局过程会造成浏览器假死。
      },
      roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启，true 为都开启。如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move'
      scaleLimit: {
        max: 4,
        min: 0.5
      },
      nodeScaleRatio: 0.6, // 鼠标漫游缩放时节点的相应缩放比例，当设为0时节点不随着鼠标的缩放而缩放
      draggable: false, // 节点是否可拖拽，只在使用力引导布局的时候有用。
      symbol: 'circle', // 关系图节点标记的图形。
      // ECharts 提供的标记类型包括：'circle'(圆形), 'rect'（矩形）, 'roundRect'（圆角矩形）,
      // 'triangle'（三角形）, 'diamond'（菱形）, 'pin'（大头针）, 'arrow'（箭头）
      // 也可以通过 'image://url' 设置为图片，其中 url 为图片的链接。'path:// 这种方式可以任意改变颜色并且抗锯齿
      symbolSize: echartsToPx(10), // 也可以用数组分开表示宽和高，例如 [20, 10] 如果需要每个数据的图形大小不一样，
      // 可以设置为如下格式的回调函数：(value: Array|number, params: Object) => number|Array
      // symbolRotate:, // 关系图节点标记的旋转角度。注意在 markLine 中当 symbol 为 'arrow' 时会忽略 symbolRotate 强制设置为切线的角度。
      // symbolOffset:[0,0], // 关系图节点标记相对于原本位置的偏移。[0, '50%']
      edgeSymbol: ['none', 'none'], // 边两端的标记类型，可以是一个数组分别指定两端，也可以是单个统一指定。
      // 默认不显示标记，常见的可以设置为箭头，如下：edgeSymbol: ['circle', 'arrow']
      edgeSymbolSize: echartsToPx(8), // 边两端的标记大小，可以是一个数组分别指定两端，也可以是单个统一指定。
      itemStyle: {
        // borderType: 'solid', // 图形描边类型，默认为实线，支持 'solid'（实线）, 'dashed'(虚线), 'dotted'（点线）。
        borderColor: 'rgba(205, 149, 12, 0.4)', // 设置图形边框为淡金色,透明度为0.4
        borderWidth: 0, // 图形的描边线宽。为 0 时无描边。
        opacity: 1, // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5
        shadowBlur: echartsToPx(5),
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowOffsetY: echartsToPx(3),
        shadowOffsetX: echartsToPx(3)
        // color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
        //   offset: 0,
        //   color: '#fff'
        // }, {
        //   offset: 0.3,
        //   color: '#1ffdfd'
        // }, {
        //   offset: 1,
        //   color: '#096869'
        // }])
      },
      lineStyle: { // ========关系边的公用线条样式。
        width: echartsToPx(2), // 线的粗细
        color: 'source',
        curveness: 0.5, // 线条的曲线程度，从0到1
        opacity: 0.6 // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5
      },
      label: { // ========结点图形上的文本标签
        show: true, // 是否显示标签。
        position: 'inside', // 标签的位置。['50%', '50%'] [x,y]
        color: '#333', // 字体颜色 #cde6c7 #d1c7b7 #d9d6c3 #d3d7d4
        fontWeight: 'normal', // 'normal'标准，'bold'粗的，'bolder'更粗的，'lighter'更细的，或100 | 200 | 300 | 400...
        fontSize: echartsToPx(12) // 字体大小
      },
      edgeLabel: { // ========连接线上的文本标签
        show: false // 不显示连接线上的文字，如果显示只能显示结点的value值，而不是连接线的值
      },
      emphasis: {
        focus: 'adjacency'
        // lineStyle: {
        //   width: echartsToPx(10)
        // }
      },
      data: nodes,
      links,
      categories
    }]
  }
}

