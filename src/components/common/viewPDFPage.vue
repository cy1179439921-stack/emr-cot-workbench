<template>
  <div class="viewPDFPage" v-if="!isPdf">
    <div class="centerImgTop">
      <h2>原始病历</h2>
      <div class="page-tool-item" v-if="!isCoordinates">
        <div class="totalPDFBtn flexCenter" @click="viewPDF">完整原始病历</div>
        <div class="flexCenter" @click="pageRotate"><i class="iconfont icon-a-xuanzhuan1"></i></div>
        <div class="flexCenter" @click="pageZoomIn"><i class="iconfont icon-suoxiao"></i></div>
        <div class="flexCenter" @click="pageZoomOut"><i class="iconfont icon-fangda"></i></div>
        <div class="flexCenter" @click="autoPage('autoHeight')"><i class="iconfont icon-gaoduzishiying"></i></div>
        <div class="flexCenter" @click="autoPage('autoWidth')"><i class="iconfont icon-kuanduzishiying"></i></div>
      </div>
    </div>
    <div class='pdfDiv' :class="autoPageWay" ref="pdfContainer" v-if="medicalPageList.length > 0">
      <VuePdfEmbed
        :source="state.configs"
        ref='pdfRef'
        :page="currentPage"
        :style='scale'
        :rotation="state.rotation"
        @rendered="onPdfLoaded"
        :class="{ 'pdf-loading': pdfLoading }"
      >

      </VuePdfEmbed>
      <div class="frameDom" ref="frameDom"></div>
      <div class="loadingDiv" v-if="pdfLoading">
        <emptyContent :loading="pdfLoading"/>
      </div>
    </div>
    <div class="bottom" v-if="medicalPageList.length > 0">
      <div class="page-div">
        <span class="current-page">{{curMedicalPageIndex}}/</span>
        <span class="total-page">{{ isCoordinates?pageNumbers :medicalPageList.length}}</span>
      </div>
      <div class="btn-div">
        <el-button @click="changePage(-1)">上一页</el-button>
        <div class="pageCount">第{{currentPage}}页</div>
        <el-button type="primary" @click="changePage(1)">下一页</el-button>
      </div>
    </div>
    <div class="empty" v-if="medicalPageList.length === 0">
      <emptyContent/>
    </div>
  </div>
  <pdfViews class="pdf-box" :pdfUrl="pdfUrl" v-model:isPdf='isPdf' :fileName="fileName" v-if="isPdf" :showPage="true" :key="pdfUrl"></pdfViews>
</template>
<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import emptyContent from '@/components/medicalRecord/standardizedMedical/emptyContent.vue'
import { useMedicalStore } from '@/store/medicalStore'
const frameDom = ref()
const emits = defineEmits(['changePage'])
const props = defineProps({
  pdfUrl: {
    type: String,
    default: ''
  },
  renderTimes: {
    type: Number
  },
  fileName: {
    type: String
  },
  defaultIsPdfValue: {
    type: Boolean,
    default: false
  },
  isCoordinates: {
    type: Boolean,
    default: false
  }

})
const medicalStore = useMedicalStore()
const medicalPageList = computed(() => medicalStore.medicalPageList)
const isPdf = ref(props.defaultIsPdfValue)
const curMedicalPageIndex = ref(1)
const currentPage = ref(1)
const pdfLoading = ref(true)
const pdfContainer = ref()
if (!props.isCoordinates) {
  currentPage.value = Number(medicalPageList.value[curMedicalPageIndex.value - 1]) + 1
}

const scale = computed(() => {
  return `transform:scale(${state.scale}); transform-origin:left top`
})
// 记录上一次的 pdfUrl，用于判断是否真正发生了变化
const lastPdfUrl = ref(props.pdfUrl)
watch(() => props.renderTimes, (newVal, oldVal) => {
  // 只有当 renderTimes 变化 且 pdfUrl 也变化时，才重新加载 PDF
  // handleNodeClick 只会改变 renderTimes，不会改变 pdfUrl，所以不会触发重新加载
  if (newVal !== oldVal && props.pdfUrl !== lastPdfUrl.value) {
    console.log('pdfUrl 变化，重新加载 PDF')
    lastPdfUrl.value = props.pdfUrl
    state.configs.url = props.pdfUrl
    pdfLoading.value = true
  }
})
watch(medicalPageList, (newVal, oldVal) => {
  // 判断新数组与旧数组是否相等
  if (newVal.join(',') !== oldVal.join(',')) {
    // 相同页码不需要重新渲染
    if (currentPage.value !== Number(newVal[0]) + 1) {
      pdfLoading.value = true
    }
    currentPage.value = Number(newVal[0]) + 1
    curMedicalPageIndex.value = 1
  }
})
watch(() => currentPage.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    medicalStore.setCurrentPage(newVal)
  }
})
const state = reactive({
  scale: 1,
  rotation: 0,
  configs: {
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    url: props.pdfUrl
  }
})
// 页面缩放
const pageZoomOut = async () => {
  if (state.scale < 4) {
    state.scale += 0.2
    centerHorizontalScrollbar()
  }
}

// 页面缩放
const pageZoomIn = async () => {
  if (state.scale > 0.5) {
    state.scale -= 0.2
    centerHorizontalScrollbar()
  }
}

// 页面缩放
const centerHorizontalScrollbar = () => {
  nextTick(() => {
    if (pdfContainer.value) {
      const scrollLeft = (pdfContainer.value.scrollWidth - pdfContainer.value.clientWidth) / 2
      pdfContainer.value.scrollLeft = scrollLeft
    }
  })
}
// 页面旋转
const pageRotate = async () => {
  if (state.rotation < 270) {
    state.rotation += 90
  } else {
    state.rotation = 0
  }
}
const changePage = (value) => {
  if (props.isCoordinates) {
    frameDom.value.style.left = 10000 + 'px'
    if (value === 1 && currentPage.value < pageNumbers.value) {
      pdfLoading.value = true
      currentPage.value += 1
      curMedicalPageIndex.value += 1
    } else if (value === -1 && currentPage.value > 1) {
      pdfLoading.value = true
      currentPage.value -= 1
      curMedicalPageIndex.value -= 1
    }

    return
  }
  if (value === -1 && curMedicalPageIndex.value > 1) {
    // 上一页
    curMedicalPageIndex.value -= 1
    pdfLoading.value = true

    currentPage.value = Number(medicalPageList.value[curMedicalPageIndex.value - 1]) + 1
  } else if (value === 1 && curMedicalPageIndex.value < medicalPageList.value.length) {
    // 下一页
    curMedicalPageIndex.value += 1
    pdfLoading.value = true
    currentPage.value = Number(medicalPageList.value[curMedicalPageIndex.value - 1]) + 1
  }
  // emits('changePage', currentPage.value)
}
const pdfRef = ref()
const pageNumbers = ref(0)
// 监听pdf的加载状态
const onPdfLoaded = (info) => {
  // console.log('渲染完毕', pdfRef.value.doc.numPages)
  pageNumbers.value = pdfRef.value.doc.numPages
  pdfLoading.value = false
  emits('changePage', currentPage.value)
}
// 原始病历
const viewPDF = () => {
  isPdf.value = true
}
// pdf页面自适应方式
const autoPageWay = ref('autoHeight')
const autoPage = (val) => {
  autoPageWay.value = val
  state.scale = 1
  centerHorizontalScrollbar()
}
defineExpose({
  currentPage,
  frameDom,
  changePage
})
</script>
<style lang="scss" scoped>
.viewPDFPage {
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .centerImgTop {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 55px;
    // margin-bottom: 9px;
    h2 {
      margin: 0;
      padding-left: 16px;
      line-height: 52px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
    .page-tool-item {
      display: flex;
      margin-right: 4px;
      div {
        width: 32px;
        height: 32px;
        margin-right: 8px;
        border-radius: 2px;
        background: var(--theme-primary-soft);
        cursor: pointer;
        &.totalPDFBtn {
          width: 116px;
        }
      }
      i {
        font-size: 32px;
        color: var(--theme-text-2);
        &.icon-a-xuanzhuan1 {
          font-size: 16px;
        }
      }
    }
  }
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    margin-bottom: 65px;
  }
  .pdfDiv {
    overflow: auto;
    overflow-x: auto;
    position: relative;
    // position: relative;
    flex: 1;
    width: 100%;
    padding-bottom: 0;

    @include scrollBarStyle;
    :deep(.vue-pdf-embed) {
      flex: 1;
      height: 100%;
      &.pdf-loading {
        visibility: hidden;
      }
      div {
        height: 100%;
        .vue-pdf-embed__page {
          height: 100%;
          canvas {
            // width: auto !important;
            // height: 100% !important;
            // height: auto !important;
            margin: 0 auto;
          }
        }
      }
    }
    .loadingDiv {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
    .frameDom {
      display: none;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 10;
      width: 0;
      height: 0;
      border: 4px solid red;
      border-radius: 2px;
    }
    &.autoHeight {
      :deep(.vue-pdf-embed) {
        div {
          .vue-pdf-embed__page {
            canvas {
              width: auto !important;
              height: 100% !important;
            }
          }
        }
      }
    }
    &.autoWidth {
      :deep(.vue-pdf-embed) {
        div {
          .vue-pdf-embed__page {
            canvas {
              width: 100% !important;
              height: auto !important;
            }
          }
        }
      }
    }
  }
  .bottom {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 55px;
    box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.1);
    .page-div {
      position: absolute;
      left: 16px;
      .current-page {
        color: var(--theme-primary);
      }
      .total-page {
        color: var(--theme-text-2);
      }
    }
    .btn-div {
      display: flex;
      align-items: center;
      .pageCount {
        display: flex;
        justify-content: center;
        width: 100px;
        font-size: 16px;
      }
    }
  }
  :deep(.el-image-viewer__wrapper:focus) {
    outline: none;
  }
  :deep(.el-image-viewer__wrapper) {
    left: 328px !important;
    right: 521px !important;
    top: 180px !important;
    bottom: 40px !important;
    z-index: 1 !important;
    width: calc(100% - 950px) !important;
    height: auto;
    margin: 0 auto;
    .el-image-viewer__mask,
    .el-image-viewer__close {
      display: none;
    }
    .el-image-viewer__canvas {
      overflow: hidden;
    }
    .el-image-viewer__actions {
      position: absolute;
      left: auto;
      right: -33px;
      top: -49px;
      width: 72px;
      padding: 0;
      background: none;
      .el-image-viewer__actions__inner {
        i:nth-child(1),
        i:nth-child(2) {
          color: #959595;
        }
        i:nth-child(3),
        i:nth-child(4),
        i:nth-child(5),
        i:nth-child(6),
        i:nth-child(7) {
          display: none;
        }
      }
    }
  }
}
</style>
