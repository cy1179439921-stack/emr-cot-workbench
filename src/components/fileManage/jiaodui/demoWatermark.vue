<template>
  <div class="demo-watermark" :style="watermarkStyle" />
</template>

<script>
export default { name: 'DemoWatermark' }
</script>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 水印文案，如「张慧敏 3704**********6728」
  text: { type: String, default: '' }
})

// 把文案渲染成可平铺的 SVG 背景：斜向、浅灰、不遮挡内容
const svg = computed(() => {
  const escaped = String(props.text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const content = `
    <svg xmlns="http://www.w3.org/2000/svg" width="520" height="280">
      <text x="30" y="200" transform="rotate(-22 30 200)"
        fill="rgba(31,45,61,0.085)"
        font-size="21"
        font-weight="500"
        letter-spacing="0.5"
        font-family="PingFang SC, Microsoft YaHei, sans-serif">${escaped}</text>
    </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`
})

// 平铺背景：同一段文案按 520×280 重复
const watermarkStyle = computed(() => ({
  backgroundImage: `url("${svg.value}")`
}))
</script>

<style scoped>
.demo-watermark {
  position: absolute;
  z-index: 30;
  inset: 0;
  background-repeat: repeat;
  pointer-events: none;
  user-select: none;
}
</style>
