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
        <el-scrollbar style="overflow: hidden; width: 100%; height: 100%;" @scroll="handleScroll" >
          <div class="scaleContainer" id="scaleContainer" >
            <VuePdfEmbed
              ref="vuePdfRef"
              :style="scale"
              :annotationLayer="true"
              @loaded="loaded"
              @loading-failed="loadingFailed"
              @progress="handleProgress"
              :source="state.configs"
            />
          </div>
        </el-scrollbar>
        <div class="loadingDiv" v-if="loadingFlag">
          <emptyContent :loading="loadingFlag"/>
        </div>
      </div>
      <div class="footer">
        <div class="pageContainer">
          <div class="pageNum" v-show="isShowPage"> <span class="current">{{ state.pageNum }}</span>/{{ state.numPages }}</div>
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
import { reactive, onMounted, computed, ref, nextTick } from 'vue'
import emptyContent from '@/components/medicalRecord/standardizedMedical/emptyContent.vue'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/style/index.css'
import 'vue-pdf-embed/dist/style/annotationLayer.css'
import 'vue-pdf-embed/dist/style/textLayer.css'
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
  }
})
const loadingFlag = ref(true)
const emits = defineEmits(['update:isPdf'])
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
const handleClose = () => {
  emits('update:isPdf', false)
}
// eslint-disable-next-line no-unused-vars
const scale = computed(() => `transform:scale(${state.scale}) ;transform-origin:left top;width:100%`)
function pageZoomOut() {
  if (state.scale < 4) {
    state.scale += 0.2
  }
}
function pageZoomIn() {
  if (state.scale > 1) {
    state.scale -= 0.2
  }
}
const scrollTop = ref({
  scrollTop: 0
})
const handleScroll = (val) => {
  scrollTop.value = val
  // const pageHeight = document.getElementById('scaleContainer').offsetHeight / state.numPages * state.scale
  // const pageNum = Math.round(val.scrollTop * state.scale / pageHeight) + 1
  // state.pageNum = pageNum > state.numPages ? state.numPages : pageNum
  // console.log('maxHeight.value', maxHeight.value)
  // const pageNum = Math.round(val.scrollTop * state.scale / maxHeight.value) + 1
  // state.pageNum = pageNum > state.numPages ? state.numPages : pageNum
  // console.log('这是啊哈', pageNum, state.numPages)
}
const loaded = (pdf) => {
  state.numPages = pdf.numPages
}
const loadingFailed = (err) => {
  console.log('加载失败', err)
  loadingFlag.value = false
  ElMessage.error('加载失败')
}
const pdfContainer = ref()
const maxHeight = ref(1)
state.pageNum = computed(() => {
  const pageNum = Math.round(scrollTop.value.scrollTop / (maxHeight.value * state.scale)) + 1
  return pageNum > state.numPages ? state.numPages : pageNum
})
const isShowPage = ref(false)
const handleProgress = (val) => {
  if (val.loaded * 2 >= val.total) {
    loadingFlag.value = false
  }
  if (val.loaded === val.total) {
    setTimeout(() => {
      nextTick(() => {
        isShowPage.value = true
        const pages = pdfContainer.value.querySelectorAll('.vue-pdf-embed__page')
        maxHeight.value = Math.max(...Array.from(pages).map(page => page.offsetHeight))
        pages.forEach(page => {
          page.style.height = `${maxHeight.value}px`
        })
      })
    })
  }
}
const vuePdfRef = ref(null)
const PDFDownload = () => {
  vuePdfRef.value.download(props.fileName)
}
onMounted(() => {
})
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
}
:deep(.vue-pdf-embed__page) {
  display: flex;
  align-items: center;
  background-color: var(--theme-card);
}
</style>
