import { useTimeoutFn } from '@/hooks/useTimeout'
import { tryOnUnmounted } from './tryOnUnmounted'
import { unref, nextTick, computed, ref, watch } from 'vue'
import lodash from 'lodash'
import { useEventListener } from '@/hooks/useEventListener'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
export function useEcharts(
  elRef,
  showExtension,
  theme = 'default',
  extensionDom
) {
  const getDarkMode = computed(() => {
    return theme
  })
  let chartInstance = null
  let resizeFn = resize
  const cacheOptions = ref({})
  let removeResizeFn = () => {}

  resizeFn = lodash.debounce(resize, 200)

  const getOptions = computed(() => {
    return {
      backgroundColor: 'transparent',
      ...cacheOptions.value
    }
  })

  function initCharts() {
    const el = unref(elRef)
    if (!el || !unref(el)) {
      return
    }

    chartInstance = echarts.init(el)
    // 设置triggerEvent: true之后，就可以给图表绑定事件，可支持事件有鼠标点击、悬停、移入、移出等，可以查询官方文档。下面方法是为了y轴文字过多时（有省略号），鼠标悬浮会显示完整文字
    if (showExtension) {
      // 监听轴标签的鼠标事件
      chartInstance.on('mouseover', (params) => {
        // 若想设置针对X轴的事件，if函数的条件可以为params.componentType == "xAxis"
        // 防止有不同的处理方式,暂时分开两个条件写
        if (params.componentType === 'yAxis') {
          // 鼠标悬停的位置为Y轴时，我们去获取刻度标签容器的dom
          extensionDom.value.style.top = (params.event.offsetY + 14) + 'px'
          extensionDom.value.style.left = (params.event.offsetX - 10) + 'px'
          // 设置display为显示
          extensionDom.value.style.display = 'inline-block'
          extensionDom.value.style.zIndex = 2000
          // 设置容器的内容为Y刻度标签的全称
          extensionDom.value.innerHTML = params.value
        } else if (params.componentType === 'xAxis') {
          extensionDom.value.style.display = 'inline-block'
          extensionDom.value.innerHTML = params.value
          extensionDom.value.classList.remove('rightDom')
          extensionDom.value.style.top = (params.event.offsetY + 14) + 'px'
          extensionDom.value.style.left = (params.event.offsetX - 10) + 'px'
          setTimeout(() => {
            // 判断元素是否溢出
            if (elRef.value.offsetWidth < (params.event.offsetX - 10 + extensionDom.value.offsetWidth)) {
              extensionDom.value.style.left = (elRef.value.offsetWidth - extensionDom.value.offsetWidth) + 'px'
              // extensionDom.value.classList.add('rightDom')
            } else {
              // extensionDom.value.classList.remove('rightDom')
            }
            extensionDom.value.style.zIndex = 2000
          })
        }
      })
      // 鼠标移出时，刻度标签容器隐藏
      chartInstance.on('mouseout', function (params) {
        if (params.componentType === 'yAxis') {
          extensionDom.value.style.zIndex = -1
          // 设置容器的内容为Y刻度标签的全称
          extensionDom.value.style.display = 'none'
        } else {
          extensionDom.value.style.zIndex = -1
          // 设置容器的内容为Y刻度标签的全称
          extensionDom.value.style.display = 'none'
        }
      })
    }

    const { removeEvent } = useEventListener({
      el: window,
      name: 'resize',
      listener: resizeFn
    })
    removeResizeFn = removeEvent
    if (el.offsetHeight === 0) {
      useTimeoutFn(() => {
        resizeFn()
      }, 30)
    }
  }

  function setOptions(options, clear = true) {
    cacheOptions.value = options
    if (unref(elRef)?.offsetHeight === 0) {
      useTimeoutFn(() => {
        setOptions(unref(getOptions))
      }, 30)
      return
    }
    nextTick(() => {
      useTimeoutFn(() => {
        if (!chartInstance) {
          initCharts()
          if (!chartInstance) return
        }

        clear && chartInstance?.clear()
        chartInstance?.setOption(unref(getOptions))
      }, 30)
    })
  }

  function resize() {
    chartInstance?.resize()
  }

  watch(
    () => getDarkMode.value,
    () => {
      if (chartInstance) {
        chartInstance.dispose()
        initCharts()
        setOptions(cacheOptions.value)
      }
    }
  )
  // onUnmounted(() => {
  //   if (!chartInstance) return
  //   removeResizeFn()
  //   chartInstance.dispose()
  //   chartInstance = null
  // })
  tryOnUnmounted(() => {
    if (!chartInstance) return
    removeResizeFn()
    chartInstance.dispose()
    chartInstance = null
  })

  function getInstance() {
    if (!chartInstance) {
      initCharts()
    }
    return chartInstance
  }

  return {
    setOptions,
    resize,
    echarts,
    getInstance
  }
}
