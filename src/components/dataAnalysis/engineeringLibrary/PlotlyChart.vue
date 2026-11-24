<template>
  <div class="resultTitle flexBetween">
    <span v-if="item.customName || item.customName === ''">{{ item.customName }}</span>
    <span v-else>{{ index + 1 }}. {{ item.name }}</span>
    <span class="spanCopy" @click="downloadGraph2('resultGraph' + index, item, index)" v-if="item.data?.length > 0 || item.imgUrl"><i class="iconfont icon-daochu2"></i>下载</span>
  </div>
  <div class="resultGraph cardBg">
    <div class="graphDiv" :id="'resultGraph' + index" v-if="item.data?.length > 0 || item.imgUrl">
      <div ref="chartContainer" id='plotly-chart' class='chartContainer' v-show="item.data?.length > 0 && !item.plotlyBase64"></div>
      <img crossOrigin="anonymous" class="plotlyBase64" :src="item.plotlyBase64" v-if="item.plotlyBase64"/>
      <img crossOrigin="anonymous" :src="item.imgUrl" v-if="item.imgUrl"/>
    </div>
    <div :class="(item.data?.length > 0 || item.imgUrl) ? 'title3' : ''" v-if="!item.hiddenStatement">图表说明：</div>
    <div class="titleText3" v-if="!item.hiddenStatement">
      <ul>
        <li v-for="(item, index) in item.statement" :key="index">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'PlotlyChart',
  inheritAttrs: false
})
import { ref, onMounted, watch, nextTick } from 'vue'
import Plotly from 'plotly.js-dist'
import { ElLoading } from 'element-plus'
import $ from 'jquery'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import lodash from 'lodash'
import { nowDate } from '@/utils/utils'
// import $ from 'jquery'
const props = defineProps({
  pageId: {
    type: String
  },
  currentNode: {
    type: Object,
    required: true
  },
  item: {
    type: Object,
    default: () => ({})
  },
  index: {
    type: Number,
    default: 0
  },
  data: {
    type: Array,
    required: true
  },
  layout: {
    type: Object,
    default: () => ({})
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

const chartContainer = ref(null)
const renderChart = () => {
  nextTick(() => {
    const layout = lodash.cloneDeep(props.layout)
    // console.log('layout', layout)
    // console.log('data', props.data)
    layout.autosize = true
    delete layout.width
    delete layout.height
    layout.responsive = true
    layout.hoverlabel = { bgcolor: '#565b66', bordercolor: '#565b66', font: { color: '#fff' }}
    // if (chartContainer.value) {
    //   Plotly.newPlot(chartContainer.value, props.data, layout, { ...props.options, responsive: true })
    // }
    const MAX_TITLE_LENGTH = 20
    // 处理 legend 超长
    props.data.forEach(trace => {
      if (trace.name?.length > MAX_TITLE_LENGTH) {
        trace.text = trace.name
        trace.name = trace.name.slice(0, MAX_TITLE_LENGTH)
      }
      if (trace.x) {
        trace.x = trace.x.map(item => {
          if (typeof item === 'string' && item.length > MAX_TITLE_LENGTH) {
            return item.slice(0, MAX_TITLE_LENGTH) + '...' // 截取并返回新的字符串
          }
          return item // 如果不是字符串，直接返回原值
        })
        // console.log('trace.x', trace.x)
      }
      if (trace.y) {
        trace.y = trace.y.map(item => {
          if (typeof item === 'string' && item.length > MAX_TITLE_LENGTH) {
            return item.slice(0, MAX_TITLE_LENGTH) + '...' // 截取并返回新的字符串
          }
          return item // 如果不是字符串，直接返回原值
        })
        // console.log('trace.y', trace.y)
      }
    })
    // 处理 title 超长
    if (layout.title?.text?.length > MAX_TITLE_LENGTH) {
      layout.title.fullText = layout.title.text // 存完整标题
      layout.title.text = layout.title.text.slice(0, MAX_TITLE_LENGTH) + '...' // 截取
    }
    // 处理X轴超长
    if (layout.xaxis?.title?.text?.length > MAX_TITLE_LENGTH) {
      layout.xaxis.title.fullText = layout.xaxis.title.text // 存完整标题
      layout.xaxis.title.text = layout.xaxis.title.text.slice(0, MAX_TITLE_LENGTH) + '...' // 截取
    }
    // 处理Y轴超长
    if (layout.yaxis?.title?.text?.length > MAX_TITLE_LENGTH) {
      layout.yaxis.title.fullText = layout.yaxis.title.text // 存完整标题
      layout.yaxis.title.text = layout.yaxis.title.text.slice(0, MAX_TITLE_LENGTH) + '...' // 截取
    }
    // 处理3D图的X轴和Y轴文字过长
    if (layout.scene?.xaxis?.title?.text?.length > MAX_TITLE_LENGTH) {
      layout.scene.xaxis.title.fullText = layout.scene?.xaxis.title.text // 存完整标题
      layout.scene.xaxis.title.text = layout.scene?.xaxis.title.text.slice(0, MAX_TITLE_LENGTH) + '...' // 截取
    }
    if (layout.scene?.yaxis?.title?.text?.length > MAX_TITLE_LENGTH) {
      layout.scene.yaxis.title.fullText = layout.scene?.yaxis.title.text // 存完整标题
      layout.scene.yaxis.title.text = layout.scene?.yaxis.title.text.slice(0, MAX_TITLE_LENGTH) + '...' // 截取
    }
    if (chartContainer.value) {
      Plotly.newPlot(chartContainer.value, props.data, layout, { ...props.options, responsive: true })
    }
    // if (chartContainer.value) {
    //   Plotly.newPlot(chartContainer.value, props.data, layout, { ...props.options, responsive: true }).then(() => {
    //     setTimeout(() => {
    //       document.querySelectorAll('.legendtext').forEach((el, index) => {
    //         if (!el.querySelector('title')) { // 避免重复添加
    //           const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    //           title.textContent = props.data[index].text || props.data[index].name
    //           el.appendChild(title)
    //         }
    //       })
    //     }, 500)
    //   })
    // }
  })
}
onMounted(() => {
  renderChart()
})
// 监听 props 数据的变化，重新渲染图表
watch([() => props.data, () => props.layout], renderChart)
const downloadGraph2 = (id, item, index) => {
  const loading = ElLoading.service({
    lock: true,
    text: '下载中',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  // 加300ms延迟是解决loading出来的慢的问题
  setTimeout(() => {
    nextTick(() => {
      console.log('chartContainer.value', chartContainer.value)
      const element2 = document.querySelector(`#${props.pageId} #${id} .svg-container`)
      Plotly.toImage(chartContainer.value, { format: 'svg', width: element2.clientWidth }).then(data => {
        item.plotlyBase64 = data
        nextTick(() => {
          const element = document.querySelector(`#${props.pageId} #${id}`)
          html2canvas(element).then(async canvas => {
            try {
              canvas.toBlob(function (blob) {
                fileDownload(blob, `${props.currentNode.name}_${item.name}_${nowDate()}.png`)
                item.plotlyBase64 = ''
              })
            } catch (err) {
              console.error(err.name, err.message)
            }
            $(`#${props.pageId} #${id}`).css('width', 'auto')
            loading.close()
          })
        })
      })
    })
  }, 300)
}
const plotlyToImg = (id, index) => {
  return new Promise(resolve => {
    nextTick(() => {
      const element = !index ? document.querySelector(`#${id} .svg-container`) : document.querySelector(`#${id} #resultGraph${index} .svg-container`)
      Plotly.toImage(chartContainer.value, { format: 'svg', width: element.clientWidth }).then(data => {
        resolve(data)
      })
    })
  })
}
defineExpose({
  plotlyToImg
})
</script>
<style scoped lang="scss">
.title3 {
  margin-top: 16px;
}
.resultGraphChild {
  box-sizing: border-box;
  margin-top: 16px;
  padding: 16px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  background-color: var(--theme-bg)#fafafa;
}
.chartContainer {
  width: 100%;
  :deep(.plot-container) {
    display: flex;
    justify-content: center;
    align-items: center;
    .svg-container {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
