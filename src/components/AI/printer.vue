<template>
  <div class="preview-container">
    <div ref="previewElement" class="preview-content" v-html="displayedContent"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  previewContent: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    default: 50 // 控制渲染速度（毫秒）
  }
})

const emit = defineEmits(['complete'])

const displayedContent = ref('')
const previewElement = ref(null)

onMounted(() => {
  const content = props.previewContent
  const segments = []
  let lastIndex = 0

  // 正则匹配 HTML 标签（如 <h2>、</h2>、<br> 等）
  const htmlTagRegex = /<[^>]+>/g
  let match

  // 分割内容为普通文本和 HTML 标签
  while ((match = htmlTagRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: content.slice(lastIndex, match.index)
      })
    }
    segments.push({
      type: 'html',
      value: match[0]
    })
    lastIndex = match.index + match[0].length
  }

  // 添加剩余内容
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      value: content.slice(lastIndex)
    })
  }

  // 逐步渲染
  let segmentIndex = 0
  const renderNextSegment = () => {
    if (segmentIndex >= segments.length) {
      emit('complete')
      return
    }

    const segment = segments[segmentIndex]
    if (segment.type === 'text') {
      // 普通文本逐字符输出
      let charIndex = 0
      const textInterval = setInterval(() => {
        if (charIndex < segment.value.length) {
          displayedContent.value += segment.value.charAt(charIndex)
          charIndex++
          scrollToBottom()
        } else {
          clearInterval(textInterval)
          segmentIndex++
          renderNextSegment()
        }
      }, props.speed)
    } else {
      // HTML 标签一次性输出
      displayedContent.value += segment.value
      scrollToBottom()
      segmentIndex++
      renderNextSegment()
    }
  }

  // 开始渲染
  renderNextSegment()
})

const scrollToBottom = () => {
  if (previewElement.value) {
    previewElement.value.scrollTop = previewElement.value.scrollHeight
  }
}
</script>

<style>
.preview-container {
  border-radius: 4px;
}

.preview-content {
  white-space: pre-wrap;
}

.preview-content h2 {
  margin: 15px 0;
  font-size: 1.5em;
  color: #222;
}

.preview-content br {
  display: block;
  margin: 5px 0;
  content: "";
}
</style>
