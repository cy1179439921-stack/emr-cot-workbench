<template>
  <div class="dataOverview">
    <div class="chart-box" ref="chartRef"></div>
    <!-- id为extension的div为待会要显示/隐藏刻度标签名字的容器，需设置display: none，以及在css中设置容器的其他样式 -->
    <div id="extension" ref="extensionDom" class="tooltipDiv" v-if="showExtension">
    </div>
  </div>

</template>
<script setup>
import { ref, watch, toRaw } from 'vue'
import { useEcharts } from '@/hooks/useEcharts.js'
const chartRef = ref(null)
const props = defineProps({
  option: {
    type: Object,
    default: () => {
      return {}
    }
  },
  // 是否显示
  showExtension: {
    type: Boolean,
    default: false
  },
  // 改变option,是否需要重新绘制图，如改变top等
  needResize: {
    type: Boolean,
    default: false
  }
})
const extensionDom = ref(null)
const { setOptions, resize, getInstance } = useEcharts(chartRef, props.showExtension, '', extensionDom)

watch(
  () => props.option,
  () => {
    props.option && setOptions(toRaw(props.option))
    if (props.needResize) {
      resize()
    }
  },
  {
    deep: true,
    immediate: true
  }
)
// eslint-disable-next-line no-undef
// window.addEventListener('resize', chartInstance.resize)
// eslint-disable-next-line no-unused-vars
const updateCharts = () => {
  setOptions(toRaw(props.option))
}
const getInstanceFn = () => {
  return getInstance()
}
const getBasePng = () => {
  return getInstanceFn().getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
}

defineExpose({ getInstanceFn, getBasePng })
</script>
<style lang="scss" scoped>
.dataOverview {
  position: relative;
  width: 100%;
  height: 100%;
  .chart-box {
    width: 100%;
    height: 100%;
  }
  &_row {
    display: grid;
    margin-top: 24px;
    grid-template-columns: 1fr 1fr;
    gap: 21px;
  }
  &_col {
    display: flex;
    height: 90px;
    padding: 15px;
    border-radius: 6px;
    h2 {
      margin-bottom: 4px;
      font-weight: bold;
      font-size: 23px;
      color: #fff;
    }
    p {
      margin: 0;
      font-weight: 300;
      font-size: 12px;
      color: #fff;
    }
  }
}
//这些都是刻度标签容器的固定样式，可以写在css中，使js的部分可以专注处理逻辑
.tooltipDiv {
  display: none;
  position: absolute;
  top: -20px;
  // z-index: 3000;
  z-index: -1;
  padding: 6px 8px;
  border-radius: 4px;
  background-color: #333;
  font-size: 14px;
  color: white;
  &::before {
    position: absolute;
    left: 6px;
    top: -8px;
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-bottom: 15px solid #333;
    content: '';
  }
}
:deep(.echartToolTip) {
  div {
    font-size: 16px !important;
  }
}
  </style>

