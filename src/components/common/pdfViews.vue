<!-- eslint-disable no-unused-vars -->
<template>
  <div class="pdfPreview" v-bind="$attrs">
    <div class="content" >
      <div class="header">
        <div class="title">{{ fileName }}</div>
        <el-button link type="primary" @click="PDFDownload" style="display: none;">文件下载</el-button>
        <div class="close" @click="handleClose">
          <i class="iconfont icon-dankuang-shanchu"></i>
        </div>
      </div>
      <div class="pdfContainer" id="pdfContainer" ref="pdfContainer">
        <el-scrollbar wrap-class="pdf-scrollbar" @scroll="handleScroll">
          <div class="scaleContainer" id="scaleContainer" :style="scale" >
            <!-- <VuePdfEmbed
              ref="vuePdfRef"
              :style="scale"
              :annotationLayer="true"
              @loaded="loaded"
              @loading-failed="loadingFailed"
              @progress="handleProgress"
              :source="state.configs"
            /> -->
            <div v-for="pageNum in pageNums" :key="pageNum" ref="pageRefs" class="itemPdfPage" >
              <vue-pdf-embed
                cMapUrl="/cmaps/"
                cMapPacked="true"
                v-if="pageVisibility[pageNum]"
                :source="doc"
                :page="pageNum"
              />
              <div class="pageInfo" v-if="showPage">
                {{ pageNum}} / {{ state.numPages }}
              </div>
            </div>
          </div>
        </el-scrollbar>
        <div class="loadingDiv" v-if="loadingFlag">
          <emptyContent :loading="loadingFlag"/>
        </div>
      </div>
      <div class="footer">
        <div class="pageContainer">
          <div class="pageNum"> <span class="current">{{ state.pageNum }}</span>/{{ state.numPages }}</div>
        </div>
        <div class="page-tool-item flexCenter" @click="pageZoomIn">
          <i class="iconfont icon-suoxiao"></i>
        </div>
        <div class="page-tool-item flexCenter" @click="pageZoomOut">
          <i class="iconfont icon-fangda"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
// eslint-disable-next-line no-unused-vars
import { reactive, onMounted, computed, ref, nextTick, watch, onUnmounted } from 'vue'
import emptyContent from '@/components/medicalRecord/standardizedMedical/emptyContent.vue'
import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/style/index.css'
import 'vue-pdf-embed/dist/style/annotationLayer.css'
import 'vue-pdf-embed/dist/style/textLayer.css'
// eslint-disable-next-line no-unused-vars
import { echartsToPx } from '@/utils/utils'
import { ElMessage } from 'element-plus'
const props = defineProps({
  pdfUrl: {
    type: String,
    required: true,
    default: ''
  },
  fileName: {
    type: String,
    default: 'pdf'
  },
  isPdf: {
    type: Boolean,
    default: false
  },
  showPage: {
    type: Boolean,
    default: false
  }
})
const pageRefs = ref([])
const pageVisibility = ref({})
let pageIntersectionObserver

const { doc } = useVuePdfEmbed({
  source: {
    cMapUrl: '/cmaps/',
    // cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/cmaps/',
    cMapPacked: true,
    url: props.pdfUrl
  },
  onProgress: (val) => {
    if (val.loaded * 2 >= val.total) {
      loadingFlag.value = false
    }
  },
  onError: (err) => {
    console.log('加载失败', err)
    loadingFlag.value = false
    ElMessage.error('加载失败')
  }
})

const pageNums = computed(() =>
  doc.value
    ? [...Array(doc.value.numPages + 1).keys()].slice(1)
    : []
)
const state = reactive({
  source: props.pdfUrl, // 预览pdf文件地址
  pageNum: 1, // 当前页面
  scale: 1, // 缩放比例
  numPages: 0, // 总页数
  pdfDoc: '',
  configs: {
    cMapUrl: '/cmaps/',
    // cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/cmaps/',
    cMapPacked: true,
    url: props.pdfUrl
  }
})
// const isInit = ref(true)
onUnmounted(() => {
  pageIntersectionObserver?.disconnect()
})
const pdfContainer = ref()
const isInit = ref(true)
// eslint-disable-next-line no-unused-vars
const getAdaptiveThreshold = () => {
  const page = pdfContainer.value?.querySelector('.vue-pdf-embed__page')
  const container = pdfContainer.value?.querySelector('.el-scrollbar__wrap') // 实际滚动容器
  if (!page || !container) return 0.5
  // 关键修改：使用容器高度而非窗口高度
  const pageVisibleRatio = container.clientHeight / (page.offsetHeight * state.scale * state.scale)
  return Math.min(0.8 / state.scale / state.scale, Math.max(0.2 / state.scale / state.scale, pageVisibleRatio * 0.8 / state.scale / state.scale))
}

const resetPageIntersectionObserver = () => {
  pageIntersectionObserver?.disconnect()
  pageIntersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // const scaledRatio = entry.intersectionRatio
      if (entry.isIntersecting) {
        const index = pageRefs.value.indexOf(entry.target)
        const pageNum = pageNums.value[index]
        pageVisibility.value[pageNum] = true
        pageVisibility.value[pageNum + 1] = true
        if (isInit.value) {
          console.log('不加载')
        } else {
          if (scrollDirection.value === 'down') {
            state.pageNum = index < 1 ? 1 : index + 1
          } else {
            console.log('向下翻页')
            state.pageNum = index < 1 ? 1 : index + 1
          }
        }
      } else {
        isInit.value = false
      }
    })
  },
  {
    root: pdfContainer.value.querySelector('.el-scrollbar')
    // threshold: 0.1 / state.scale / state.scale // 至少0.8可见,并且缩放的时候要重复计算宽高,所以除两次,
    // threshold: getAdaptiveThreshold()
    // rootMargin: `0px 0px -${echartsToPx(200 / state.scale)}px 0px` // 底部预留200px缓冲区域
  })
  pageRefs.value.forEach((element) => {
    pageIntersectionObserver.observe(element)
  })
}

watch(pageNums, (newPageNums) => {
  state.numPages = newPageNums.length
  state.pageNum = 1
  pageVisibility.value = { [newPageNums[0]]: true }
  nextTick(resetPageIntersectionObserver)
})

const loadingFlag = ref(true)
const emits = defineEmits(['update:isPdf'])

const handleClose = () => {
  emits('update:isPdf', false)
}
const scale = computed(() => `transform:scale(${state.scale}) ;transform-origin:left top;width:100%`)
function pageZoomOut() {
  if (state.scale < 4) {
    state.scale += 0.2
    nextTick(() => {
      resetPageIntersectionObserver()
    })
  }
}
function pageZoomIn() {
  if (state.scale > 1) {
    state.scale -= 0.2
    nextTick(() => {
      resetPageIntersectionObserver()
    })
  }
}
const lastScrollTop = ref(0)
const scrollDirection = ref('down')
const handleScroll = (event) => {
  const scrollTop = event.scrollTop // 获取当前滚动位置
  scrollDirection.value = scrollTop > lastScrollTop.value ? 'down' : 'up' // 判断滚动方向
  lastScrollTop.value = scrollTop // 更新上一次的滚动位置
}
// const handleProgress = (val) => {
//   if (val.loaded * 2 >= val.total) {
//     loadingFlag.value = false
//   }
// }
const vuePdfRef = ref(null)
const PDFDownload = () => {
  vuePdfRef.value.download(props.fileName)
}
</script>
<style lang="scss" scoped>

.pdfPreview {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  padding: 20px 0;
  background: rgb(66, 66, 66);
  background-color: rgba(0, 0, 0, 0.2);
  &.pdf-box {
    position: inherit;
    width: 100%;
    height: 100%;
    padding: 0;
    background-color: var(--theme-card);
    .content {
      width: 100%;
      height: 100%;
      .header {
        padding: 16px;
      }
      .footer {
        padding: 6px 16px;
        .pageContainer {
          .pageNum {
            font-size: 14px;
          }
        }
      }
    }
  }
  .content {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    align-items: center;
    width: 50%;
    height: calc(100% - 40px);
    margin: 0 auto;
    border-radius: 6px;
    background-color: var(--theme-card);
  }
  .pdfContainer {
    overflow: hidden;
    position: relative;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    .loadingDiv {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-color: var(--theme-card);
    }
    .scaleContainer {
      width: 100%;
      min-height: 100%;
      >.itemPdfPage {
        min-height: 40vh;
        .pageInfo {
          // display: none;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 40px;
          // background-color: var(--theme-primary-soft);
          background-color: var(--theme-primary);
          color: #fff;
        }
      }
    }
  }
  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 24px;
    border-bottom: 1px solid #ccc;
    :deep(.el-button) {
      margin-right: 20px;
    }
    .title {
      flex: 1;
      line-height: 24px;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-text);
    }
    .close {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 32px;
      i {
        // opacity: 0.45;
        font-size: 14px;
        color: var(--theme-text-3);
      }
    }
  }

  .footer {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 18px 24px;
    border-top: 1px solid #ccc;
    .pageContainer {
      display: flex;
      align-items: center;
      flex: 1;
    }
    .pageNum {
      line-height: 24px;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-text-2);
      .current {
        color: var(--theme-primary);
      }
    }
  }
}

.page-tool {
  display: flex;
  position: absolute;
  bottom: 20px;
  z-index: 100;
  align-items: center;
  width: 90%;
  margin: 0 auto;
  margin-left: 50%;
  padding-left: 15px;
  padding-right: 15px;
  border-radius: 19px;
  background: rgb(66, 66, 66);
  cursor: pointer;
  color: white;
  transform: translateX(-50%);
}

.page-tool-item {
  width: 32px;
  height: 32px;
  margin-left: 8px;
  border-radius: 2px;
  background-color: var(--theme-primary-soft);
  // padding: 8px 15px;
  cursor: pointer;
  i {
    font-size: 32px;
  }
}
:deep(.vue-pdf-embed canvas) {
  width: 100% !important;
  // border-bottom: 10px solid var(--theme-primary);
}
:deep(.vue-pdf-embed__page) {
  display: flex;
  align-items: center;
  background-color: var(--theme-card);
}
</style>
