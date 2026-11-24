<template>
  <div class="barGraph">
    <div class="myEcharts" :id="'myEcharts' + props.index"></div>
  </div>
</template>

<script>
export default {
  name: 'BarGraph'
}
</script>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  index: Number
})
const dataArr = ref([
  [2, 3, 5, 6, 8, 7, 6],
  [2, 7, 10, 10, 8, 7, 2],
  [0, 3, 5, 6, 8, 7, 3],
  [0, 6, 0, 6, 0, 6, 0],
  [6, 10, 12, 2, 8, 6, 2],
  [2, 10, 5, 10, 2, 12, 6]
])
const myEcharts = echarts

const initChart = () => {
  // 基于准备好的dom，初始化echarts实例
  const chart = myEcharts.init(
    document.getElementById(`myEcharts${props.index}`),
    'purple-passion'
  )
  chart.setOption({
    // 设置图表的标题
    title: {
      // 设置标题文本
      text: '近7天进行中的任务趋势',
      left: 'left',
      textStyle: {
        fontWeight: 'normal',
        fontSize: '16px'
      }
    },
    grid: {
      bottom: '30px'
    },
    // 设置图表的 X 轴
    xAxis: {
      // 数据类型为离散的类目数据
      type: 'category',
      boundaryGap: false,
      // 设置 X 轴数据
      data: ['07-19', '07-20', '07-21', '07-22', '07-23', '07-24', '07-25']
    },
    // 设置提示框组件
    tooltip: {
      // 设置提示框的触发条件
      trigger: 'axis'
    },
    // 设置图表的 Y 轴
    yAxis: {
      // 数据类型为连续的数值数据
      type: 'value'
    },
    // 设置图表的图例
    series: [
      {
        // 图例中要展示的数据
        data: dataArr.value[props.index],
        // 设置图表的类型为折线图
        type: 'line',
        // 平滑曲线
        smooth: true,
        // 在顶部显示数据
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              formatter: '{c}'
            }
          }
        }
      }
    ]
  })
  // 大小自适应窗口大小变化
  window.onresize = () => {
    // 重置容器高宽
    chart.resize()
  }
}
// 挂载时初始化图表
onMounted(() => {
  initChart()
})
// 卸载时销毁图表
onUnmounted(() => {
  // 销毁图表
  myEcharts.dispose
})
</script>

<style scoped lang="scss">
.barGraph {
  .myEcharts {
    width: 100%;
    height: 100%;
  }
}
</style>
