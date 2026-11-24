<template>
  <div class="screenshot-ocr">
    <el-button type="primary" @click="exportTemplate">导出模板</el-button>
    <el-button type="primary" @click="importTemplate">导入模板</el-button>
    <el-button type="primary" @click="startScreenshot">日期截图</el-button>

    <div class="ocr-result">
      <el-input v-model="ocrText" type="textarea"></el-input>
      <div class="ocr-buttons">
        <el-button type="primary" @click="copyText">复制</el-button>
      </div>
    </div>

    <!-- 截图遮罩层 -->
    <div
      v-if="isScreenshotMode"
      class="screenshot-overlay"
      @mousedown="startSelection"
      @mousemove="updateSelection"
      @mouseup="finishSelection"
      @mouseleave="cancelSelection"
    >
      <div v-if="isDrawing" class="selection-box" :style="selectionBoxStyle"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import Tesseract from 'tesseract.js'
import { copy } from '@/utils/utils.js'
const isScreenshotMode = ref(false)
const isDrawing = ref(false)
const selection = reactive({ startX: 0, startY: 0, endX: 0, endY: 0 })
const ocrText = ref('')

function copyText() {
  if (!ocrText.value) return
  const cleanedText = ocrText.value.trim()
  copy(cleanedText)
}

function startScreenshot() {
  ocrText.value = ''
  isScreenshotMode.value = true
  isDrawing.value = false
}

function startSelection(e) {
  if (e.button !== 0) return // 只响应左键
  isDrawing.value = true
  // 使用 clientX/Y（视口坐标），稍后会加上 scroll 进行映射
  selection.startX = e.clientX
  selection.startY = e.clientY
  selection.endX = e.clientX
  selection.endY = e.clientY
}

function updateSelection(e) {
  if (!isDrawing.value) return
  selection.endX = e.clientX
  selection.endY = e.clientY
}

function cancelSelection() {
  // 鼠标离开时取消
  isDrawing.value = false
  isScreenshotMode.value = false
}

const selectionBoxStyle = computed(() => {
  const left = Math.min(selection.startX, selection.endX)
  const top = Math.min(selection.startY, selection.endY)
  const width = Math.abs(selection.endX - selection.startX)
  const height = Math.abs(selection.endY - selection.startY)
  return {
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px'
  }
})

async function finishSelection() {
  if (!isDrawing.value) return
  isDrawing.value = false
  isScreenshotMode.value = false

  const startX_client = Math.min(selection.startX, selection.endX)
  const startY_client = Math.min(selection.startY, selection.endY)
  const width_client = Math.abs(selection.endX - selection.startX)
  const height_client = Math.abs(selection.endY - selection.startY)

  if (width_client < 8 || height_client < 8) {
    isScreenshotMode.value = false
    return
  }

  // 页面滚动偏移
  const scrollX = window.scrollX || document.documentElement.scrollLeft || 0
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0

  // 隐藏遮罩层（防止覆盖目标），但仍保留它的引用以便恢复
  const overlayEl = document.querySelector('.screenshot-overlay')
  if (overlayEl) overlayEl.style.display = 'none'

  // 等下一次 DOM 更新
  await nextTick()

  // 生成 canvas：使用 devicePixelRatio 以获得高分辨率图像，确保 windowWidth/Height 覆盖整个文档
  const dpr = window.devicePixelRatio || 1
  const docEl = document.documentElement
  const docScrollW = Math.max(docEl.scrollWidth, docEl.clientWidth)
  const docScrollH = Math.max(docEl.scrollHeight, docEl.clientHeight)

  const canvas = await html2canvas(document.body, {
    scale: dpr, // 使用设备像素比
    useCORS: true,
    backgroundColor: null,
    ignoreElements: (el) => el === overlayEl,
    windowWidth: docScrollW,
    windowHeight: docScrollH
  })

  // 恢复遮罩层显示
  if (overlayEl) overlayEl.style.display = ''

  // const ctx = canvas.getContext('2d')

  // 计算 canvas 与文档坐标的比例（横纵分别计算以应对非均匀缩放）
  const ratioX = canvas.width / docScrollW
  const ratioY = canvas.height / docScrollH

  // 页面坐标（client + scroll） -> 文档坐标
  const cropDocX = startX_client + scrollX
  const cropDocY = startY_client + scrollY

  // 将文档坐标映射到 canvas 像素坐标
  const cropCanvasX = Math.round(cropDocX * ratioX)
  const cropCanvasY = Math.round(cropDocY * ratioY)
  const cropCanvasW = Math.round(width_client * ratioX)
  const cropCanvasH = Math.round(height_client * ratioY)

  // 安全边界检查（防止超出）
  const safeW = Math.max(0, Math.min(cropCanvasW, canvas.width - cropCanvasX))
  const safeH = Math.max(0, Math.min(cropCanvasH, canvas.height - cropCanvasY))
  if (safeW <= 0 || safeH <= 0) {
    isScreenshotMode.value = false
    ocrText.value = '(截取区域超出画布或太小)'
    return
  }

  // 从 canvas 上裁剪（使用 drawImage 更可靠于 getImageData）
  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = safeW
  cropCanvas.height = safeH
  const cropCtx = cropCanvas.getContext('2d')
  // drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  cropCtx.drawImage(
    canvas,
    cropCanvasX,
    cropCanvasY,
    safeW,
    safeH,
    0,
    0,
    safeW,
    safeH
  )

  const imgData = cropCanvas.toDataURL('image/png')

  // OCR识别
  // ocrText.value = '识别中，请稍候...'
  try {
    const result = await Tesseract.recognize(imgData, 'chi_sim+eng', {})
    // ocrText.value = result.data.text || '(未识别到文字)'
    // 判断日期格式，都自动转为YYYY-MM-DD HH:mm:ss格式
    ocrText.value = formatOCRDate(result.data.text)
    // 自动复制到剪切板
    copy(ocrText.value)
  } catch (err) {
    ocrText.value = '识别失败：' + err.message
  } finally {
    isScreenshotMode.value = false
  }
}
function formatOCRDate(input, validate = false) {
  if (!input || typeof input !== 'string') return null

  // 统一分隔符，将 . 或多余空格转为 -
  const val = input.trim()
    .replace(/[./]/g, '-') // . 或 / -> -
    .replace(/\s*-\s*/g, '-') // 去掉 - 前后空格
    .replace(/\s+/g, ' ') // 多余空格 -> 1 个空格

  // 提取数字序列
  const nums = val.match(/\d{1,4}/g)
  if (!nums || nums.length < 3) {
    return input
  }

  // 年、月、日
  let [y, m, d, hh, mm, ss] = nums
  if (y.length === 2) y = '20' + y
  m = (m ?? '1').padStart(2, '0')
  d = (d ?? '1').padStart(2, '0')
  hh = (hh ?? '00').padStart(2, '0')
  mm = (mm ?? '00').padStart(2, '0')
  ss = (ss ?? '00').padStart(2, '0')

  const formatted = `${y}-${m}-${d} ${hh}:${mm}:${ss}`

  if (validate) {
    const date = new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}`)
    const isValid =
      !isNaN(date.getTime()) &&
      date.getFullYear() === Number(y) &&
      date.getMonth() + 1 === Number(m) &&
      date.getDate() === Number(d)
    if (!isValid) return null
  }

  return formatted
}
const exportTemplate = () => {
  // 剔除localStorage中key值不含有"山东省千佛山医院"的数据
  const newLocalStorage = {}
  for (const key in localStorage) {
    if (key.includes('山东省千佛山医院')) {
      newLocalStorage[key] = localStorage[key]
    }
  }
  const data = JSON.stringify(newLocalStorage)
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'qfs.txt' // 你可以设置任何你想要的下载文件名
  link.click()
  link.remove()
}
const importTemplate = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt'
  input.onchange = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsText(file, 'utf-8')
    reader.onload = (e) => {
      const data = e.target.result
      const obj = JSON.parse(data)
      for (const key in obj) {
        localStorage.setItem(key, obj[key])
      }
      ElMessage.success('导入成功')
    }
  }
  input.click()
}
</script>

<style scoped>
.screenshot-ocr {
  display: flex;
  display: none;
  width: 800px;
}
.screenshot-overlay {
  position: fixed;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.18);
  cursor: crosshair;
  user-select: none;
  inset: 0;
}
.selection-box {
  position: absolute;
  border: 2px dashed #42b983;
  background-color: rgba(66, 185, 131, 0.12);
}
.ocr-result {
  display: flex;
  flex: 1;
  white-space: pre-wrap;
  .ocr-buttons {
    display: flex;
    flex-direction: column;
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
button { padding: 6px 10px; }
</style>
